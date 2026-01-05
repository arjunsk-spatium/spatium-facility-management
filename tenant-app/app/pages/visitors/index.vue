<template>
    <div class="space-y-6">
        <h1 class="text-2xl font-bold mb-4">Visitors List</h1>
        <p>List of visitors will appear here.</p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>
