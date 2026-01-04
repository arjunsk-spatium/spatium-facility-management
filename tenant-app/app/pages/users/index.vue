<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">User Module Management</h1>
        <p>Manage user access and modules here.</p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>
