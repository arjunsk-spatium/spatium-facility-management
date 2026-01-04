<template>
    <div class="flex flex-col h-full bg-inherit">
        <!-- Logo Section -->
        <div class="h-16 flex items-center px-6 border-b transition-colors duration-300 flex-shrink-0"
            :style="{ borderColor: isDark ? '#333333' : '#e5e5e5' }">
            <div class="flex items-center gap-3">
                <!-- Tenant Logo -->
                <img v-if="tenantStore.tenantLogo" :src="tenantStore.tenantLogo" :alt="tenantStore.tenantName"
                    class="h-8 w-auto object-contain" />

                <!-- Fallback Icon -->
                <div v-else class="grid grid-cols-2 gap-1 w-8 h-8 flex-shrink-0">
                    <div class="w-full h-full border-2 border-primary-600 dark:border-primary-400 rounded-sm"></div>
                    <div class="w-full h-full bg-primary-600 dark:bg-primary-400 rounded-sm"></div>
                    <div class="w-full h-full bg-primary-600 dark:bg-primary-400 rounded-sm"></div>
                    <div class="w-full h-full bg-primary-600 dark:bg-primary-400 rounded-sm"></div>
                </div>

                <!-- Tenant Name -->
                <div v-if="!collapsed" class="flex flex-col leading-none truncate max-w-[160px]">
                    <span class="text-lg font-bold text-neutral-900 dark:text-white truncate"
                        :title="tenantStore.tenantName">
                        {{ tenantStore.tenantName }}
                    </span>
                </div>
            </div>
        </div>

        <!-- Scrollable Menu Section -->
        <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" :theme="isDark ? 'dark' : 'light'"
            mode="inline" class="border-none px-3 pt-4 font-medium bg-inherit" :inline-collapsed="collapsed">

            <!-- Loading State -->
            <div v-if="isLoading" class="px-4 py-2 space-y-4">
                <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                <div class="h-8 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
            </div>

            <!-- Dynamic Menu Items -->
            <template v-for="key in userModules" :key="key">
                <template v-if="moduleConfig[key]">
                    <!-- Submenu -->
                    <a-sub-menu v-if="moduleConfig[key].children" :key="key + '-submenu'">
                        <template #icon>
                            <component :is="moduleConfig[key].icon" class="text-lg" />
                        </template>
                        <template #title>{{ moduleConfig[key].label }}</template>
                        <a-menu-item v-for="child in moduleConfig[key].children" :key="child.key">
                            <NuxtLink v-if="child.route" :to="child.route">{{ child.label }}</NuxtLink>
                            <span v-else>{{ child.label }}</span>
                        </a-menu-item>
                    </a-sub-menu>

                    <!-- Single Item -->
                    <a-menu-item v-else :key="key + '-item'" class="mb-1 rounded-md">
                        <template #icon>
                            <component :is="moduleConfig[key].icon" class="text-lg" />
                        </template>
                        <NuxtLink v-if="moduleConfig[key].route" :to="moduleConfig[key].route">{{
                            moduleConfig[key].label }}</NuxtLink>
                        <span v-else>{{ moduleConfig[key].label }}</span>
                    </a-menu-item>
                </template>
            </template>
        </a-menu>
    </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTenantStore } from '../stores/tenant';
import { useTheme } from '../composables/useTheme';
import {
    BankOutlined,
    SettingOutlined,
    BarChartOutlined,
    UsergroupAddOutlined,
    CustomerServiceOutlined,
    HomeOutlined,
    SafetyCertificateOutlined,
    ShoppingCartOutlined,
    TeamOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{
    collapsed?: boolean;
}>();

const { colorMode } = useTheme();
const tenantStore = useTenantStore();
const route = useRoute();
const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);

