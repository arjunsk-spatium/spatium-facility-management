<template>
    <a-tag :color="color" :class="['font-medium', 'px-2', 'py-0.5', 'rounded-md', 'border-0', 'capitalize']">
        <template #icon>
            <component :is="icon" v-if="icon" />
        </template>
        {{ status }}
    </a-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    status: string;
}>();

const color = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'open': return 'error'; // Red
        case 'in progress': return 'processing'; // Blue
        case 'resolved': return 'success'; // Green
        case 'closed': return 'default'; // Gray
        default: return 'default';
    }
});

const icon = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'open': return ClockCircleOutlined;
        case 'in progress': return SyncOutlined;
        case 'resolved': return CheckCircleOutlined;
        case 'closed': return StopOutlined;
        default: return null;
    }
});
</script>
