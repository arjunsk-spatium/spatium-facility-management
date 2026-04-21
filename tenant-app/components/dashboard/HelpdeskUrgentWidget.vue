<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <WarningOutlined class="text-red-500" />
                <span>Urgent & SLA</span>
            </div>
        </template>

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <div v-else class="space-y-4">
            <div class="grid grid-cols-2 gap-3">
                <div class="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <div class="text-lg font-bold text-red-600 dark:text-red-400">{{ urgent?.escalated || 0 }}</div>
                    <div class="text-xs text-gray-500">Escalated</div>
                </div>
                <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ sla?.breached || 0 }}</div>
                    <div class="text-xs text-gray-500">SLA Breached</div>
                </div>
                <div class="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    <div class="text-lg font-bold text-yellow-600 dark:text-yellow-400">{{ urgent?.disputed || 0 }}</div>
                    <div class="text-xs text-gray-500">Disputed</div>
                </div>
                <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ urgent?.reopened || 0 }}</div>
                    <div class="text-xs text-gray-500">Reopened</div>
                </div>
            </div>

            <div v-if="avgTimes" class="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-2">
                <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Avg Response</span>
                    <span class="font-medium">{{ avgTimes.response_time_minutes }} min</span>
                </div>
                <div class="flex justify-between text-xs">
                    <span class="text-gray-500">Avg Resolution</span>
                    <span class="font-medium">{{ avgTimes.resolution_time_minutes }} min</span>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { WarningOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const urgent = computed(() => dashboardStore.summary?.helpdesk?.urgent);
const sla = computed(() => dashboardStore.summary?.helpdesk?.sla);
const avgTimes = computed(() => dashboardStore.summary?.helpdesk?.average_times);
</script>
