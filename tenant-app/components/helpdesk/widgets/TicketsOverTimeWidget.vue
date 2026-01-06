<template>
    <a-card title="Tickets Over Time" :bordered="false" class="shadow-sm h-full">
        <template #extra>
            <a-select v-model:value="timeRange" size="small" class="w-24">
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
            </a-select>
        </template>

        <div class="h-64 pt-4">
            <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import LineChart from '../../common/charts/LineChart.vue';

const timeRange = ref('year');

const mockData = [
    { label: 'May', value: 12 },
    { label: 'Jun', value: 19 },
    { label: 'Jul', value: 15 },
    { label: 'Aug', value: 25 },
    { label: 'Sep', value: 22 },
    { label: 'Oct', value: 30 }
];

const chartData = computed(() => ({
    labels: mockData.map(d => d.label),
    datasets: [{
        label: 'Tickets',
        data: mockData.map(d => d.value),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        tension: 0.4,
        fill: true
    }]
}));

const chartOptions = {
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { precision: 0 }
        }
    }
};
</script>
