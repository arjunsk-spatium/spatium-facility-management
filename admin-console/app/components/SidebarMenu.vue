<template>
    <a-menu v-model:selectedKeys="selectedKeys" v-model:openKeys="openKeys" mode="inline" :inline-collapsed="collapsed"
        :theme="isDark ? 'dark' : 'light'" class="sidebar-menu">
        <!-- Dashboard -->
        <a-menu-item key="dashboard">
            <template #icon>
                <DashboardOutlined />
            </template>
            <NuxtLink to="/dashboard">Dashboard</NuxtLink>
        </a-menu-item>

        <!-- Tenants -->
        <a-sub-menu key="tenants">
            <template #icon>
                <TeamOutlined />
            </template>
            <template #title>Tenants</template>
            <a-menu-item key="tenants-list">
                <NuxtLink to="/tenants">All Tenants</NuxtLink>
            </a-menu-item>
            <a-menu-item key="tenants-create">
                <NuxtLink to="/tenants/create">Create Tenant</NuxtLink>
            </a-menu-item>
        </a-sub-menu>

        <!-- Plans -->
        <a-sub-menu key="plans">
            <template #icon>
                <CreditCardOutlined />
            </template>
            <template #title>Plans</template>
            <a-menu-item key="plans-list">
                <NuxtLink to="/plans">All Plans</NuxtLink>
            </a-menu-item>
            <a-menu-item key="plans-create">
                <NuxtLink to="/plans/create">Create Plan</NuxtLink>
            </a-menu-item>
        </a-sub-menu>

        <!-- Users -->
        <a-menu-item key="users">
            <template #icon>
                <UserOutlined />
            </template>
            <NuxtLink to="/users">Users</NuxtLink>
        </a-menu-item>

        <!-- Modules -->
        <a-menu-item key="modules">
            <template #icon>
                <AppstoreOutlined />
            </template>
            <NuxtLink to="/modules">Modules</NuxtLink>
        </a-menu-item>

        <!-- Settings -->
        <a-menu-item key="settings">
            <template #icon>
                <SettingOutlined />
            </template>
            <NuxtLink to="/settings">Settings</NuxtLink>
        </a-menu-item>
    </a-menu>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
    DashboardOutlined,
    TeamOutlined,
    CreditCardOutlined,
    AppstoreOutlined,
    SettingOutlined,
    UserOutlined
} from '@ant-design/icons-vue'
import { useSidebar } from '../composables/useSidebar'

const props = defineProps<{
    collapsed?: boolean
}>()

const route = useRoute()
const { isMobile } = useSidebar()
const { isDark } = useTheme()

const selectedKeys = ref<string[]>([])
const openKeys = ref<string[]>([])

// Map route paths to menu keys
const getMenuKey = (path: string) => {
    if (path === '/' || path === '/dashboard') return 'dashboard'
    if (path === '/tenants') return 'tenants-list'
    if (path === '/tenants/create') return 'tenants-create'
    if (path.startsWith('/tenants/')) return 'tenants-list'
    if (path === '/plans') return 'plans-list'
    if (path === '/plans/create') return 'plans-create'
    if (path.startsWith('/plans/')) return 'plans-list'
    if (path === '/users' || path.startsWith('/users/')) return 'users'
    if (path === '/modules') return 'modules'
    if (path === '/settings') return 'settings'
    return 'dashboard'
}

// Get parent menu key
const getParentKey = (key: string) => {
    if (key.startsWith('tenants')) return 'tenants'
    if (key.startsWith('plans')) return 'plans'
    return null
}

// Update selected keys based on route
watch(() => route.path, (path) => {
    const key = getMenuKey(path)
    selectedKeys.value = [key]

    const parentKey = getParentKey(key)
    if (parentKey && !openKeys.value.includes(parentKey)) {
        openKeys.value = [...openKeys.value, parentKey]
    }
}, { immediate: true })
</script>

<style scoped>
.sidebar-menu {
    border: none !important;
    height: 100%;
}

.sidebar-menu :deep(a) {
    color: inherit;
    text-decoration: none;
}

.sidebar-menu :deep(.ant-menu-item-selected a) {
    color: inherit;
}
</style>
