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
        <div class="flex-1 overflow-y-auto overflow-x-hidden">
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
    </div>

</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useTenantStore } from '../stores/tenant';
import { useTheme } from '../composables/useTheme';
import { useUserService } from '../composables/userService';
import { useModuleRegistry, type Module } from '../composables/useModuleRegistry';
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
    AppstoreOutlined,
    DashboardOutlined
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
    'AppstoreOutlined': AppstoreOutlined,
    'DashboardOutlined': DashboardOutlined
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
    return allModules.value.map(m => {
        if (!userModuleKeys.value.includes(m.key)) return null;

        const mod = { ...m };
        if (mod.children) {
            mod.children = mod.children.filter(c => userModuleKeys.value.includes(c.key));
            
            // If the module originally had children but none are assigned, hide the entire module
            if (m.children && m.children.length > 0 && mod.children.length === 0) {
                return null;
            }
        }
        return mod;
    }).filter(Boolean) as Module[];
});

// Map routes to menu keys
// Find valid module for current route
const findActiveModule = (modules: Module[], currentPath: string): { selected: string | null, open: string | null } => {
    let bestMatch = {
        module: null as Module | null | any, // explicit any to avoid complex type checks in loop
        parent: null as Module | null,
        length: 0
    };

    const traverse = (list: Module[], parent: Module | null = null) => {
        for (const module of list) {
            // Check direct match
            if (module.route && currentPath.startsWith(module.route)) {
                if (module.route.length > bestMatch.length) {
                    bestMatch = { module, parent, length: module.route.length };
                }
            }

            // Traverse children
            if (module.children) {
                traverse(module.children as any, module);
            }
        }
    };

    traverse(modules);

    if (bestMatch.module) {
        return {
            selected: bestMatch.module.key,
            open: bestMatch.parent ? bestMatch.parent.key : null
        };
    }

    return { selected: null, open: null };
};

// Map routes to menu keys
const updateMenuState = () => {
    const path = route.path;

    // Default to dashboard
    if (path === '/' || path === '/dashboard') {
        selectedKeys.value = ['dashboard'];
        return;
    }

    const { selected, open } = findActiveModule(filteredModules.value, path);

    if (selected) {
        selectedKeys.value = [selected];
    }

    if (open) {
        openKeys.value = [open];
    }
};

// Hydrate API modules with Registry data (Icons, Routes, etc.)
const { getAllModules } = useModuleRegistry();
const registryModules = getAllModules();

const hydrateModules = (apiModules: Module[]): Module[] => {
    return apiModules.map(apiMod => {
        const registryMod = registryModules.find(r => r.key === apiMod.key);
        if (!registryMod) return apiMod;

        const hydrated: Module = {
            ...registryMod,
            ...apiMod,
            icon: apiMod.icon || registryMod.icon,
            route: apiMod.route || registryMod.route,
            label: apiMod.label || registryMod.label
        };

        if (apiMod.children && apiMod.children.length > 0) {
            hydrated.children = apiMod.children.map(child => {
                const regChild = registryMod.children?.find(c => c.key === child.key);
                if (!regChild) return child;
                return {
                    ...regChild,
                    ...child,
                    route: child.route || regChild.route,
                    label: child.label || regChild.label
                };
            });
        }

        return hydrated;
    });
};

onMounted(async () => {
    isLoading.value = true;
    try {
        // Fetch modules configuration from "API"
        const modulesFromApi = await getTenantModules();
        allModules.value = hydrateModules(modulesFromApi);

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
