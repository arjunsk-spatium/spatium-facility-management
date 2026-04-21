<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <TeamOutlined class="text-teal-500" />
                <span>Users & Staff</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/users" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
            <div class="bg-teal-50 dark:bg-teal-900/20 p-2 rounded">
                <div class="text-lg font-bold text-teal-600 dark:text-teal-400">{{ users?.active_today || 0 }}</div>
                <div class="text-xs text-gray-500">Active Today</div>
            </div>
            <div class="bg-indigo-50 dark:bg-indigo-900/20 p-2 rounded">
                <div class="text-lg font-bold text-indigo-600 dark:text-indigo-400">{{ users?.active_last_7_days || 0 }}</div>
                <div class="text-xs text-gray-500">Active (7d)</div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ users?.new_registrations_last_7_days || 0 }}</div>
                <div class="text-xs text-gray-500">New (7d)</div>
            </div>
            <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ staff?.on_duty_now || 0 }}</div>
                <div class="text-xs text-gray-500">On Duty Now</div>
            </div>
        </div>

        <div v-if="staff" class="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
            <div class="flex justify-between text-sm">
                <span class="text-gray-500">Total Staff</span>
                <span class="font-bold">{{ staff.total_staff_count }}</span>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TeamOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const users = computed(() => dashboardStore.summary?.users);
const staff = computed(() => dashboardStore.summary?.staff);
</script>
