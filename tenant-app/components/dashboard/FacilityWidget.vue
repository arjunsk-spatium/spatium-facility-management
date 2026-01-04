<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow">
        <template #title>
            <div class="flex items-center gap-2">
                <HomeOutlined class="text-orange-500" />
                <span>Facilities</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/facilities" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div class="grid grid-cols-2 gap-4">
            <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">12</div>
                <div class="text-xs text-gray-500">Buildings</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">85%</div>
                <div class="text-xs text-gray-500">Occupancy</div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { HomeOutlined } from '@ant-design/icons-vue';
</script>
