<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <ThunderboltOutlined class="text-yellow-500" />
                <span>Energy Consumption</span>
            </div>
        </template>
        <template #extra>
            <a-select v-model:value="timeRange" size="small" class="w-24">
                <a-select-option value="week">Week</a-select-option>
                <a-select-option value="month">Month</a-select-option>
            </a-select>
        </template>

        <div class="space-y-4">
            <div class="h-48 pt-4">
                <BarChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            </div>

            <div class="flex items-center justify-between mt-2">
                <div>
                    <div class="text-xs text-gray-500">Total Usage</div>
                    <div class="font-bold dark:text-gray-200">1,245 kWh</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-gray-500">Efficiency</div>
                    <div class="font-bold text-green-500">+12%</div>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ThunderboltOutlined } from '@ant-design/icons-vue';
import BarChart from '../../common/charts/BarChart.vue';

const timeRange = ref('week');
const mockData = [30, 45, 60, 40, 75, 50, 65];

const chartData = computed(() => ({
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
        label: 'Energy (kWh)',
        data: mockData,
        backgroundColor: '#eab308',
        borderRadius: 4,
        barThickness: 24
    }]
}));

const chartOptions = {
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { display: false },
            grid: { display: false }
        },
        x: {
            grid: { display: false }
        }
    }
};
</script>
