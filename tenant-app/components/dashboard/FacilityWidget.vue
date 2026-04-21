<template>
    <a-card>
        <template #title>
            <div class="flex items-center gap-2">
                <HomeOutlined class="text-orange-500" />
                <span>Facilities</span>
            </div>
        </template>
        <template #extra>
            <NuxtLink to="/facilities" class="text-xs text-primary-600">View All</NuxtLink>
        </template>

        <div v-if="dashboardStore.loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <div v-else class="grid grid-cols-2 gap-4">
            <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">{{ infrastructure?.facilities_count || 0 }}</div>
                <div class="text-xs text-gray-500">Facilities</div>
            </div>
            <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">{{ infrastructure?.towers_count || 0 }}</div>
                <div class="text-xs text-gray-500">Towers</div>
            </div>
            <div class="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">{{ infrastructure?.floors_count || 0 }}</div>
                <div class="text-xs text-gray-500">Floors</div>
            </div>
            <div class="bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">{{ infrastructure?.wings_count || 0 }}</div>
                <div class="text-xs text-gray-500">Wings</div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HomeOutlined } from '@ant-design/icons-vue';
import { useDashboardStore } from '../../stores/dashboard';

const dashboardStore = useDashboardStore();

const infrastructure = computed(() => dashboardStore.summary?.infrastructure);
</script>
