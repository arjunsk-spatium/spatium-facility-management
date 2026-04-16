<template>
    <div class="h-full w-full relative">
        <Bar :data="chartData" :options="mergedOptions" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bar } from 'vue-chartjs';
import { useChartConfig } from './useChartConfig';

const props = defineProps<{
    chartData: {
        labels: string[];
        datasets: any[];
    };
    options?: any;
}>();

const { commonOptions } = useChartConfig();

const mergedOptions = computed(() => {
    return {
        ...commonOptions.value,
        ...props.options,
        plugins: {
            ...commonOptions.value.plugins,
            ...(props.options?.plugins || {})
        },
        scales: {
            ...commonOptions.value.scales,
            ...(props.options?.scales || {})
        }
    };
});
</script>
