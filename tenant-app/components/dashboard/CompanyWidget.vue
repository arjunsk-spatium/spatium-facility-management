<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow">
        <template #title>
            <div class="flex items-center gap-2">
                <BankOutlined class="text-blue-500" />
                <span>Companies</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/companies" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div class="flex justify-between items-center mb-4">
            <div>
                <div class="text-2xl font-bold">124</div>
                <div class="text-xs text-gray-500">Total Companies</div>
            </div>
            <div class="text-right">
                <div class="text-lg font-semibold text-green-500">98%</div>
                <div class="text-xs text-gray-500">Active</div>
            </div>
        </div>

        <div class="text-xs text-gray-400">
            <span class="text-green-500">
                <ArrowUpOutlined /> 12%
            </span> vs last month
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { BankOutlined, ArrowUpOutlined } from '@ant-design/icons-vue';
</script>
