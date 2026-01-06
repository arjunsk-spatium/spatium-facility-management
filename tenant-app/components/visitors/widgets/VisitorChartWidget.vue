<template>
    <a-card class="shadow-sm" title="Weekly Visitor Traffic">
        <div class="flex items-end justify-between h-64 mt-4 px-2 space-x-4">
            <div v-for="(day, index) in data" :key="index" class="flex flex-col items-center flex-1 group">
                <div class="relative w-full bg-blue-500 dark:bg-blue-600 rounded-t-sm hover:bg-blue-400 transition-all duration-300"
                    :style="{ height: `${maxVal > 0 ? (day.count / maxVal) * 100 : 0}%` }">
                    <div
                        class="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold bg-gray-800 text-white px-2 py-1 rounded shadow-lg z-10">
                        {{ day.count }}
                    </div>
                </div>
                <div class="mt-4 text-sm text-gray-500 dark:text-gray-400 font-medium">{{ day.day }}</div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
    data: { day: string, count: number }[]
}>()

const maxVal = computed(() => {
    if (!props.data || props.data.length === 0) return 0
    return Math.max(...props.data.map(d => d.count))
})
</script>
