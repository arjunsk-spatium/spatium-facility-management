<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full" :bordered="false">
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
            <div class="flex items-end gap-2 h-32 pt-4">
                <div v-for="(val, index) in data" :key="index"
                    class="flex-1 bg-blue-100 dark:bg-blue-900/30 rounded-t relative group transition-all hover:bg-blue-200 dark:hover:bg-blue-800/40"
                    :style="{ height: `${val}%` }">

                    <div
                        class="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                        {{ val }} kWh
                    </div>
                </div>
            </div>

            <div class="flex justify-between text-xs text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-700">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
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
import { ref } from 'vue';
import { ThunderboltOutlined } from '@ant-design/icons-vue';

const timeRange = ref('week');
const data = [30, 45, 60, 40, 75, 50, 65]; // Mock percentage data for bars
</script>
