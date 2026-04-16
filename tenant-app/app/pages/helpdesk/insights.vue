<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Helpdesk Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of ticket performance and facility issues.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker v-model:value="dateRange" />
                <a-button type="primary">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    Export <hide class="hidden sm:inline">Report</hide>
                </a-button>
            </div>
        </div>

        <!-- Key Stats -->
        <HelpdeskStatsWidget :stats="stats" />

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2 h-96">
                <TicketsOverTimeWidget />
            </div>
            <div class="h-96">
                <TicketsByStatusWidget />
            </div>
        </div>

        <!-- Tables Row -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TopFacilitiesWidget />
            <TopCategoriesWidget />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { DownloadOutlined } from '@ant-design/icons-vue';
import { useHelpdeskStore } from '../../../stores/helpdesk';
import { storeToRefs } from 'pinia';
import type { Dayjs } from 'dayjs';

import HelpdeskStatsWidget from '../../../components/helpdesk/widgets/HelpdeskStatsWidget.vue';
import TicketsOverTimeWidget from '../../../components/helpdesk/widgets/TicketsOverTimeWidget.vue';
import TicketsByStatusWidget from '../../../components/helpdesk/widgets/TicketsByStatusWidget.vue';
import TopFacilitiesWidget from '../../../components/helpdesk/widgets/TopFacilitiesWidget.vue';
import TopCategoriesWidget from '../../../components/helpdesk/widgets/TopCategoriesWidget.vue';

definePageMeta({
    middleware: 'auth'
});

const store = useHelpdeskStore();
const { stats } = storeToRefs(store);
const dateRange = ref<[Dayjs, Dayjs]>();

onMounted(() => {
    store.fetchStats();
});
</script>
