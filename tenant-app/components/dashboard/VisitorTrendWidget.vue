<template>
    <a-card title="Visitor Traffic (Last 7 Days)">
        <div v-if="dashboardStore.loading" class="flex justify-center items-center h-40">
            <a-spin />
        </div>
        <div v-else class="h-64 mt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData && chartData.length > 0" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { Line } from '@antv/g2plot';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Line | null = null;

const chartData = computed(() => {
    const days = dashboardStore.summary?.visitors?.last_7_days || [];
    if (days.length === 0) return null;
    return days.map(d => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        count: d.count,
    }));
});

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Line(chartContainer.value, {
        data: chartData.value,
        xField: 'day',
        yField: 'count',
        smooth: true,
        autoFit: true,
        padding: [10, 10, 20, 30],
        point: {
            size: 5,
            shape: 'circle',
        },
        area: {
            style: {
                fill: 'l(270) 0:#ffffff 0.5:#1890ff 1:#1890ff',
                fillOpacity: 0.2,
            },
        },
        color: '#1890ff',
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

watch([chartData, () => dashboardStore.loading], async () => {
    if (!dashboardStore.loading && chartData.value) {
        await createChart();
    }
}, { immediate: true });

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});
</script>
