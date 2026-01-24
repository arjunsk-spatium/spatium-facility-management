<template>
    <a-card @click="navigateTo('/facilities')">
        <template #title>
            <div class="flex items-center gap-2">
                <PieChartOutlined class="text-blue-500" />
                <span>Space Occupancy</span>
                <ArrowRightOutlined
                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
            </div>
        </template>

        <div class="flex items-center justify-between">
            <div class="w-1/2 flex justify-center h-32 overflow-hidden">
                <div ref="chartContainer" v-if="chartData" class="w-full h-full"></div>
            </div>

            <div class="w-1/2 space-y-4">
                <div>
                    <div class="text-sm text-gray-500">Overall Occupancy</div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Total Capacity</span>
                        <span class="font-medium dark:text-gray-300">2,500</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Utilized</span>
                        <span class="font-medium text-blue-500">2,125</span>
                    </div>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, watch, onBeforeUnmount, nextTick } from 'vue';
import { PieChartOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
import { Pie } from '@antv/g2plot';

const chartContainer = ref<HTMLDivElement | null>(null);
let chartInstance: Pie | null = null;

const occupancyData = [
    { type: 'Occupied', value: 85, color: '#3b82f6' },
    { type: 'Available', value: 15, color: '#f3f4f6' }
];

const chartData = computed(() => occupancyData);

const createChart = async () => {
    await nextTick();
    if (!chartContainer.value || !chartData.value) return;

    if (chartInstance) {
        chartInstance.destroy();
    }

    const colorMap: Record<string, string> = {};
    occupancyData.forEach(d => {
        colorMap[d.type] = d.color;
    });

    chartInstance = new Pie(chartContainer.value, {
        data: chartData.value,
        angleField: 'value',
        colorField: 'type',
        radius: 0.9,
        innerRadius: 0.75,
        autoFit: true,
        padding: [5, 5, 5, 5],
        color: (data: any) => colorMap[data.type] || '#666',
        label: false,
        legend: false,
        statistic: {
            title: false,
            content: {
                style: {
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#333',
                },
                content: '85%',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.type, value: `${datum.value}%` };
            },
        },
        animation: {
            appear: {
                animation: 'scale-in',
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
