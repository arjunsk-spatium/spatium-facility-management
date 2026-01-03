<template>
  <a-layout style="min-height: 100vh">
    <Sidebar />
    <a-layout>
      <a-layout-header
        class="app-header flex justify-end items-center px-6 border-b border-neutral-200 dark:border-neutral-800"
        :style="{ background: isDark ? '#0f172a' : '#ffffff', lineHeight: '64px' }">
        <ThemeToggle />
      </a-layout-header>
      <a-layout-content style="margin: 24px 16px 0; overflow: initial;">
        <div class="p-6 min-h-[360px] rounded-lg bg-white dark:bg-neutral-900 transition-colors duration-300">
          <slot />
        </div>
      </a-layout-content>
      <a-layout-footer class="text-center text-neutral-500 dark:text-neutral-400"
        :style="{ background: isDark ? '#020617' : '#f8fafc' }">
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
/* Override Ant Design's internal header background */
.app-header {
  transition: background-color 0.3s ease, border-color 0.3s ease;
}
</style>
