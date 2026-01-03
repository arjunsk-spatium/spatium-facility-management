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
        <div class="flex-1 overflow-y-auto">
            <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" :theme="isDark ? 'dark' : 'light'"
                mode="inline" class="border-none px-3 pt-4 font-medium bg-inherit" :inline-collapsed="collapsed">
                <!-- Dashboard -->
                <a-menu-item key="dashboard" class="mb-1 rounded-md">
                    <template #icon>
                        <BarChartOutlined class="text-lg" />
                    </template>
                    <NuxtLink to="/dashboard">Dashboard</NuxtLink>
                </a-menu-item>

                <a-menu-item key="visitors" class="mb-1 rounded-md">
                    <template #icon>
                        <UsergroupAddOutlined class="text-lg" />
                    </template>
                    <span>Visitors</span>
                </a-menu-item>

                <a-sub-menu key="companies">
                    <template #icon>
                        <BankOutlined class="text-lg" />
                    </template>
                    <template #title>Companies</template>
                    <a-menu-item key="companies-insights">
                        <NuxtLink to="/companies/insights">Insights</NuxtLink>
                    </a-menu-item>
                    <a-menu-item key="companies-list">
                        <NuxtLink to="/companies">All Companies</NuxtLink>
                    </a-menu-item>
                </a-sub-menu>

                <a-sub-menu key="helpdesk">
                    <template #icon>
                        <CustomerServiceOutlined class="text-lg" />
                    </template>
                    <template #title>Helpdesk</template>
                    <a-menu-item key="tickets">Tickets</a-menu-item>
                </a-sub-menu>

                <a-menu-item key="facilities" class="mb-1 rounded-md">
                    <template #icon>
                        <HomeOutlined class="text-lg" />
                    </template>
                    <span>Facilities</span>
                </a-menu-item>

                <a-sub-menu key="assets">
                    <template #icon>
                        <SafetyCertificateOutlined class="text-lg" />
                    </template>
                    <template #title>Assets</template>
                    <a-menu-item key="asset-list">All Assets</a-menu-item>
                </a-sub-menu>

                <a-sub-menu key="procurement">
                    <template #icon>
                        <ShoppingCartOutlined class="text-lg" />
                    </template>
                    <template #title>Procurement</template>
                    <a-menu-item key="orders">Orders</a-menu-item>
                </a-sub-menu>

                <a-menu-item key="settings" class="mb-1 rounded-md">
                    <template #icon>
                        <SettingOutlined class="text-lg" />
                    </template>
                    <NuxtLink to="/settings">Configurations</NuxtLink>
                </a-menu-item>
            </a-menu>
        </div>
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
    ShoppingCartOutlined
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

    // Assets
    if (path.includes('/assets')) {
        openKeys.value = ['assets'];
        if (path.includes('/list')) selectedKeys.value = ['asset-list'];
        return;
    }

    // Procurement
    if (path.includes('/procurement')) {
        openKeys.value = ['procurement'];
        if (path.includes('/orders')) selectedKeys.value = ['orders'];
        return;
    }

    // Other top-level items
    if (path.includes('/calendar')) selectedKeys.value = ['calendar'];
    if (path.includes('/visitors')) selectedKeys.value = ['visitors'];
    if (path.includes('/facilities')) selectedKeys.value = ['facilities'];
    if (path.includes('/settings')) selectedKeys.value = ['settings'];
};

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
