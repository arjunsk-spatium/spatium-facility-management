export default defineNuxtPlugin(async (nuxtApp) => {
  const tenantStore = useTenantStore();
  const { getCurrentTenantId } = useTenantService();

  const tenantId = getCurrentTenantId();
  await tenantStore.fetchTenant(tenantId);

  // Apply colors to CSS variables
  if (tenantStore.tenant) {
    const primary = tenantStore.tenant.colors.primary;
    // We can generate shades here if we had a utility, but for now let's set the main color
    // Since our CSS uses --color-primary-500 etc, we might need to update those.
    // However, updating individual shades is complex without a generator.
    // For this task, we will try to update the base variable if possible,
    // OR just update a specific variable that we will use for dynamic overrides.
    
    // Simplest approach: Update the --color-primary-500 and maybe others roughly.
    // Or assume the CSS should rely on a single variable for the main brand color?
    // Looking at main.css, it defines --color-primary-50 to 950.
    
    // Ideally we'd use a color generator (like polished or similar) to generate the palette.
    // For this MVP, let's just set the main 500 color and maybe a few others we use most.
    
    if (import.meta.client) {
        const root = document.documentElement;
        
        // Helper to darken a hex color (simple implementation)
        // Ideally we use a library, but for now we can rely on CSS color-mix or just set the main color
        // Since we are setting CSS variables, we can set 600/700 to use color-mix relative to 500 if the browser supports it?
        // Actually, let's just use the JS to set the same color for now to ensure it matches, 
        // or effectively use color-mix string if we can.
        
        root.style.setProperty('--color-primary-500', primary);
        
        // For 600 and 700, we want them slightly darker.
        // We can inject `color-mix` into the variable value itself!
        root.style.setProperty('--color-primary-600', `color-mix(in srgb, ${primary}, black 10%)`);
        root.style.setProperty('--color-primary-700', `color-mix(in srgb, ${primary}, black 20%)`);
        
        // Also update the shadow color variable if it exists or is used
        // transform hex to rgb for tailwind opacity utilities if needed?
        // Tailwind v4 variable usage is direct. 
    }
  }
});
