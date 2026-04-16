<template>
  <a-config-provider :theme="themeConfig">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </a-config-provider>
</template>

<script setup lang="ts">
import { theme } from 'ant-design-vue';
import { computed } from 'vue';

const { darkAlgorithm, defaultAlgorithm } = theme;
const { initTheme, isDark } = useTheme();

// Ant Design Theme Config
const themeConfig = computed(() => ({
  algorithm: isDark.value ? darkAlgorithm : defaultAlgorithm,
  token: {
    fontFamily: "'Fira Sans', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
}));

onMounted(() => {
  initTheme()
})
</script>
