<template>
    <div class="flex items-center justify-center min-h-[60vh]">
        <div class="text-center">
            <h1 class="text-3xl font-bold mb-4">Welcome to Nexspace Admin</h1>
            <p class="text-gray-600 dark:text-gray-400 mb-6">Manage your tenants, plans, and modules.</p>
            <NuxtLink to="/dashboard">
                <a-button type="primary" size="large">Go to Dashboard</a-button>
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
// Redirect to dashboard on mounted
onMounted(() => {
    navigateTo('/dashboard')
})
</script>
