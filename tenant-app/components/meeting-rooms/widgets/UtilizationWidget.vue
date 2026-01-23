<template>
    <a-card title="Bookings Trend" >
        <template #extra>
            <a-select v-model:value="timeRange" size="small" class="w-24">
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
            </a-select>
        </template>

        <div class="h-64 pt-4">
            <BarChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import BarChart from '../../common/charts/BarChart.vue';

const timeRange = ref('year');

const mockData = [
    { label: 'May', value: 20 },
    { label: 'Jun', value: 35 },
    { label: 'Jul', value: 30 },
    { label: 'Aug', value: 45 },
    { label: 'Sep', value: 55 },
    { label: 'Oct', value: 60 }
];

const chartData = computed(() => ({
    labels: mockData.map(d => d.label),
    datasets: [{
        label: 'Bookings',
        data: mockData.map(d => d.value),
        backgroundColor: '#a855f7',
        borderRadius: 4,
        barThickness: 32
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
