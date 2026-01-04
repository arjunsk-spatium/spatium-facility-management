<template>
    <div class="p-6">
        <h1 class="text-2xl font-bold mb-4">Helpdesk Tickets</h1>
        <p>List of support tickets.</p>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: 'auth'
})
</script>
