import { describe, it, expect } from 'vitest'
import { useTenantService } from './tenantService'

describe('Tenant Service', () => {
    const { getTenantById, getCurrentTenantId } = useTenantService()

    it('should retrieve keys for tenant-a', async () => {
        const tenant = await getTenantById('tenant-a')
        expect(tenant).toBeDefined()
        expect(tenant?.name).toBe('Acme Corp')
    })
    
    it('should retrieve keys for tenant-b', async () => {
        const tenant = await getTenantById('tenant-b')
        expect(tenant).toBeDefined()
        expect(tenant?.name).toBe('Globex')
    })

    it('should return null for unknown tenant', async () => {
        const tenant = await getTenantById('unknown-tenant')
        expect(tenant).toBeNull()
    })

    it('should get current tenant id', () => {
        // Since we are mocking the return value in the actual file for now
        const id = getCurrentTenantId()
        // It's currently hardcoded to tenant-b in the source
        expect(id).toBe('tenant-c')
    })
})
