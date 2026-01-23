<template>
    <a-card title="Weekly Visitor Traffic">
        <div class="h-80 mt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { Column } from '@antv/g2plot';

const props = defineProps<{
    data: { day: string, count: number }[]
}>();

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Column | null = null;

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) return null;
    return props.data;
});

const createChart = () => {
    if (!chartContainer.value || !chartData.value) return;

    // Destroy existing chart if any
    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Column(chartContainer.value, {
        data: chartData.value,
        xField: 'day',
        yField: 'count',
        autoFit: true,
        padding: [10, 10, 20, 30],
        columnStyle: {
            radius: [4, 4, 0, 0],
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
            shared: true,
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
        await nextTick();
        createChart();
    }
}, { immediate: true });

onMounted(async () => {
    await nextTick();
    if (chartData.value) {
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
