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
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    status: string;
}>();

const color = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'confirmed': return 'success'; // Green
        case 'completed': return 'default'; // Gray
        case 'cancelled': return 'error'; // Red
        default: return 'default';
    }
});

const icon = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'confirmed': return CheckCircleOutlined;
        case 'completed': return ClockCircleOutlined;
        case 'cancelled': return CloseCircleOutlined;
        default: return null;
    }
});
</script>
