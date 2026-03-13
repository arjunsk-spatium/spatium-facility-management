export default defineNuxtPlugin((nuxtApp) => {
  const tenantStore = useTenantStore();

  // Start fetching without awaiting to allow app to mount and show loader
  tenantStore.fetchTenantByDomain();
});

