<template>
    <a-layout :style="{ minHeight: '100vh', background: isDark ? '#121212' : '#f5f5f5' }" has-sider>
        <!-- Sidebar - Responsive (Drawer on mobile, Sider on desktop) -->
        <Sidebar />

        <!-- Main content area -->
        <a-layout class="main-content-layout" :style="{
            background: isDark ? '#121212' : '#f5f5f5',
            transition: 'all 0.2s ease'
        }">
            <a-layout-header
                class="app-header flex justify-between items-center px-4 md:px-6 border-b border-neutral-200 dark:border-neutral-700"
                :style="{ background: isDark ? '#1a1a1a' : '#ffffff', lineHeight: '64px', position: 'sticky', top: 0, zIndex: 10 }">

                <!-- Left Side: Hamburger (Mobile) -->
                <div class="flex items-center gap-4">
                    <MenuOutlined v-if="isMobile"
                        class="text-lg cursor-pointer hover:text-primary-500 transition-colors"
                        :class="isDark ? 'text-neutral-300' : 'text-neutral-600'" @click="toggleMobileSidebar" />
                    <span class="text-lg font-semibold" :class="isDark ? 'text-neutral-100' : 'text-neutral-900'">
                        Spatium Admin
                    </span>
                </div>

                <!-- Right Side: Theme Toggle & User Profile -->
                <div class="flex items-center gap-4">
                    <ThemeToggle />
                    <UserProfile />
                </div>
            </a-layout-header>

            <!-- Scrollable content wrapper -->
            <a-layout-content class="content-scroll-area p-0 md:p-6"
                :style="{ background: isDark ? '#121212' : '#f5f5f5', overflowY: 'auto' }">
                <div class="p-4 md:p-6 min-h-[360px] rounded-none md:rounded-lg transition-colors duration-300"
                    :style="{ background: isDark ? '#1f1f1f' : '#ffffff' }">
                    <slot />
                </div>
            </a-layout-content>

            <a-layout-footer class="text-center text-neutral-500 dark:text-neutral-400 text-sm"
                :style="{ background: isDark ? '#1a1a1a' : '#fafafa', padding: '12px 24px' }">
                Spatium Admin Console ©2024
            </a-layout-footer>
        </a-layout>
    </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenuOutlined } from '@ant-design/icons-vue';
import { useSidebar } from '../composables/useSidebar';
import Sidebar from '../components/Sidebar.vue';
import ThemeToggle from '../components/ThemeToggle.vue';
import UserProfile from '../components/UI/UserProfile.vue';

const { isMobile, collapsed, toggleMobileSidebar } = useSidebar();
const { colorMode } = useTheme();

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
/* Header styling */
.app-header {
    transition: background-color 0.3s ease, border-color 0.3s ease;
}

/* Main layout takes full height minus sidebar */
.main-content-layout {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

/* Content area scrolls independently */
.content-scroll-area {
    flex: 1;
    overflow-y: auto;
}
</style>
