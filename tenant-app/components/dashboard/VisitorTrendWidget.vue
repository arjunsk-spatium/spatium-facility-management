<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full" title="Visitor Traffic (Last 7 Days)">
        <div v-if="loading" class="flex justify-center items-center h-40">
            <a-spin />
        </div>
        <div v-else class="flex items-end justify-between h-40 mt-4 px-2 space-x-2">
            <div v-for="(day, index) in trends" :key="index" class="flex flex-col items-center flex-1 group">
                <div class="relative w-full bg-blue-100 dark:bg-blue-900/30 rounded-t-sm hover:bg-blue-200 transition-all duration-300"
                    :style="{ height: `${maxVal > 0 ? (day.count / maxVal) * 100 : 0}%` }">
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
import { computed, onMounted } from 'vue';
import { useVisitorStore } from '../../stores/visitor';
import { storeToRefs } from 'pinia';

const store = useVisitorStore();
const { trends, loading } = storeToRefs(store);

const maxVal = computed(() => {
    if (!trends.value || trends.value.length === 0) return 100;
    return Math.max(...trends.value.map(d => d.count));
});

onMounted(() => {
    store.fetchTrends();
});
</script>
