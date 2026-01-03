<template>
    <div>
        <!-- Desktop Sidebar -->
        <a-layout-sider v-if="!isMobile" v-model:collapsed="collapsed" collapsible :theme="isDark ? 'dark' : 'light'"
            width="260" class="custom-sidebar shadow-md z-10 transition-colors duration-300"
            :style="{ background: isDark ? '#1a1a1a' : '#ffffff', position: 'sticky', top: 0, height: '100vh', overflow: 'hidden' }">
            <SidebarMenu :collapsed="collapsed" />
        </a-layout-sider>

        <!-- Mobile Drawer -->
        <a-drawer v-else :open="isOpen" :closable="false" placement="left" width="260"
            :body-style="{ padding: 0, background: isDark ? '#1a1a1a' : '#ffffff' }" @close="closeMobileSidebar">
            <SidebarMenu :collapsed="false" />
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSidebar } from '../composables/useSidebar';
import { useTheme } from '../composables/useTheme';
import SidebarMenu from './SidebarMenu.vue';

const { isMobile, isOpen, collapsed, closeMobileSidebar } = useSidebar();
const { colorMode } = useTheme();

// Compute isDark - shared logic
const isDark = computed(() => {
    if (colorMode.value === 'dark') return true;
    if (colorMode.value === 'light') return false;
    if (import.meta.client) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
});
</script>

<style scoped>
/* Only structural styles needed here */

/* Sidebar Container Background */
:deep(.ant-layout-sider) {
    background: #ffffff !important;
}

.dark :deep(.ant-layout-sider),
:deep(.ant-layout-sider-dark) {
    background: #1a1a1a !important;
}

/* Collapse Trigger Button */
:deep(.ant-layout-sider-light .ant-layout-sider-trigger) {
    background: #fafafa !important;
    color: #525252 !important;
    border-top: 1px solid #e5e5e5 !important;
}

:deep(.ant-layout-sider-dark .ant-layout-sider-trigger) {
    background: #1a1a1a !important;
    color: #a3a3a3 !important;
    border-top: 1px solid #333333 !important;
}
</style>
