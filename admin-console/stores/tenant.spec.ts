import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useTenantStore } from './tenant'

// Mock useTenantService
const mockGetTenants = vi.fn()
vi.mock('../app/composables/tenantService', () => ({
    useTenantService: () => ({
        getTenants: mockGetTenants
    })
}))

describe('Tenant Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        mockGetTenants.mockReset()
    })

    it('maps API response correctly to state', async () => {
        const store = useTenantStore()
        
        const mockResponse = {
            success: true,
            data: {
                results: [
                    {
                        id: 't1',
                        name: 'Test Tenant',
                        domain: 'test.com',
                        status: 'active',
                        active_plan: { name: 'Pro Plan' }, // Should map to planName
                        module_count: 5,                   // Should map to moduleCount
                        user_count: 10,                    // Should map to userCount
                        created_at: '2023-01-01',          // Should map to createdAt
                        modules: []
                    }
                ]
            }
        }

        mockGetTenants.mockResolvedValue(mockResponse)

        await store.fetchTenants()

        expect(store.tenants).toHaveLength(1)
        const tenant = store.tenants[0]
        
        expect(tenant.planName).toBe('Pro Plan')
        expect(tenant.moduleCount).toBe(5)
        expect(tenant.userCount).toBe(10)
        expect(tenant.createdAt).toBe('2023-01-01')
    })

    it('handles empty response gracefully', async () => {
        const store = useTenantStore()
        mockGetTenants.mockResolvedValue({ success: true, data: { results: [] } })

        await store.fetchTenants()
        expect(store.tenants).toHaveLength(0)
    })
})
