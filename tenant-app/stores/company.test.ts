import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompanyStore } from './company'

// Mock company data matching new interface
const mockCompany = {
    id: '1',
    name: 'Tech Corp',
    address: '123 Tech Street, Bangalore',
    spoc_name: 'John Smith',
    spoc_email: 'john.smith@techcorp.com',
    spoc_phone: '+91 98765 43210',
    gstin: '29ABCDE1234F1ZH',
    facility: 'Facility 1'
}

const mockInsights = {
    summary: {
        total_companies: 10,
        active_companies: 10,
        inactive_companies: 0,
        total_revenue: 10000,
        new_last_30_days: 2
    },
    status_distribution: [
        { status: 'active', count: 10 },
        { status: 'inactive', count: 0 }
    ],
    revenue_trend: [
        { month: 'Jan 2026', month_key: '2026-01-01', revenue: 5000, growth_percentage: 0 },
        { month: 'Feb 2026', month_key: '2026-02-01', revenue: 5000, growth_percentage: 0 }
    ],
    top_companies_by_tickets: []
}

// Mocking the service to avoid real delays and logic
vi.mock('../composables/companyService', () => ({
    useCompanyService: () => ({
        getCompanies: vi.fn(async () => ({
            companies: [mockCompany],
            count: 1,
            next: null,
            previous: null
        })),
        getCompanyById: vi.fn(async (id) => ({ ...mockCompany, id })),
        createCompany: vi.fn(async (data) => ({ ...data, id: 'new-id' })),
        updateCompany: vi.fn(async (id, data) => ({ ...mockCompany, id, ...data })),
        getInsights: vi.fn(async () => mockInsights)
    })
}))

describe('Company Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('should initialize with empty state', () => {
        const store = useCompanyStore()
        expect(store.companies).toEqual([])
        expect(store.currentCompany).toBeNull()
        expect(store.loading).toBe(false)
        expect(store.page).toBe(1)
        expect(store.pageSize).toBe(10)
        expect(store.count).toBe(0)
    })

    it('should fetch companies', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies()
        
        expect(store.companies.length).toBe(1)
        expect(store.companies[0].name).toBe('Tech Corp')
        expect(store.companies[0].spoc_name).toBe('John Smith')
        expect(store.count).toBe(1)
        expect(store.page).toBe(1)
    })

    it('should go to page', async () => {
        const store = useCompanyStore()
        await store.goToPage(2)
        expect(store.page).toBe(2)
    })

    it('should fetch company by id', async () => {
        const store = useCompanyStore()
        await store.fetchCompany('1')
        
        expect(store.currentCompany).toBeDefined()
        expect(store.currentCompany?.name).toBe('Tech Corp')
        expect(store.currentCompany?.spoc_email).toBe('john.smith@techcorp.com')
    })
    
    it('should create company and add to list', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies() // Pre-fill list
        const initialLength = store.companies.length
        
        await store.createCompanyAction({ 
            name: 'New Corp', 
            address: '456 New Street',
            spoc_name: 'Jane Doe',
            spoc_email: 'jane@newcorp.com',
            spoc_phone: '+91 87654 32109'
        })
        
        expect(store.companies.length).toBeGreaterThan(initialLength)
        expect(store.companies.find(c => c.name === 'New Corp')).toBeDefined()
    })

    it('should update company', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies()
        
        await store.updateCompanyAction('1', { name: 'Updated Corp' })
        
        expect(store.companies[0].name).toBe('Updated Corp')
    })

    it('should fetch insights', async () => {
        const store = useCompanyStore()
        await store.fetchInsightsAction()
        
        expect(store.insights).toBeDefined()
        expect(store.insights?.summary.total_companies).toBe(10)
        expect(store.insights?.summary.active_companies).toBe(10)
    })
})
