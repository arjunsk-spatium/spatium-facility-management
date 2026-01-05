<template>
    <a-card title="Tickets Over Time" :bordered="false" class="shadow-sm h-full">
        <template #extra>
            <a-select v-model:value="timeRange" size="small" class="w-24">
                <a-select-option value="month">Month</a-select-option>
                <a-select-option value="year">Year</a-select-option>
            </a-select>
        </template>

        <div class="space-y-4 pt-4">
            <!-- Simple CSS Bar Chart Mockup (representing line trend) -->
            <div class="flex items-end justify-between h-48 gap-3">
                <div v-for="(item, index) in data" :key="index" class="flex flex-col items-center flex-1 group">
                    <div class="w-full bg-blue-100 dark:bg-blue-900/30 rounded-t relative hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
                        :style="{ height: `${(item.value / maxValue) * 100}%` }">

                        <div
                            class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                            {{ item.value }} Tickets
                        </div>
                    </div>
                    <span class="text-xs text-gray-500 mt-2">{{ item.label }}</span>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const timeRange = ref('year');

const data = [
    { label: 'May', value: 12 },
    { label: 'Jun', value: 19 },
    { label: 'Jul', value: 15 },
    { label: 'Aug', value: 25 },
    { label: 'Sep', value: 22 },
    { label: 'Oct', value: 30 }
];

const maxValue = computed(() => Math.max(...data.map(d => d.value)) * 1.2);
</script>
