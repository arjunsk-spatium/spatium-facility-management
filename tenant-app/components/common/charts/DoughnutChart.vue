<template>
    <div class="h-full w-full relative flex items-center justify-center">
        <Doughnut :data="chartData" :options="mergedOptions" />
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { useChartConfig } from './useChartConfig';

const props = defineProps<{
    chartData: {
        labels: string[];
        datasets: any[];
    };
    options?: any;
}>();

const { doughnutOptions } = useChartConfig();

const mergedOptions = computed(() => {
    return {
        ...doughnutOptions.value,
        ...props.options,
        plugins: {
            ...doughnutOptions.value.plugins,
            ...(props.options?.plugins || {})
        }
    };
});
</script>
