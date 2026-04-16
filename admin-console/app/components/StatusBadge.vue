<script setup lang="ts">
interface Props {
    status: 'active' | 'inactive' | 'pending';
}

defineProps<Props>();
</script>

<template>
    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize" :class="{
        'bg-green-100 text-green-800': status === 'active',
        'bg-red-100 text-red-800': status === 'inactive',
        'bg-yellow-100 text-yellow-800': status === 'pending',
    }">
        {{ status }}
    </span>
</template>
