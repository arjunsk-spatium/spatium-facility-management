<template>
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
        <!-- Header -->
        <header class="bg-white px-6 py-4 flex justify-between items-center border-b border-gray-100">
            <div class="flex items-center gap-3">
                <img v-if="tenantStore.tenantLogo" :src="tenantStore.tenantLogo" alt="Logo" class="h-8 w-auto object-contain" />
                <div v-else class="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                    <cube-icon class="w-5 h-5" />
                </div>
                <span class="font-bold text-lg">{{ tenantStore.tenantName }}</span>
            </div>

        </header>

        <!-- Main Content -->
        <main class="flex-1 flex flex-col items-center p-4 md:p-8 overflow-y-auto">
            <div class="w-full max-w-md mx-auto flex-1 flex flex-col">
                <slot />
            </div>
        </main>

        <!-- Footer -->

    </div>
</template>

<script setup lang="ts">
import { h } from 'vue'

const tenantStore = useTenantStore()

// Custom Cube Icon component for the logo
const CubeIcon = {
  render: () => h('svg', { 
    viewBox: '0 0 24 24', 
    fill: 'currentColor',
    class: 'w-5 h-5'
  }, [
    h('path', { d: 'M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5ZM12 4.15L6.04 7.5L12 10.85L17.96 7.5L12 4.15ZM5 15.91L11 19.29V12.58L5 9.21V15.91ZM19 15.91V9.21L13 12.58V19.29L19 15.91Z' })
  ])
}
</script>

<style scoped>
/* Ensure consistent font rendering */
body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
