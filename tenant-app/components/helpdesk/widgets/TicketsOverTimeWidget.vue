<template>
    <a-card title="Tickets Over Time">
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
import { Line } from '@antv/g2plot';

const timeRange = ref('year');
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Line | null = null;

const mockData = [
    { month: 'May', tickets: 12 },
    { month: 'Jun', tickets: 19 },
    { month: 'Jul', tickets: 15 },
    { month: 'Aug', tickets: 25 },
    { month: 'Sep', tickets: 22 },
    { month: 'Oct', tickets: 29 }
];

const chartData = computed(() => mockData);

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Line(chartContainer.value, {
        data: chartData.value,
        xField: 'month',
        yField: 'tickets',
        smooth: true,
        autoFit: true,
        padding: [10, 10, 30, 40],
        point: {
            size: 5,
            shape: 'circle',
        },
        area: {
            style: {
                fill: 'l(270) 0:#ffffff 0.5:#3b82f6 1:#3b82f6',
                fillOpacity: 0.2,
            },
        },
        color: '#3b82f6',
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
            showCrosshairs: true,
            shared: true,
            formatter: (datum: any) => {
                return { name: datum.month, value: datum.tickets };
            },
        },
        animation: {
            appear: {
                animation: 'wave-in',
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
