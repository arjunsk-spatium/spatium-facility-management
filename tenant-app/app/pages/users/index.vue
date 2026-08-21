<script setup lang="ts">
import { onMounted } from 'vue'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()

onMounted(async () => {
    if (authStore.modules.length === 0) {
        await authStore.fetchModules()
    }
    
    if (authStore.hasModule('users-management') || authStore.hasModule('users')) {
        navigateTo('/users/management', { replace: true })
    } else if (authStore.hasModule('users-operational')) {
        navigateTo('/users/operational', { replace: true })
    } else {
        navigateTo('/users/management', { replace: true })
    }
})
</script>

<template>
    <div class="flex justify-center items-center py-12">
        <a-spin size="large" />
    </div>
</template>
