<template>
    <a-card title="Helpdesk Trends (Last 7 Days)">
        <div v-if="dashboardStore.loading" class="flex justify-center items-center h-40">
            <a-spin />
        </div>
        <div v-else class="h-64 mt-4">
            <LineChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from '../../stores/dashboard';
import LineChart from '../common/charts/LineChart.vue';

const dashboardStore = useDashboardStore();

const trends = computed(() => dashboardStore.summary?.helpdesk?.trends_last_7_days || []);

const chartData = computed(() => {
    if (trends.value.length === 0) return null;
    const labels = trends.value.map(t => new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }));
    return {
        labels,
        datasets: [
            {
                label: 'Created',
                data: trends.value.map(t => t.created),
                borderColor: '#ef4444',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                fill: true,
                tension: 0.4,
            },
            {
                label: 'Resolved',
                data: trends.value.map(t => t.resolved),
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };
});

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
        },
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                precision: 0,
            },
        },
    },
};
</script>
