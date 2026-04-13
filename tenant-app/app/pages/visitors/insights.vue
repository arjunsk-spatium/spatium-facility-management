<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Analytics and reporting for facility visitors.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker />
                <a-button type="primary">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    Export <hide class="hidden sm:inline">Report</hide>
                </a-button>
            </div>
        </div>

        <!-- Key Stats -->
        <VisitorStatsWidget :stats="stats" />

        <!-- Chart -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
                <VisitorChartWidget :data="trends" />
            </div>
            <div class="lg:col-span-1">
                <VisitorPurposeWidget :data="purposeStats" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { DownloadOutlined } from '@ant-design/icons-vue'

definePageMeta({
    middleware: 'auth'
})

const store = useVisitorStore()
const { stats, trends, purposeStats } = storeToRefs(store)

onMounted(() => {
    store.fetchStats()
    store.fetchTrends()
    store.fetchPurposeStats()
})
</script>
