<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Total Tickets</p>
                    <h3 class="text-2xl font-bold mt-1 dark:text-white">{{ stats?.total || 0 }}</h3>
                </div>
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                    <ContainerOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">All time</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Open</p>
                    <h3 class="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{{ stats?.open || 0 }}</h3>
                </div>
                <div class="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
                    <ClockCircleOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Requires attention</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">In Progress</p>
                    <h3 class="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{{ stats?.inProgress || 0 }}
                    </h3>
                </div>
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                    <SyncOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Actively working</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Resolved</p>
                    <h3 class="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">{{ stats?.resolved || 0 }}
                    </h3>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-500">
                    <CheckCircleOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">This month</p>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ContainerOutlined, ClockCircleOutlined, SyncOutlined, CheckCircleOutlined } from '@ant-design/icons-vue';
import type { HelpdeskStats } from '../../../composables/helpdeskService';

defineProps<{
    stats: HelpdeskStats | null;
}>();
</script>
