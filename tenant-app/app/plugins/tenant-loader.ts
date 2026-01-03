export default defineNuxtPlugin((nuxtApp) => {
  const tenantStore = useTenantStore();
  const { getCurrentTenantId } = useTenantService();

  const tenantId = getCurrentTenantId();
  // Start fetching without awaiting to allow app to mount and show loader
  tenantStore.fetchTenant(tenantId);
});

