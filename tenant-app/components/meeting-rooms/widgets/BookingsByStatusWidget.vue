<template>
    <a-card title="Bookings by Status">
        <div class="h-64 mt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { Pie } from '@antv/g2plot';

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Pie | null = null;

const statusData = [
    { status: 'Confirmed', count: 85, color: '#22c55e' },
    { status: 'Completed', count: 45, color: '#9ca3af' },
    { status: 'Cancelled', count: 15, color: '#ef4444' }
];

const chartData = computed(() => statusData.map(d => ({
    type: d.status,
    value: d.count,
})));

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const colorMap: Record<string, string> = {};
    statusData.forEach(d => {
        colorMap[d.status] = d.color;
    });

    chartInstance = new Pie(chartContainer.value, {
        data: chartData.value,
        angleField: 'value',
        colorField: 'type',
        radius: 0.65,
        innerRadius: 0.6,
        autoFit: true,
        padding: [5, 10, 10, 20],
        color: (data: any) => colorMap[data.type] || '#666',
        label: {
            type: 'spider',
            labelHeight: 40,
            content: '{name}\n{value}',
            style: {
                fontSize: 13,
                fill: '#333',
                fontWeight: 500,
            },
        },
        legend: false,
        statistic: {
            title: false,
            content: false,
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.type, value: datum.value };
            },
        },
        animation: {
            appear: {
                animation: 'scale-in',
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
