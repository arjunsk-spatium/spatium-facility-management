import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useCompanyStore } from './company'

// Mocking the service to avoid real delays and logic
vi.mock('../composables/companyService', () => ({
    useCompanyService: () => ({
        getCompanies: vi.fn(async () => [
            { id: '1', name: 'Store Test Corp', status: 'active' }
        ]),
        getCompanyById: vi.fn(async (id) => ({ id, name: 'Single Corp', status: 'active' })),
        createCompany: vi.fn(async (data) => ({ ...data, id: 'new-id', status: 'active' })),
        updateCompany: vi.fn(async (id, data) => ({ id, ...data })),
        getInsights: vi.fn(async () => ({ totalCompanies: 10, activeCompanies: 5, revenue: 5000 }))
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
        expect(store.companies[0].name).toBe('Store Test Corp')
    })

    it('should fetch company by id', async () => {
        const store = useCompanyStore()
        await store.fetchCompany('1')
        
        expect(store.currentCompany).toBeDefined()
        expect(store.currentCompany?.name).toBe('Single Corp')
    })
    
    it('should create company and add to list', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies() // Pre-fill list
        const initialLength = store.companies.length
        
        await store.createCompanyAction({ name: 'New Store Corp', address: '123' })
        
        // Our mock returns a new object, logic should likely add it to store
        // Need to check implementation details: does store update list or refetch?
        // Assuming we push to list for performance
        expect(store.companies.length).toBeGreaterThan(initialLength)
        expect(store.companies.find(c => c.name === 'New Store Corp')).toBeDefined()
    })

    it('should update company', async () => {
        const store = useCompanyStore()
        await store.fetchCompanies()
        
        // Mocking the service update
        await store.updateCompanyAction('1', { name: 'Updated Store Corp' })
        
        // Check if list is updated locally
        expect(store.companies[0].name).toBe('Updated Store Corp')
    })

    it('should fetch insights', async () => {
        const store = useCompanyStore()
        await store.fetchInsightsAction()
        
        expect(store.insights).toBeDefined()
        expect(store.insights?.totalCompanies).toBe(10)
    })
})
