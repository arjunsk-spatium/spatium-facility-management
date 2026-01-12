import { defineStore } from 'pinia'
import { useTenantService, type Tenant } from '../app/composables/tenantService'

export const useTenantStore = defineStore('tenant', {
    state: () => ({
        tenants: [] as Tenant[],
        currentTenant: null as Tenant | null,
        stats: {
            total: 0,
            active: 0,
            trial: 0,
            suspended: 0
        },
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchTenants() {
            this.loading = true
            this.error = null
            try {
                const { getTenants } = useTenantService()
                this.tenants = await getTenants()
            } catch (err) {
                this.error = 'Failed to fetch tenants'
            } finally {
                this.loading = false
            }
        },
        async fetchTenant(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getTenantById } = useTenantService()
                this.currentTenant = await getTenantById(id)
            } catch (err) {
                this.error = 'Failed to fetch tenant'
            } finally {
                this.loading = false
            }
        },
        async createTenantAction(data: Omit<Tenant, 'id' | 'createdAt'>) {
            this.loading = true
            this.error = null
            try {
                const { createTenant } = useTenantService()
                const newTenant = await createTenant(data)
                this.tenants.push(newTenant)
                return newTenant
            } catch (err) {
                this.error = 'Failed to create tenant'
                throw err
            } finally {
                this.loading = false
            }
        },
        async updateTenantAction(id: string, data: Partial<Omit<Tenant, 'id'>>) {
            this.loading = true
            this.error = null
            try {
                const { updateTenant } = useTenantService()
                const updated = await updateTenant(id, data)
                if (updated) {
                    const index = this.tenants.findIndex(t => t.id === id)
                    if (index !== -1) {
                        this.tenants[index] = updated
                    }
                    if (this.currentTenant?.id === id) {
                        this.currentTenant = updated
                    }
                }
                return updated
            } catch (err) {
                this.error = 'Failed to update tenant'
                throw err
            } finally {
                this.loading = false
            }
        },
        async deleteTenantAction(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deleteTenant } = useTenantService()
                const success = await deleteTenant(id)
                if (success) {
                    this.tenants = this.tenants.filter(t => t.id !== id)
                }
                return success
            } catch (err) {
                this.error = 'Failed to delete tenant'
                throw err
            } finally {
                this.loading = false
            }
        },
        async fetchStats() {
            try {
                const { getStats } = useTenantService()
                this.stats = await getStats()
            } catch (err) {
                console.error('Failed to fetch stats', err)
            }
        }
    }
})
