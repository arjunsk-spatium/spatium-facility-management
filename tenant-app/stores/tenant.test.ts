import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTenantStore } from './tenant'

describe('Tenant Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('should initialize with null tenant', () => {
        const store = useTenantStore()
        expect(store.tenant).toBeNull()
    })

    it('should fetch and set tenant data', async () => {
        const store = useTenantStore()
        await store.fetchTenant('tenant-a')
        
        expect(store.tenant).toBeDefined()
        expect(store.tenant?.id).toBe('tenant-a')
        expect(store.tenantName).toBe('Acme Corp')
        expect(store.primaryColor).toBe('#3378ff')
    })

    it('should handle errors gracefully', async () => {
        const store = useTenantStore()
        // We know unknown-tenant returns null currently, 
        // effectively simulating a "not found" but not throwing
        // However, if we wanted to test error state, we might need to mock the service to throw
        
        await store.fetchTenant('unknown-tenant')
        expect(store.tenant).toBeNull() 
        // Current implementation doesn't set error string on null, checking loading state
        expect(store.loading).toBe(false)
    })
})
