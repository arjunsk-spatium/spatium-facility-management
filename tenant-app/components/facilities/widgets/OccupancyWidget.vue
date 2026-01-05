<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full cursor-pointer group" :bordered="false"
        @click="navigateTo('/facilities')">
        <template #title>
            <div class="flex items-center gap-2">
                <PieChartOutlined class="text-blue-500" />
                <span>Space Occupancy</span>
                <ArrowRightOutlined
                    class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-gray-400" />
            </div>
        </template>

        <div class="flex items-center justify-between">
            <div class="w-1/2 flex justify-center">
                <a-progress type="circle" :percent="85" :width="120" stroke-color="#3b82f6" />
            </div>

            <div class="w-1/2 space-y-4">
                <div>
                    <div class="text-2xl font-bold dark:text-white">85%</div>
                    <div class="text-xs text-gray-500">Overall Occupancy</div>
                </div>

                <div class="space-y-2">
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Total Capacity</span>
                        <span class="font-medium dark:text-gray-300">2,500</span>
                    </div>
                    <div class="flex items-center justify-between text-xs">
                        <span class="text-gray-500">Utilized</span>
                        <span class="font-medium text-blue-500">2,125</span>
                    </div>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { PieChartOutlined, ArrowRightOutlined } from '@ant-design/icons-vue';
</script>
