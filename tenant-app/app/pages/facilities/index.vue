<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Facilities List</h1>
        <p>List of facilities will appear here.</p>
        <NuxtLink to="/facilities/create" class="text-primary-600 hover:underline">Create Facility</NuxtLink>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>
