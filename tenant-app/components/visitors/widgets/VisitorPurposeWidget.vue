<template>
    <a-card title="Visit Purposes">
        <div class="h-64 mt-4 overflow-hidden">
            <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { Pie } from '@antv/g2plot';

const props = defineProps<{
    data: { purpose: string, count: number, color: string }[]
}>();

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Pie | null = null;

const chartData = computed(() => {
    if (!props.data || props.data.length === 0) return null;
    return props.data.map(d => ({
        type: d.purpose,
        value: d.count,
    }));
});

const createChart = () => {
    if (!chartContainer.value || !chartData.value) return;

    // Destroy existing chart if any
    if (chartInstance) {
        chartInstance.destroy();
    }

    // Create color mapping from props data
    const colorMap: Record<string, string> = {};
    props.data.forEach(d => {
        colorMap[d.purpose] = d.color;
    });

    chartInstance = new Pie(chartContainer.value, {
        data: chartData.value,
        angleField: 'value',
        colorField: 'type',
        radius: 0.65,
        innerRadius: 0.6,
        autoFit: true,
        padding: [20, 20, 20, 20],
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
