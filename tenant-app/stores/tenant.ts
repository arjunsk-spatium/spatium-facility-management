import { defineStore } from 'pinia';
import type { Tenant } from '../composables/tenantService';

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    tenant: null as Tenant | null,
    loading: false,
    error: null as string | null,
  }),
  actions: {
    async fetchTenant(tenantId: string) {
      const { getTenantById } = useTenantService();
      this.loading = true;
      this.error = null;
      try {
        const tenant = await getTenantById(tenantId);
        this.tenant = tenant;
      } catch (e) {
        this.error = 'Failed to load tenant configuration';
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
  },
  getters: {
    primaryColor: (state) => state.tenant?.colors.primary || '#3378ff',
    secondaryColor: (state) => state.tenant?.colors.secondary || '#64748b',
    tenantName: (state) => state.tenant?.name || 'Spatium Hub',
    tenantLogo: (state) => state.tenant?.logoUrl || '',
  },
});
