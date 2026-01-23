<template>
  <a-config-provider :theme="themeConfig">
    <div
      class="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
      <AppLoader v-if="isLoading" />
      <NuxtLayout v-else>
        <NuxtPage />
      </NuxtLayout>
    </div>
  </a-config-provider>
</template>

<script setup lang="ts">
import { theme } from 'ant-design-vue';
import { computed, onMounted, watch, ref } from 'vue';

const { darkAlgorithm, defaultAlgorithm } = theme;
const { colorMode, initTheme, isDark } = useTheme();
const tenantStore = useTenantStore();

// Local reactive ref for dark mode - ensures immediate reactivity
const isDarkMode = ref(false);

const isLoading = computed(() => tenantStore.loading || !tenantStore.tenant);

// Watch the colorMode and isDark from the composable to sync local state
watch(
  [colorMode, isDark],
  () => {
    isDarkMode.value = isDark.value;
  },
  { immediate: true }
);

// Ant Design Theme Config - uses local reactive ref
const themeConfig = computed(() => ({
  algorithm: isDarkMode.value ? darkAlgorithm : defaultAlgorithm,
  token: {
    colorPrimary: tenantStore.primaryColor,
    fontFamily: "'Fira Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
}));

// Apply CSS Variables for Tailwind
const updateCssVariables = () => {
  if (import.meta.client && tenantStore.tenant) {
    const root = document.documentElement;
    const primary = tenantStore.primaryColor;

    root.style.setProperty('--color-primary-500', primary);
    root.style.setProperty('--color-primary-600', `color-mix(in srgb, ${primary}, black 10%)`);
    root.style.setProperty('--color-primary-700', `color-mix(in srgb, ${primary}, black 20%)`);
  }
};

onMounted(() => {
  initTheme();
  // Force sync after init
  isDarkMode.value = isDark.value;
  updateCssVariables();
});

// Watch for theme changes and update CSS variables
watch(isDark, (newVal) => {
  isDarkMode.value = newVal;
  updateCssVariables();
});

// Watch for tenant color changes
watch(() => tenantStore.primaryColor, updateCssVariables);

// Dynamic Head (Title & Favicon)
useHead({
  title: computed(() => tenantStore.tenantName),
  link: [
    {
      rel: 'icon',
      href: computed(() => tenantStore.faviconUrl),
    },
  ],
});
</script>
