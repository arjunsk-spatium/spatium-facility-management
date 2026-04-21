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

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <template v-else>
            <div class="space-y-3">
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Open Tickets</span>
                    <span class="font-bold">{{ tickets?.open || 0 }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">In Progress</span>
                    <span class="font-bold text-blue-500">{{ tickets?.in_progress || 0 }}</span>
                </div>
                <div class="flex justify-between text-sm">
                    <span class="text-gray-500">Closed</span>
                    <span class="font-bold text-green-500">{{ tickets?.closed || 0 }}</span>
                </div>
            </div>

            <div v-if="topCategories.length > 0" class="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <div class="text-xs text-gray-500 mb-2">Top Categories</div>
                <div class="flex flex-wrap gap-2">
                    <span v-for="cat in topCategories" :key="cat.category__name"
                        class="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        {{ cat.category__name }} ({{ cat.ticket_count }})
                    </span>
                </div>
            </div>
        </template>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CustomerServiceOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const tickets = computed(() => dashboardStore.summary?.helpdesk?.tickets);
const topCategories = computed(() => tickets.value?.top_categories || []);
</script>