// Compute isDark considering system mode
const isDark = computed(() => {
    if (colorMode.value === 'dark') return true;
    if (colorMode.value === 'light') return false;
    if (import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
});

// Module Configuration
const moduleConfig: Record<string, any> = {
    dashboard: { label: 'Dashboard', icon: BarChartOutlined, route: '/dashboard' },
    visitors: {
        label: 'Visitors',
        icon: UsergroupAddOutlined,
        children: [
            { key: 'visitors-insights', label: 'Insights', route: '/visitors/insights' },
            { key: 'visitors-list', label: 'All Visitors', route: '/visitors' }
        ]
    },
    companies: {
        label: 'Companies',
        icon: BankOutlined,
        children: [
            { key: 'companies-insights', label: 'Insights', route: '/companies/insights' },
            { key: 'companies-list', label: 'All Companies', route: '/companies' }
        ]
    },
    helpdesk: {
        label: 'Helpdesk',
        icon: CustomerServiceOutlined,
        children: [
            { key: 'helpdesk-insights', label: 'Insights', route: '/helpdesk/insights' },
            { key: 'helpdesk-tickets', label: 'Tickets', route: '/helpdesk' }
        ]
    },
    facilities: {
        label: 'Facilities',
        icon: HomeOutlined,
        children: [
            { key: 'facilities-insights', label: 'Insights', route: '/facilities/insights' },
            { key: 'facilities-list', label: 'All Facilities', route: '/facilities' }
        ]
    },
    users: { label: 'User Module Management', icon: TeamOutlined, route: '/users' },
    settings: { label: 'Configuration', icon: SettingOutlined, route: '/settings' }
};

// Map routes to menu keys
const updateMenuState = () => {
    const path = route.path;

    // Default to dashboard
    if (path === '/' || path === '/dashboard') {
        selectedKeys.value = ['dashboard'];
        return;
    }

    // Companies
    if (path.includes('/companies')) {
        openKeys.value = ['companies'];
        if (path.includes('/insights')) {
            selectedKeys.value = ['companies-insights'];
        } else if (path.includes('/create')) {
            selectedKeys.value = [];
        } else {
            selectedKeys.value = ['companies-list'];
        }
        return;
    }

    // Helpdesk
    if (path.includes('/helpdesk')) {
        openKeys.value = ['helpdesk'];
        if (path.includes('/tickets')) selectedKeys.value = ['tickets'];
        return;
    }

    // User Manager
    if (path.includes('/users')) {
        openKeys.value = ['users'];
        if (path.includes('/list')) selectedKeys.value = ['users-list'];
        return;
    }

    // Other top-level items
    if (path.includes('/calendar')) selectedKeys.value = ['calendar'];
    if (path.includes('/visitors')) selectedKeys.value = ['visitors'];
    if (path.includes('/facilities')) selectedKeys.value = ['facilities'];
    if (path.includes('/settings')) selectedKeys.value = ['settings'];
};

// Use modules from auth store
const authStore = useAuthStore();
const isLoading = ref(true);

// Watch store modules to update UI
const userModules = computed(() => authStore.modules);

onMounted(async () => {
    // Fetch if empty
    if (authStore.modules.length === 0) {
        try {
            await authStore.fetchModules();
        } catch (error) {
            console.error('Failed to fetch user modules', error);
        }
    }
    // We can assume loading is handled by initial state or we can add isLoading state to store if needed.
    // For now, we just wait for fetch.
    isLoading.value = false;
});

// Update on mount and route change
watch(() => route.path, updateMenuState, { immediate: true });
</script>

<style scoped>
/* Copied styles from Sidebar.vue specifically for menu items */

/* Menu Background - inherit to be transparent over parent */
:deep(.ant-menu) {
    background: transparent !important;
}

:deep(.ant-menu-dark) {
    background: transparent !important;
}

/* Dark Mode Menu Items */
:deep(.ant-menu-dark .ant-menu-item),
:deep(.ant-menu-dark .ant-menu-submenu-title) {
    color: #a3a3a3 !important;
}

:deep(.ant-menu-dark .ant-menu-item:hover),
:deep(.ant-menu-dark .ant-menu-submenu-title:hover) {
    background-color: #2a2a2a !important;
    color: #f5f5f5 !important;
}

/* Selected Item - Primary Color */
:deep(.ant-menu-item-selected) {
    background-color: color-mix(in srgb, var(--color-primary-500) 10%, transparent) !important;
    color: var(--color-primary-600) !important;
    border-radius: 6px;
}

:deep(.ant-menu-item-selected .anticon) {
    color: var(--color-primary-600) !important;
}

:deep(.ant-menu-dark .ant-menu-item-selected) {
    background-color: color-mix(in srgb, var(--color-primary-500) 20%, transparent) !important;
    color: #ffffff !important;
}

:deep(.ant-menu-dark .ant-menu-item-selected .anticon) {
    color: #ffffff !important;
}

/* Submenu Popup */
:deep(.ant-menu-dark .ant-menu-sub) {
    background: #1a1a1a !important;
}

/* Remove default border */
:deep(.ant-menu-item::after) {
    border-right: none !important;
}

/* Pill-style corners */
:deep(.ant-menu-submenu-title),
:deep(.ant-menu-item) {
    border-radius: 6px;
    margin-bottom: 4px;
}
</style>
