export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip if on server side or if not authenticated (auth middleware handles that)
    // We assume auth middleware runs before this or we check auth state here
    const authStore = useAuthStore();
    
    // Modules map path to module key
    // Note: /configure is not listed here because it's accessible to all authenticated users
    const moduleMap: Record<string, string> = {
        '/companies': 'companies',
        '/visitors': 'visitors',
        '/helpdesk/roles': 'helpdesk-roles',
        '/helpdesk': 'helpdesk',
        '/facilities': 'facilities',
        '/users/management': 'users-management',
        '/users/operational': 'users-operational',
        '/users': 'users',
        '/meeting-rooms': 'meeting_rooms',
        '/banners': 'banners',
        '/feed': 'feed-list',
        '/configure': 'configure',
        '/spoc': 'spoc_dashboard',
        '/spoc/config': 'spoc_config'
    };

    // Ensure modules are loaded
    if (authStore.modules.length === 0 && authStore.isAuthenticated) {
        await authStore.fetchModules();
    }

    // If SPOC accesses /dashboard, redirect to /spoc
    if (to.path === '/dashboard' || to.path === '/dashboard/') {
        if (authStore.isSpoc || (authStore.hasModule('spoc_dashboard') && !authStore.hasModule('dashboard'))) {
            return navigateTo('/spoc');
        }
    }

    // Find matching restricted module
    const restrictedModuleKey = Object.keys(moduleMap).find(path => to.path.startsWith(path));

    if (restrictedModuleKey) {
        const requiredModule = moduleMap[restrictedModuleKey];

        if (requiredModule && !authStore.hasModule(requiredModule)) {
            // Redirect to spoc for SPOC users, or dashboard for regular users
            if (authStore.isSpoc || authStore.hasModule('spoc_dashboard')) {
                return navigateTo('/spoc');
            }
            return navigateTo('/dashboard');
        }
    }
});
