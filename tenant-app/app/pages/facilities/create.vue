<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Create Facility</h1>
        <p>Form to create a new facility.</p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>
