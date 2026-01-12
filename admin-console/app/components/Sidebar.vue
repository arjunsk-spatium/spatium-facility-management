<template>
    <!-- Desktop Sidebar -->
    <a-layout-sider v-if="!isMobile" v-model:collapsed="collapsed" :trigger="null" collapsible :width="240"
        :collapsed-width="80" class="sidebar-sider"
        :style="{ background: isDark ? '#141414' : '#ffffff', borderRight: `1px solid ${isDark ? '#303030' : '#f0f0f0'}` }">
        <!-- Logo -->
        <div class="sidebar-logo" :class="{ collapsed }">
            <div class="logo-icon">
                <AppstoreOutlined :style="{ fontSize: '24px', color: '#1677ff' }" />
            </div>
            <span v-if="!collapsed" class="logo-text">Admin Console</span>
        </div>

        <!-- Navigation Menu -->
        <SidebarMenu :collapsed="collapsed" />

        <!-- Collapse Toggle -->
        <div class="sidebar-footer">
            <a-button type="text" @click="toggleDesktopCollapse" class="collapse-btn">
                <MenuFoldOutlined v-if="!collapsed" />
                <MenuUnfoldOutlined v-else />
            </a-button>
        </div>
    </a-layout-sider>

    <!-- Mobile Drawer -->
    <a-drawer v-else :open="isOpen" placement="left" :closable="false" :width="280" @close="closeMobileSidebar"
        :body-style="{ padding: 0, background: isDark ? '#141414' : '#ffffff' }">
        <!-- Logo -->
        <div class="sidebar-logo">
            <div class="logo-icon">
                <AppstoreOutlined :style="{ fontSize: '24px', color: '#1677ff' }" />
            </div>
            <span class="logo-text">Admin Console</span>
        </div>

        <!-- Navigation Menu -->
        <SidebarMenu @click="closeMobileSidebar" />
    </a-drawer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { AppstoreOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons-vue'
import { useSidebar } from '../composables/useSidebar'
import SidebarMenu from './SidebarMenu.vue'

const { isMobile, isOpen, collapsed, toggleDesktopCollapse, closeMobileSidebar } = useSidebar()
const { colorMode } = useTheme()

const isDark = computed(() => {
    if (colorMode.value === 'dark') return true
    if (colorMode.value === 'light') return false
    if (import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    return false
})
</script>

<style scoped>
.sidebar-sider {
    position: fixed !important;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    flex-direction: column;
    transition: all 0.2s ease;
}

.sidebar-logo {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-bottom: 1px solid var(--color-neutral-200);
    min-height: 64px;
}

.dark .sidebar-logo {
    border-color: var(--color-neutral-800);
}

.sidebar-logo.collapsed {
    justify-content: center;
    padding: 16px 8px;
}

.logo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%);
    border-radius: 10px;
}

.dark .logo-icon {
    background: linear-gradient(135deg, #111d2c 0%, #112a45 100%);
}

.logo-text {
    font-size: 16px;
    font-weight: 600;
    color: var(--color-neutral-900);
    white-space: nowrap;
}

.dark .logo-text {
    color: var(--color-neutral-100);
}

.sidebar-footer {
    margin-top: auto;
    padding: 12px;
    border-top: 1px solid var(--color-neutral-200);
}

.dark .sidebar-footer {
    border-color: var(--color-neutral-800);
}

.collapse-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
