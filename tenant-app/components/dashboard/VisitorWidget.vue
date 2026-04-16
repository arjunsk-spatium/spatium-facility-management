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

        <div v-if="loading" class="flex justify-center p-4">
            <a-spin size="small" />
        </div>
        <template v-else>
            <div class="flex justify-between items-center mb-4">
                <div>
                    <div class="text-2xl font-bold">{{ stats?.expected || 0 }}</div>
                    <div class="text-xs text-gray-500">Expected Today</div>
                </div>
                <div class="text-right">
                    <div class="text-lg font-semibold text-blue-500">{{ stats?.checkedIn || 0 }}</div>
                    <div class="text-xs text-gray-500">Checked In</div>
                </div>
            </div>

            <a-progress :percent="checkInPercentage" :show-info="false" stroke-color="#8b5cf6" size="small" />
            <div class="mt-2 text-xs text-gray-500 text-right">{{ checkInPercentage }}% Check-in rate</div>
        </template>
    </a-card>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { UsergroupAddOutlined } from '@ant-design/icons-vue';
import { useVisitorStore } from '../../stores/visitor';
import { storeToRefs } from 'pinia';

const store = useVisitorStore();
const { stats, loading } = storeToRefs(store);

const checkInPercentage = computed(() => {
    if (!stats.value || stats.value.expected === 0) return 0;
    return Math.round((stats.value.checkedIn / stats.value.expected) * 100);
});

onMounted(() => {
    store.fetchStats();
});
</script>
