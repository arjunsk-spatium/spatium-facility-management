<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <BankOutlined class="text-blue-500" />
                <span>Companies</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/companies" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <template v-else>
            <div class="flex justify-between items-center mb-4">
                <div>
                    <div class="text-2xl font-bold">{{ companies?.total_count || 0 }}</div>
                    <div class="text-xs text-gray-500">Total Companies</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-semibold text-green-500">{{ companies?.active_percentage || 0 }}%</div>
                    <div class="text-xs text-gray-500">Active</div>
                </div>
            </div>

            <div class="text-xs text-gray-400">
                <span :class="growthClass">
                    <component :is="growthIcon" />
                    {{ Math.abs(companies?.last_month_growth_percentage || 0) }}%
                </span>
                vs last month
            </div>
        </template>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { BankOutlined, ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const companies = computed(() => dashboardStore.summary?.companies);

const growth = computed(() => companies.value?.last_month_growth_percentage ?? 0);

const growthClass = computed(() => {
    if (growth.value > 0) return 'text-green-500';
    if (growth.value < 0) return 'text-red-500';
    return 'text-gray-500';
});

const growthIcon = computed(() => {
    if (growth.value > 0) return ArrowUpOutlined;
    if (growth.value < 0) return ArrowDownOutlined;
    return MinusOutlined;
});
</script>
