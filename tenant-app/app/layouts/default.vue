<template>
  <a-layout :style="{ minHeight: '100vh', background: isDark ? '#121212' : '#f5f5f5' }">
    <!-- Sidebar - Fixed position -->
    <Sidebar />

    <!-- Main content area - Scrollable -->
    <a-layout class="main-content-layout" :style="{ background: isDark ? '#121212' : '#f5f5f5' }">
      <a-layout-header
        class="app-header flex justify-end items-center px-6 border-b border-neutral-200 dark:border-neutral-700"
        :style="{ background: isDark ? '#1a1a1a' : '#ffffff', lineHeight: '64px', position: 'sticky', top: 0, zIndex: 10 }">
        <ThemeToggle />
      </a-layout-header>

      <!-- Scrollable content wrapper -->
      <a-layout-content class="content-scroll-area"
        :style="{ padding: '24px 16px', background: isDark ? '#121212' : '#f5f5f5', overflowY: 'auto' }">
        <div class="p-6 min-h-[360px] rounded-lg transition-colors duration-300"
          :style="{ background: isDark ? '#1f1f1f' : '#ffffff' }">
          <slot />
        </div>
      </a-layout-content>

      <a-layout-footer class="text-center text-neutral-500 dark:text-neutral-400 text-sm"
        :style="{ background: isDark ? '#1a1a1a' : '#fafafa', padding: '12px 24px' }">
        Spatium Facility Management ©2024
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const { colorMode } = useTheme();
const isDark = computed(() => {
  if (colorMode.value === 'dark') return true;
  if (colorMode.value === 'light') return false;
  // For system mode, check actual preference
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
