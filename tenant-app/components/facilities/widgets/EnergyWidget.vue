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
            <div class="h-48 pt-4 overflow-hidden">
                <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
                <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
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
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { ThunderboltOutlined } from '@ant-design/icons-vue';
import { Column } from '@antv/g2plot';

const timeRange = ref('week');
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Column | null = null;

const energyData = [
    { day: 'Mon', energy: 30 },
    { day: 'Tue', energy: 45 },
    { day: 'Wed', energy: 60 },
    { day: 'Thu', energy: 40 },
    { day: 'Fri', energy: 75 },
    { day: 'Sat', energy: 50 },
    { day: 'Sun', energy: 65 }
];

const chartData = computed(() => energyData);

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Column(chartContainer.value, {
        data: chartData.value,
        xField: 'day',
        yField: 'energy',
        autoFit: true,
        padding: [10, 10, 30, 30],
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        columnWidthRatio: 0.4,
        color: '#eab308',
        xAxis: {
            label: {
                style: {
                    fill: '#666',
                    fontSize: 12,
                },
            },
            line: null,
            tickLine: null,
        },
        yAxis: {
            label: false,
            grid: null,
            line: null,
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.day, value: `${datum.energy} kWh` };
            },
        },
        animation: {
            appear: {
                animation: 'scale-in-y',
                duration: 1500,
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
