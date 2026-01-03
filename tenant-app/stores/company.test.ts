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

// Mocking the service to avoid real delays and logic
vi.mock('../composables/companyService', () => ({
    useCompanyService: () => ({
        getCompanies: vi.fn(async () => [mockCompany]),
        getCompanyById: vi.fn(async (id) => ({ ...mockCompany, id })),
        createCompany: vi.fn(async (data) => ({ ...data, id: 'new-id' })),
        updateCompany: vi.fn(async (id, data) => ({ ...mockCompany, id, ...data })),
        getInsights: vi.fn(async () => ({ 
            totalCompanies: 10, 
            activeCompanies: 10, 
            inactiveCompanies: 0,
            revenue: 10000 
        }))
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
    })

    it('should fetch companies', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies()
        
        expect(store.companies.length).toBe(1)
        expect(store.companies[0].name).toBe('Tech Corp')
        expect(store.companies[0].spoc_name).toBe('John Smith')
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
        expect(store.insights?.totalCompanies).toBe(10)
        expect(store.insights?.activeCompanies).toBe(10)
    })
})
