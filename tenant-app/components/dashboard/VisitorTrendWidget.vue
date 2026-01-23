<template>
    <a-card title="Visitor Traffic (Last 7 Days)">
        <div v-if="loading" class="flex justify-center items-center h-40">
            <a-spin />
        </div>
        <div v-else class="h-64 mt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount } from 'vue';
import { Line } from '@antv/g2plot';
import { useVisitorStore } from '../../stores/visitor';
import { storeToRefs } from 'pinia';

const store = useVisitorStore();
const { trends, loading } = storeToRefs(store);
const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Line | null = null;

const chartData = computed(() => {
    if (!trends.value || trends.value.length === 0) return null;
    return trends.value;
});

const createChart = () => {
    if (!chartContainer.value || !chartData.value) return;

    // Destroy existing chart if any
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

watch([chartData, loading], () => {
    if (!loading.value && chartData.value) {
        createChart();
    }
}, { immediate: false });

onMounted(() => {
    store.fetchTrends();
    // Create chart after data is loaded
    if (!loading.value && chartData.value) {
        createChart();
    }
});

onBeforeUnmount(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
});
</script>
