<template>
    <div class="flex items-center justify-center min-h-screen">
        <a-spin size="large" tip="Redirecting..." />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';

const authStore = useAuthStore();

// Module Configuration Mapping (Simplified for Redirection)
const moduleConfig: Record<string, any> = {
    dashboard: { route: '/dashboard' },
    visitors: { route: '/visitors/insights' },
    companies: { route: '/companies/insights' },
    helpdesk: { route: '/helpdesk/insights' },
    facilities: { route: '/facilities/insights' },
    meeting_rooms: { route: '/meeting-rooms/insights' },
    users: { route: '/users' },
    settings: { route: '/settings' },
    spoc_dashboard: { route: '/spoc' }
};

onMounted(async () => {
    // Ensure modules are loaded
    if (authStore.modules.length === 0) {
        try {
            await authStore.fetchModules();
        } catch (error) {
            console.error('Failed to fetch modules for redirection', error);
        }
    }

    // Find the first available module
    const modules = authStore.modules;
    if (modules && modules.length > 0) {
        for (const moduleKey of modules) {
            const config = moduleConfig[moduleKey];
            if (config && config.route) {
                return navigateTo(config.route); // Redirect found
            }
        }
    } else {
        // Fallback or Handle No Modules
        console.warn('No modules assigned to user.');
    }

    // Fallback if no specific module matched or modules list empty (e.g., to login or handled by auth guard)
    // For now, we stay on this page which shows a spinner, or we could redirect to login?
    // navigateTo('/login'); 
});
</script>
