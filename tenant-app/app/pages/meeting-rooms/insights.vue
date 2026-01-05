<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Meeting Rooms Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of room utilization and booking trends.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-range-picker v-model:value="dateRange" />
                <a-button type="primary">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    Export Report
                </a-button>
            </div>
        </div>

        <!-- Key Stats -->
        <StatsWidget :stats="stats" />

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 h-96">
                <UtilizationWidget />
            </div>
            <div class="h-96">
                <BookingsByStatusWidget />
            </div>
        </div>

        <!-- Tables Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopRoomsWidget />
            <TopCompaniesWidget />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { storeToRefs } from 'pinia';
import type { Dayjs } from 'dayjs';

import StatsWidget from '../../../components/meeting-rooms/widgets/StatsWidget.vue';
import UtilizationWidget from '../../../components/meeting-rooms/widgets/UtilizationWidget.vue';
import BookingsByStatusWidget from '../../../components/meeting-rooms/widgets/BookingsByStatusWidget.vue';
import TopRoomsWidget from '../../../components/meeting-rooms/widgets/TopRoomsWidget.vue';
import TopCompaniesWidget from '../../../components/meeting-rooms/widgets/TopCompaniesWidget.vue';

definePageMeta({
    middleware: 'auth'
});

const store = useMeetingRoomStore();
const { stats } = storeToRefs(store);
const dateRange = ref<[Dayjs, Dayjs]>();

onMounted(() => {
    store.fetchStats();
});
</script>
