<template>
    <a-card title="Visitor Traffic (Last 7 Days)">
        <div v-if="loading" class="flex justify-center items-center h-40">
            <a-spin />
        </div>
        <div v-else class="h-64 mt-4">
            <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useVisitorStore } from '../../stores/visitor';
import { storeToRefs } from 'pinia';
import LineChart from '../common/charts/LineChart.vue';

const store = useVisitorStore();
const { trends, loading } = storeToRefs(store);

const chartData = computed(() => {
    if (!trends.value || trends.value.length === 0) return null;

    return {
        labels: trends.value.map(d => d.day),
        datasets: [
            {
                label: 'Visitors',
                data: trends.value.map(d => d.count),
                borderColor: '#1890ff',
                backgroundColor: 'rgba(24, 144, 255, 0.2)',
                tension: 0.4,
                fill: true
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

onMounted(() => {
    store.fetchTrends();
});
</script>
