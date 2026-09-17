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
import { ClockCircleOutlined, SyncOutlined, CheckCircleOutlined, StopOutlined, PauseCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    status: string;
}>();

const color = computed(() => {
    switch (props.status?.toLowerCase()) {
        case 'open': return 'error'; // Red
        case 'in progress':
        case 'inprogress':
        case 'in_progress': return 'processing'; // Blue
        case 'on hold':
        case 'on_hold': return 'warning'; // Orange
        case 'resolved': return 'success'; // Green
        case 'closed': return 'default'; // Gray
        default: return 'default';
    }
});

const icon = computed(() => {
    switch (props.status?.toLowerCase()) {
        case 'open': return ClockCircleOutlined;
        case 'in progress':
        case 'inprogress':
        case 'in_progress': return SyncOutlined;
        case 'on hold':
        case 'on_hold': return PauseCircleOutlined;
        case 'resolved': return CheckCircleOutlined;
        case 'closed': return StopOutlined;
        default: return null;
    }
});
</script>
