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

            <!-- Dynamic Menu Items from API -->
            <template v-for="module in filteredModules" :key="module.key">
                <!-- Submenu -->
                <a-sub-menu v-if="module.children && module.children.length > 0" :key="module.key + '-submenu'">
                    <template #icon>
                        <component :is="getIconComponent(module.icon)" class="text-lg" />
                    </template>
                    <template #title>{{ module.label }}</template>
                    <a-menu-item v-for="child in module.children" :key="child.key">
                        <NuxtLink v-if="child.route" :to="child.route">{{ child.label }}</NuxtLink>
                        <span v-else>{{ child.label }}</span>
                    </a-menu-item>
                </a-sub-menu>

                <!-- Single Item -->
                <a-menu-item v-else :key="module.key + '-item'" class="mb-1 rounded-md">
                    <template #icon>
                        <component :is="getIconComponent(module.icon)" class="text-lg" />
                    </template>
                    <NuxtLink v-if="module.route" :to="module.route">{{ module.label }}</NuxtLink>
                    <span v-else>{{ module.label }}</span>
                </a-menu-item>
            </template>
        </a-menu>
    </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTenantStore } from '../stores/tenant';
import { useTheme } from '../composables/useTheme';
import { useUserService, type Module } from '../composables/userService';
import {
    BankOutlined,
    SettingOutlined,
    BarChartOutlined,
    UsergroupAddOutlined,
    CustomerServiceOutlined,
    HomeOutlined,
    SafetyCertificateOutlined,
    ShoppingCartOutlined,
    TeamOutlined,
    CalendarOutlined,
    AppstoreOutlined
} from '@ant-design/icons-vue';

const props = defineProps<{
    collapsed?: boolean;
}>();

const { colorMode } = useTheme();
const tenantStore = useTenantStore();
const route = useRoute();
const { getTenantModules } = useUserService();

const selectedKeys = ref<string[]>([]);
const openKeys = ref<string[]>([]);
const isLoading = ref(true);
const allModules = ref<Module[]>([]);

// Icon mapping - maps string icon names to actual components
const iconMap: Record<string, any> = {
    'BarChartOutlined': BarChartOutlined,
    'UsergroupAddOutlined': UsergroupAddOutlined,
    'BankOutlined': BankOutlined,
    'CustomerServiceOutlined': CustomerServiceOutlined,
    'HomeOutlined': HomeOutlined,
    'CalendarOutlined': CalendarOutlined,
    'TeamOutlined': TeamOutlined,
    'SettingOutlined': SettingOutlined,
    'SafetyCertificateOutlined': SafetyCertificateOutlined,
    'ShoppingCartOutlined': ShoppingCartOutlined,
    'AppstoreOutlined': AppstoreOutlined
};

const getIconComponent = (iconName?: string) => {
    if (!iconName) return BarChartOutlined;
    return iconMap[iconName] || BarChartOutlined;
};

// Compute isDark considering system mode
const isDark = computed(() => {
    if (colorMode.value === 'dark') return true;
    if (colorMode.value === 'light') return false;
    if (import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
});

// Use modules from auth store to filter which modules user has access to
const authStore = useAuthStore();
const userModuleKeys = computed(() => authStore.modules);

// Filter modules based on user's access
const filteredModules = computed(() => {
    return allModules.value.filter(m => userModuleKeys.value.includes(m.key));
});

// Map routes to menu keys
const updateMenuState = () => {
    const path = route.path;

    // Default to dashboard
    if (path === '/' || path === '/dashboard') {
        selectedKeys.value = ['dashboard-item'];
        return;
    }

    // Companies
    if (path.includes('/companies')) {
        openKeys.value = ['companies-submenu'];
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
        openKeys.value = ['helpdesk-submenu'];
        if (path.includes('/tickets')) selectedKeys.value = ['helpdesk-tickets'];
        else if (path.includes('/insights')) selectedKeys.value = ['helpdesk-insights'];
        else selectedKeys.value = ['helpdesk-tickets'];
        return;
    }

    // User Manager
    if (path.includes('/users')) {
        selectedKeys.value = ['users-item'];
        return;
    }

    // Other top-level items
    if (path.includes('/calendar')) selectedKeys.value = ['calendar-item'];
    if (path.includes('/visitors')) {
        openKeys.value = ['visitors-submenu'];
        if (path.includes('/insights')) selectedKeys.value = ['visitors-insights'];
        else selectedKeys.value = ['visitors-list'];
    }
    if (path.includes('/facilities')) {
        openKeys.value = ['facilities-submenu'];
        if (path.includes('/insights')) selectedKeys.value = ['facilities-insights'];
        else selectedKeys.value = ['facilities-list'];
    }
    if (path.includes('/meeting-rooms')) {
        openKeys.value = ['meeting_rooms-submenu'];
        if (path.includes('/bookings')) selectedKeys.value = ['meeting-rooms-bookings'];
        else if (path.includes('/insights')) selectedKeys.value = ['meeting-rooms-insights'];
        else selectedKeys.value = ['meeting-rooms-list'];
    }
    if (path.includes('/configure')) selectedKeys.value = ['configure-item'];
};

onMounted(async () => {
    isLoading.value = true;
    try {
        // Fetch modules configuration from "API"
        allModules.value = await getTenantModules();

        // Fetch user's module access if not already loaded
        if (authStore.modules.length === 0) {
            await authStore.fetchModules();
        }
    } catch (error) {
        console.error('Failed to fetch modules', error);
    } finally {
        isLoading.value = false;
    }
});

// Update on mount and route change
watch(() => route.path, updateMenuState, { immediate: true });
</script>

<style scoped>
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
