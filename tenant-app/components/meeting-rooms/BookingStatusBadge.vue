<template>
    <a-tag :color="color" :class="['font-medium', 'px-2', 'py-0.5', 'rounded-md', 'border-0', 'capitalize']">
        <template #icon>
            <component :is="icon" v-if="icon" />
        </template>
        {{ displayStatus }}
    </a-tag>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    status?: string;
}>();

const statusValue = computed(() => props.status?.toLowerCase() || '');

const color = computed(() => {
    switch (statusValue.value) {
        case 'confirmed': return 'success';
        case 'completed': return 'default';
        case 'cancelled': return 'error';
        case 'pending': return 'processing';
        case 'rejected': return 'error';
        default: return 'default';
    }
});

const icon = computed(() => {
    switch (statusValue.value) {
        case 'confirmed': return CheckCircleOutlined;
        case 'completed': return ClockCircleOutlined;
        case 'cancelled': return CloseCircleOutlined;
        case 'pending': return SyncOutlined;
        case 'rejected': return CloseCircleOutlined;
        default: return null;
    }
});

const displayStatus = computed(() => {
    if (!props.status) return 'Unknown';
    return props.status.charAt(0).toUpperCase() + props.status.slice(1).toLowerCase();
});
</script>
