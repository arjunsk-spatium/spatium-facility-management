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
import { CheckCircleOutlined, StopOutlined, ToolOutlined } from '@ant-design/icons-vue';

const props = defineProps<{
    status: string;
}>();

const color = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'active': return 'success'; // Green
        case 'inactive': return 'default'; // Gray
        case 'maintenance': return 'warning'; // Orange
        default: return 'default';
    }
});

const icon = computed(() => {
    switch (props.status.toLowerCase()) {
        case 'active': return CheckCircleOutlined;
        case 'inactive': return StopOutlined;
        case 'maintenance': return ToolOutlined;
        default: return null;
    }
});
</script>
