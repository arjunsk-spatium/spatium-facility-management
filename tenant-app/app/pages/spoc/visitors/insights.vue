<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Analytics and reporting for your company visitors.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker />
                <a-button type="primary">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    <span class="hidden sm:inline">Export Report</span>
                </a-button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <UsergroupAddOutlined class="text-lg sm:text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats.total }}</p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircleOutlined class="text-lg sm:text-xl text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Completed Visits</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats.completed }}</p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                        <ClockCircleOutlined class="text-lg sm:text-xl text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Avg. Duration</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats.avgDuration }}
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                        <RiseOutlined class="text-lg sm:text-xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">This Month</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats.thisMonth }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Visitor Trends Chart -->
            <div
                class="lg:col-span-2 bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visitor Trends</h3>
                <div class="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
                    <div class="text-center">
                        <BarChartOutlined class="text-4xl mb-2" />
                        <p>Chart coming soon</p>
                    </div>
                </div>
            </div>

            <!-- Visit Purpose Breakdown -->
            <div
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Visit Purpose</h3>
                <div class="space-y-3">
                    <div v-for="purpose in purposes" :key="purpose.name">
                        <div class="flex justify-between text-sm mb-1">
                            <span class="text-gray-600 dark:text-gray-300">{{ purpose.name }}</span>
                            <span class="text-gray-900 dark:text-white font-medium">{{ purpose.count }}</span>
                        </div>
                        <div class="h-2 bg-gray-100 dark:bg-neutral-700 rounded-full overflow-hidden">
                            <div class="h-full rounded-full"
                                :style="{ width: purpose.percent + '%', backgroundColor: purpose.color }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import {
    DownloadOutlined,
    UsergroupAddOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    RiseOutlined,
    BarChartOutlined
} from '@ant-design/icons-vue'

definePageMeta({
    middleware: 'auth'
})

// Mock stats - replace with store data
const stats = reactive({
    total: 156,
    completed: 142,
    avgDuration: '45m',
    thisMonth: 28
})

// Mock purpose data
const purposes = reactive([
    { name: 'Business Meeting', count: 68, percent: 44, color: '#3b82f6' },
    { name: 'Interview', count: 42, percent: 27, color: '#10b981' },
    { name: 'Delivery', count: 28, percent: 18, color: '#f59e0b' },
    { name: 'Other', count: 18, percent: 11, color: '#8b5cf6' }
])
</script>
