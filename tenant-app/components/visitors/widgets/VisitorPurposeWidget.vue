<template>
    <a-card title="Visit Purposes">
        <div class="h-64 mt-4 flex items-center justify-center">
            <DoughnutChart v-if="chartData" :chart-data="chartData" />
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DoughnutChart from '../../common/charts/DoughnutChart.vue';

const props = defineProps<{
    data: { purpose: string, count: number, color: string }[]
}>();

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) return null;

    return {
        labels: props.data.map(d => d.purpose),
        datasets: [
            {
                data: props.data.map(d => d.count),
                backgroundColor: props.data.map(d => d.color),
                borderWidth: 0
            }
        ]
    };
});
</script>
