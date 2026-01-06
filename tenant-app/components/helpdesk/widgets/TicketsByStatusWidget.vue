<template>
    <a-card title="Tickets by Status" :bordered="false" class="shadow-sm h-full">
        <div class="flex items-center justify-center p-4 relative h-48">
            <DoughnutChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div class="text-2xl font-bold dark:text-white">100</div>
                <div class="text-xs text-gray-500">Total</div>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-2 mt-4">
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-red-500"></span>
                <span class="text-sm">Open (35%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-blue-500"></span>
                <span class="text-sm">In Progress (25%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-green-500"></span>
                <span class="text-sm">Resolved (15%)</span>
            </div>
            <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                <span class="text-sm">Closed (25%)</span>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DoughnutChart from '../../common/charts/DoughnutChart.vue';

const chartData = computed(() => ({
    labels: ['Open', 'In Progress', 'Resolved', 'Closed'],
    datasets: [{
        data: [35, 25, 15, 25],
        backgroundColor: ['#ef4444', '#3b82f6', '#22c55e', '#9ca3af'],
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
