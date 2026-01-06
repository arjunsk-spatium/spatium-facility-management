<template>
    <a-card class="shadow-sm" title="Weekly Visitor Traffic">
        <div class="h-80 mt-4">
            <BarChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BarChart from '../../common/charts/BarChart.vue';

const props = defineProps<{
    data: { day: string, count: number }[]
}>();

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) return null;

    return {
        labels: props.data.map(d => d.day),
        datasets: [
            {
                label: 'Visitors',
                data: props.data.map(d => d.count),
                backgroundColor: '#3b82f6',
                borderRadius: 4,
                barThickness: 40
            }
        ]
    };
});

const chartOptions = {
    plugins: {
        legend: {
            display: false
        }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0
            }
        }
    }
};
</script>
