<template>
    <a-card title="Facility Insights">
        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <div v-else class="space-y-3">
            <div v-if="topFacilities?.highest_visitors" class="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="mt-1">
                    <UsergroupAddOutlined class="text-purple-500" />
                </div>
                <div class="flex-1">
                    <div class="font-medium text-sm">Highest Visitors</div>
                    <div class="text-xs text-gray-500">{{ topFacilities.highest_visitors.name }} • {{ topFacilities.highest_visitors.count }} visitors</div>
                </div>
            </div>
            <div v-if="topFacilities?.highest_tickets" class="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div class="mt-1">
                    <CustomerServiceOutlined class="text-red-500" />
                </div>
                <div class="flex-1">
                    <div class="font-medium text-sm">Highest Tickets</div>
                    <div class="text-xs text-gray-500">{{ topFacilities.highest_tickets.name }} • {{ topFacilities.highest_tickets.count }} tickets</div>
                </div>
            </div>
            <div v-if="!hasData" class="text-center text-gray-500 py-4">
                No facility insights available.
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { UsergroupAddOutlined, CustomerServiceOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const topFacilities = computed(() => dashboardStore.summary?.insights?.top_facilities);

const hasData = computed(() => {
    return !!topFacilities.value?.highest_visitors || !!topFacilities.value?.highest_tickets;
});
</script>
