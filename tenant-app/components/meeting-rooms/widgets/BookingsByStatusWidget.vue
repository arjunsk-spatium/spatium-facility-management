<template>
    <a-card title="Bookings by Status" >
        <div class="flex items-center justify-center p-4 relative h-48">
            <DoughnutChart v-if="chartData" :chart-data="chartData" :options="chartOptions" />
            <!-- Center Text -->
            <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div class="text-2xl font-bold dark:text-white">145</div>
                <div class="text-xs text-gray-500">Total</div>
            </div>
        </div>

        <div class="grid grid-cols-1 gap-2 mt-4 px-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-green-500"></span>
                    <span class="text-sm">Confirmed</span>
                </div>
                <span class="font-medium">85</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-gray-400"></span>
                    <span class="text-sm">Completed</span>
                </div>
                <span class="font-medium">45</span>
            </div>
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-red-500"></span>
                    <span class="text-sm">Cancelled</span>
                </div>
                <span class="font-medium">15</span>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import DoughnutChart from '../../common/charts/DoughnutChart.vue';

const chartData = computed(() => ({
    labels: ['Confirmed', 'Completed', 'Cancelled'],
    datasets: [{
        data: [85, 45, 15],
        backgroundColor: ['#22c55e', '#9ca3af', '#ef4444'],
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
