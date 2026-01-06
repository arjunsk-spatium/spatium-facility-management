<template>
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <a-card class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <UsergroupAddOutlined class="text-xl text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Total Visitors</div>
                    <div class="text-2xl font-bold dark:text-white">{{ stats?.total || 0 }}</div>
                </div>
            </div>
        </a-card>

        <a-card class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <CheckCircleOutlined class="text-xl text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Checked In</div>
                    <div class="text-2xl font-bold dark:text-white">{{ stats?.checkedIn || 0 }}</div>
                </div>
            </div>
        </a-card>

        <a-card class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                    <ClockCircleOutlined class="text-xl text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Pending</div>
                    <div class="text-2xl font-bold dark:text-white">{{ stats?.pending || 0 }}</div>
                </div>
            </div>
        </a-card>

        <a-card class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center gap-4">
                <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <CalendarOutlined class="text-xl text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <div class="text-sm text-gray-500 dark:text-gray-400">Expected</div>
                    <div class="text-2xl font-bold dark:text-white">{{ stats?.expected || 0 }}</div>
                </div>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { UsergroupAddOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined } from '@ant-design/icons-vue'
import type { VisitorStats } from '../../composables/visitorService'

defineProps<{
    stats: VisitorStats | null
}>()
</script>
