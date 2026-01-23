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
            console.log('fetchTenants: starting', { loading: this.loading });
            this.loading = true
            this.error = null
            try {
                const { getTenants } = useTenantService()
                // request now returns the data directly (or throws)
                const response = await getTenants()
                console.log('fetchTenants: received response', response);
                
                // Response is the raw JSON body
                if (response && response.success) {
                    const results = response.data?.results || [];
                    this.tenants = results
                    console.log('fetchTenants: updated tenants', this.tenants);
                } else {
                     this.tenants = [];
                     console.log('fetchTenants: no success in response');
                }
            } catch (err: any) {
                this.error = 'Failed to fetch tenants'
                console.error('fetchTenants: error', err)
            } finally {
                console.log('fetchTenants: finally block execution');
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
                const response = await createTenant(data) as any
                
                if (response && response.success) {
                    const newTenant = response.data
                    this.tenants.push(newTenant)
                    return newTenant
                }
                throw new Error('Failed to create tenant')
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
                const response = await updateTenant(id, data as { name: string, domain: string }) as any
                
                // Check for successful response
                // If the API returns the updated object directly or wrapped
                if (response && (response.success || response.id)) {
                    const updated = response.data || response
                    const index = this.tenants.findIndex(t => t.id === id)
                    if (index !== -1) {
                        this.tenants[index] = updated
                    }
                    if (this.currentTenant?.id === id) {
                        this.currentTenant = updated
                    }
                    return updated
                }
                return null
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
                    return true
                }
                throw new Error('Failed to delete tenant')
            } catch (err: any) {
                this.error = 'Failed to delete tenant'
                console.error(err)
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
