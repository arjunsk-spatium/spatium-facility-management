<template>
    <a-card title="Top Visiting Companies">
        <div v-if="!data || data.length === 0" class="flex items-center justify-center h-40 text-gray-500">
            No data available
        </div>
        <div v-else class="space-y-4">
            <div v-for="(company, index) in data" :key="company.company_id" class="flex items-center gap-3">
                <div class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                    :class="index < 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'">
                    {{ index + 1 }}
                </div>
                <div class="flex-1">
                    <div class="flex justify-between items-center">
                        <span class="font-medium text-sm">{{ company.name }}</span>
                        <span class="text-sm font-bold">{{ company.count }}</span>
                    </div>
                    <a-progress :percent="getPercentage(company.count)" :show-info="false" size="small"
                        :stroke-color="index < 3 ? '#3b82f6' : '#9ca3af'" />
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TopCompany {
    company_id: string
    name: string
    count: number
}

const props = defineProps<{
    data: TopCompany[] | null
}>()

const maxCount = computed(() => {
    if (!props.data || props.data.length === 0) return 1;
    return Math.max(...props.data.map(c => c.count));
});

function getPercentage(count: number) {
    if (maxCount.value === 0) return 0;
    return Math.round((count / maxCount.value) * 100);
}
</script>
