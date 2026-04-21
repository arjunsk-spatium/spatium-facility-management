<template>
    <a-card title="Recent Companies">
        <template #extra>
            <NuxtLink to="/companies" class="text-xs text-primary-600">View All</NuxtLink>
        </template>
        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-500 border-b border-gray-100 dark:border-gray-700">
                        <th class="pb-2 font-medium">Name</th>
                        <th class="pb-2 font-medium">Status</th>
                        <th class="pb-2 font-medium">Added</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
                    <tr v-for="company in recentCompanies" :key="company.id">
                        <td class="py-2.5">{{ company.name }}</td>
                        <td class="py-2.5">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="company.status === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'">
                                {{ capitalize(company.status) }}
                            </span>
                        </td>
                        <td class="py-2.5 text-gray-500">{{ formatDate(company.created_at) }}</td>
                    </tr>
                    <tr v-if="recentCompanies.length === 0">
                        <td colspan="3" class="py-4 text-center text-gray-400">No recent companies</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const recentCompanies = computed(() => dashboardStore.summary?.companies?.recent_companies || []);

function capitalize(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
</script>
