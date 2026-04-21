<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <UsergroupAddOutlined class="text-purple-500" />
                <span>Visitors</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/visitors" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <template v-else>
            <div class="flex justify-between items-center mb-4">
                <div>
                    <div class="text-2xl font-bold">{{ visitors?.today_count || 0 }}</div>
                    <div class="text-xs text-gray-500">Visitors Today</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-semibold text-blue-500">{{ preInvites?.today_count || 0 }}</div>
                    <div class="text-xs text-gray-500">Pre-invites Today</div>
                </div>
            </div>

            <div class="text-xs text-gray-400">
                <span class="text-gray-500">Last 7 days total: {{ last7DaysTotal }}</span>
            </div>
        </template>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const visitors = computed(() => dashboardStore.summary?.visitors);
const preInvites = computed(() => dashboardStore.summary?.pre_invites);

const last7DaysTotal = computed(() => {
    const days = visitors.value?.last_7_days || [];
    return days.reduce((sum, d) => sum + d.count, 0);
});
</script>
