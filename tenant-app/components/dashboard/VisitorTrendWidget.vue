<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full" title="Visitor Traffic (Last 7 Days)">
        <div class="flex items-end justify-between h-40 mt-4 px-2 space-x-2">
            <div v-for="(day, index) in data" :key="index" class="flex flex-col items-center flex-1 group">
                <div class="relative w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm hover:bg-blue-200 transition-all duration-300"
                    :style="{ height: `${(day.count / maxVal) * 100}%` }">
                    <div
                        class="absolute -top-6 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded">
                        {{ day.count }}
                    </div>
                </div>
                <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">{{ day.day }}</div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const data = [
    { day: 'Mon', count: 45 },
    { day: 'Tue', count: 52 },
    { day: 'Wed', count: 38 },
    { day: 'Thu', count: 65 },
    { day: 'Fri', count: 48 },
    { day: 'Sat', count: 20 },
    { day: 'Sun', count: 15 },
];

const maxVal = computed(() => Math.max(...data.map(d => d.count)));
</script>
