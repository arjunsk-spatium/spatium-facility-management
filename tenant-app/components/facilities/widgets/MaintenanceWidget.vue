<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer group" :bordered="false"
        @click="navigateTo('/helpdesk')">
        <template #title>
            <div class="flex items-center gap-2">
                <ToolOutlined class="text-orange-500" />
                <span>Maintenance Requests</span>
                <ArrowRightOutlined
                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
            </div>
        </template>

        <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-red-500"></span>
                    <span class="text-sm font-medium dark:text-gray-200">Urgent</span>
                </div>
                <span class="text-lg font-bold text-red-600 dark:text-red-400">5</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-orange-500"></span>
                    <span class="text-sm font-medium dark:text-gray-200">High Priority</span>
                </div>
                <span class="text-lg font-bold text-orange-600 dark:text-orange-400">12</span>
            </div>

            <div class="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="flex items-center gap-2">
                    <span class="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span class="text-sm font-medium dark:text-gray-200">Normal</span>
                </div>
                <span class="text-lg font-bold text-blue-600 dark:text-blue-400">28</span>
            </div>
        </div>

        <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div class="flex justify-between items-center text-xs text-gray-500">
                <span>Total Active</span>
                <span class="font-medium">45 Requests</span>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { ToolOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
</script>
