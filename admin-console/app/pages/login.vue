<template>
    <div
        class="flex flex-col justify-center items-center min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <!-- Theme Toggle in top right -->
        <div class="absolute top-4 right-4">
            <ThemeToggle />
        </div>

        <div class="card w-full max-w-md p-8">
            <h1 class="text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center mb-6">
                Super Admin Login
            </h1>
            <!-- Login form will go here -->
            <p class="text-neutral-500 text-center text-sm">
                Login form coming soon...
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'auth'
})
</script>
