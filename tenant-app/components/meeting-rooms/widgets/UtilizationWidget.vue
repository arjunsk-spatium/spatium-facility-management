<template>
    <a-card title="Bookings Trend">
        <template #extra>
            <a-select v-model:value="timeRange" size="small" class="w-24">
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
            </a-select>
        </template>

        <div class="h-64 pt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { Column } from '@antv/g2plot';

const timeRange = ref('year');
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Column | null = null;

const bookingData = [
    { month: 'May', bookings: 20 },
    { month: 'Jun', bookings: 35 },
    { month: 'Jul', bookings: 30 },
    { month: 'Aug', bookings: 45 },
    { month: 'Sep', bookings: 55 },
    { month: 'Oct', bookings: 60 }
];

const chartData = computed(() => bookingData);

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Column(chartContainer.value, {
        data: chartData.value,
        xField: 'month',
        yField: 'bookings',
        autoFit: true,
        padding: [10, 10, 30, 40],
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        columnWidthRatio: 0.5,
        color: '#a855f7',
        xAxis: {
            label: {
                style: {
                    fill: '#666',
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fill: '#666',
                },
            },
            min: 0,
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.month, value: datum.bookings };
            },
        },
        animation: {
            appear: {
                animation: 'scale-in-y',
                duration: 2000,
            },
        },
    });

    chartInstance.render();
};

watch(chartData, async () => {
    if (chartData.value) {
        await createChart();
    }
}, { immediate: true });

onMounted(async () => {
    await createChart();
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});
</script>
