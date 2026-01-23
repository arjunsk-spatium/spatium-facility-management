<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <CustomerServiceOutlined class="text-red-500" />
                <span>Helpdesk</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/helpdesk" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div class="space-y-3">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Open Tickets</span>
                <span class="font-bold">8</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Critical</span>
                <span class="font-bold text-red-500">2</span>
            </div>
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">In Progress</span>
                <span class="font-bold text-blue-500">5</span>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { CustomerServiceOutlined } from '@ant-design/icons-vue';
</script>
