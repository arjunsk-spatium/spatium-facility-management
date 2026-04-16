<template>
  <div class="auth-layout h-full w-full relative">
    <div class="fixed top-6 right-6 z-[100]">
      <ThemeToggle />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
// ThemeToggle is auto-imported based on nuxt.config.ts components configuration
</script>
