<template>
    <a-layout-sider v-model:collapsed="collapsed" collapsible :theme="isDark ? 'dark' : 'light'" width="260"
        class="custom-sidebar shadow-md z-10 transition-colors duration-300"
        :style="{ background: isDark ? '#1a1a1a' : '#ffffff', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }">
        <!-- Logo Section - Height matches navbar (64px) -->
        <div class="h-16 flex items-center px-6 border-b transition-colors duration-300"
            :style="{ background: isDark ? '#1a1a1a' : '#ffffff', borderColor: isDark ? '#333333' : '#e5e5e5' }">
            <div class="flex items-center gap-3">
                <!-- Tenant Logo -->
                <img v-if="tenantStore.tenantLogo" :src="tenantStore.tenantLogo" :alt="tenantStore.tenantName"
                    class="h-8 w-auto object-contain" />

                <!-- Fallback Icon -->
                <div v-else class="grid grid-cols-2 gap-1 w-8 h-8">
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

        <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" :theme="isDark ? 'dark' : 'light'"
            mode="inline" class="border-none px-3 pt-4 font-medium"
            :style="{ background: isDark ? '#1a1a1a' : '#ffffff' }">
            <!-- ... existing menu items ... -->
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
                <a-menu-item key="companies-list">
                    <NuxtLink to="/companies">All Companies</NuxtLink>
                </a-menu-item>
                <a-menu-item key="companies-create">
                    <NuxtLink to="/companies/create">Create Company</NuxtLink>
                </a-menu-item>
                <a-menu-item key="companies-insights">
                    <NuxtLink to="/companies/insights">Insights</NuxtLink>
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
    </a-layout-sider>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useTenantStore } from '../stores/tenant';
import { useTheme } from '../composables/useTheme';
import {
    AppstoreOutlined,
    BankOutlined,
    SettingOutlined,
    BarChartOutlined,
    UsergroupAddOutlined,
    CustomerServiceOutlined,
    HomeOutlined,
    SafetyCertificateOutlined,
    ShoppingCartOutlined
} from '@ant-design/icons-vue';

const { colorMode } = useTheme();
const tenantStore = useTenantStore();

// Compute isDark considering system mode
const isDark = computed(() => {
    if (colorMode.value === 'dark') return true;
    if (colorMode.value === 'light') return false;
    // For system mode, check actual preference
    if (import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
});

const collapsed = ref(false);
const selectedKeys = ref<string[]>(['dashboard']);
const openKeys = ref<string[]>(['companies']);
</script>

<style scoped>
/* ============================================
   GRAY DARK THEME OVERRIDES
   Use neutral grays instead of Ant Design's blue-tinted dark theme
   ============================================ */

/* Sidebar Container Background */
:deep(.ant-layout-sider) {
    background: #ffffff !important;
}

.dark :deep(.ant-layout-sider),
:deep(.ant-layout-sider-dark) {
    background: #1a1a1a !important;
    /* Dark gray, not blue */
}

/* Menu Background */
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
    /* neutral-400 */
}

:deep(.ant-menu-dark .ant-menu-item:hover),
:deep(.ant-menu-dark .ant-menu-submenu-title:hover) {
    background-color: #2a2a2a !important;
    /* Slightly lighter gray */
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

/* Collapse Trigger Button - Light mode */
:deep(.ant-layout-sider-light .ant-layout-sider-trigger) {
    background: #fafafa !important;
    color: #525252 !important;
    border-top: 1px solid #e5e5e5 !important;
}

/* Collapse Trigger Button - Dark mode (uses Ant Design's internal class) */
:deep(.ant-layout-sider-dark .ant-layout-sider-trigger) {
    background: #1a1a1a !important;
    color: #a3a3a3 !important;
    border-top: 1px solid #333333 !important;
}
</style>
