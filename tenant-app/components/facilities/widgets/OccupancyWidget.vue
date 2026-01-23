<template>
    <a-card 
        @click="navigateTo('/facilities')">
        <template #title>
            <div class="flex items-center gap-2">
                <PieChartOutlined class="text-blue-500" />
                <span>Space Occupancy</span>
                <ArrowRightOutlined
                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
            </div>
        </template>

        <div class="flex items-center justify-between">
            <div class="w-1/2 flex justify-center h-32 relative">
                <DoughnutChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
                <!-- Center Text -->
                <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span class="text-xl font-bold dark:text-white">85%</span>
                </div>
            </div>

            <div class="w-1/2 space-y-4">
                <div>
                    <div class="text-sm text-gray-500">Overall Occupancy</div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Total Capacity</span>
                        <span class="font-medium dark:text-gray-300">2,500</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Utilized</span>
                        <span class="font-medium text-blue-500">2,125</span>
                    </div>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { PieChartOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
import DoughnutChart from '../../common/charts/DoughnutChart.vue';

const chartData = computed(() => ({
    labels: ['Occupied', 'Available'],
    datasets: [{
        data: [85, 15],
        backgroundColor: ['#3b82f6', '#f3f4f6'],
        borderWidth: 0,
        cutout: '75%'
    }]
}));

const chartOptions = {
    plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
    }
};
</script>
