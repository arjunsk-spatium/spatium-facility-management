<template>
    <a-card title="Tickets by Status">
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
    { status: 'Open', count: 35, color: '#ef4444' },
    { status: 'In Progress', count: 25, color: '#3b82f6' },
    { status: 'Resolved', count: 15, color: '#22c55e' },
    { status: 'Closed', count: 25, color: '#9ca3af' }
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

    const total = chartData.value.reduce((sum, item) => sum + item.value, 0);

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
            content: (datum: any) => {
                const percent = ((datum.value / total) * 100).toFixed(0);
                return `${datum.type}\n${datum.value} (${percent}%)`;
            },
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
                const percent = ((datum.value / total) * 100).toFixed(0);
                return { name: datum.type, value: `${datum.value} (${percent}%)` };
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
