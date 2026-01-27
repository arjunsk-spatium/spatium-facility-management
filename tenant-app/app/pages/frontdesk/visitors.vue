<template>
    <VisitorManagement />
</template>

<script setup lang="ts">
import VisitorManagement from '../../../components/visitors/VisitorManagement.vue'

definePageMeta({
    middleware: 'auth'
})
</script>
