<template>
  <div class="flex items-center justify-center h-screen">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: false
})

onMounted(() => {
  navigateTo('/admin/login')
})
</script>
