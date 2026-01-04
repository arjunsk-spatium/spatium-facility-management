<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow">
        <template #title>
            <div class="flex items-center gap-2">
                <UsergroupAddOutlined class="text-purple-500" />
                <span>Visitors</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/visitors" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div class="flex justify-between items-center mb-4">
            <div>
                <div class="text-2xl font-bold">45</div>
                <div class="text-xs text-gray-500">Expected Today</div>
            </div>
            <div class="text-right">
                <div class="text-lg font-semibold text-blue-500">28</div>
                <div class="text-xs text-gray-500">Checked In</div>
            </div>
        </div>

        <a-progress :percent="62" :show-info="false" stroke-color="#8b5cf6" size="small" />
        <div class="mt-2 text-xs text-gray-500 text-right">62% Check-in rate</div>
    </a-card>
</template>

<script setup lang="ts">
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
</script>
