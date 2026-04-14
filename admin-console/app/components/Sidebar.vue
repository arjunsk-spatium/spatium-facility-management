<template>
    <!-- Desktop Sidebar -->
    <a-layout-sider v-if="!isMobile" v-model:collapsed="collapsed" :trigger="null" collapsible :width="240"
        :collapsed-width="80" class="sidebar-sider"
        :style="{ background: isDark ? '#141414' : '#ffffff', borderRight: `1px solid ${isDark ? '#303030' : '#f0f0f0'}`, height: '100vh', position: 'sticky', top: 0 }">

        <div class="flex flex-col h-full">
            <!-- Logo -->
            <div class="sidebar-logo" :class="{ collapsed }">
                <img :src="isDark ? '/images/nexspace-logo-light.png' : '/images/nexspace-logo-dark.svg'" 
                    alt="Nexspace" class="logo-image-sidebar" />
                <span v-if="!collapsed" class="logo-text">Admin Console</span>
            </div>

            <!-- Navigation Menu (Scrollable) -->
            <div class="flex-1 overflow-y-auto custom-scrollbar">
                <SidebarMenu :collapsed="collapsed" />
            </div>

            <!-- Collapse Toggle -->
            <div class="sidebar-footer">
                <a-button type="text" @click="toggleDesktopCollapse" class="collapse-btn">
                    <MenuFoldOutlined v-if="!collapsed" />
                    <MenuUnfoldOutlined v-else />
                </a-button>
            </div>
        </div>
    </a-layout-sider>

    <!-- Mobile Drawer -->
    <a-drawer v-else :open="isOpen" placement="left" :closable="false" :width="280" @close="closeMobileSidebar"
        :body-style="{ padding: 0, background: isDark ? '#141414' : '#ffffff' }">
        <!-- Logo -->
        <div class="sidebar-logo">
            <img :src="isDark ? '/images/nexspace-logo-light.png' : '/images/nexspace-logo-dark.svg'" 
                alt="Nexspace" class="logo-image-sidebar" />
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
/* Sidebar Sider Styling */
/* Removed fixed positioning. Using sticky for scroll behavior if needed within flex container */

.sidebar-logo {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 8px 20px;
    border-bottom: 1px solid var(--color-neutral-200);
    flex-shrink: 0;
}

.dark .sidebar-logo {
    border-color: var(--color-neutral-800);
}

.sidebar-logo.collapsed {
    align-items: center;
    padding: 16px 8px;
}

.logo-image-sidebar {
    height: 32px;
    width: auto;
    object-fit: contain;
    transition: all 0.3s ease;
}

.sidebar-logo.collapsed .logo-image-sidebar {
    height: 24px;
}

.logo-text {
    font-size: 11px;
    font-weight: 500;
    color: var(--color-neutral-500);
    padding-left: 31px;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-top: -7px;
}

.dark .logo-text {
    color: var(--color-neutral-400);
}

.sidebar-footer {
    padding: 12px;
    border-top: 1px solid var(--color-neutral-200);
    flex-shrink: 0;
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

/* Custom Scrollbar */
.custom-scrollbar::-webkit-scrollbar {
    width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
}

.dark .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.1);
}

.custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
}

.dark .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
}
</style>
