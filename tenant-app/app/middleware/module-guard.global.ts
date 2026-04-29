export default defineNuxtRouteMiddleware(async (to, from) => {
    // Skip if on server side or if not authenticated (auth middleware handles that)
    // We assume auth middleware runs before this or we check auth state here
    const authStore = useAuthStore();
    
    // Modules map path to module key
    // Note: /configure is not listed here because it's accessible to all authenticated users
    const moduleMap: Record<string, string> = {
        '/companies': 'companies',
        '/visitors': 'visitors',
        '/helpdesk': 'helpdesk',
        '/facilities': 'facilities',
        '/users': 'users',
        '/meeting-rooms': 'meeting_rooms',
        '/configure': 'configure',
        '/spoc': 'spoc_dashboard',
        '/spoc/config': 'spoc_config'
    };

    // Find matching restricted module
    const restrictedModuleKey = Object.keys(moduleMap).find(path => to.path.startsWith(path));

    if (restrictedModuleKey) {
        const requiredModule = moduleMap[restrictedModuleKey];
        
        // Ensure modules are loaded
        if (authStore.modules.length === 0) {
           await authStore.fetchModules();
        }

        if (requiredModule && !authStore.hasModule(requiredModule)) {
            // Redirect to dashboard or home if access denied
            return navigateTo('/dashboard');
        }
    }
});
