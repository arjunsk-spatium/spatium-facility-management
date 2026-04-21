<template>
    <div class="space-y-6">
        <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Facilities Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Real-time analytics and performance metrics.</p>
            </div>
            <a-range-picker v-model:value="dateRange" @change="onDateChange" />
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <template v-else-if="insights">
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Facilities</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ insights.summary.total_facilities }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Towers</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ insights.summary.total_towers }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Floors</div>
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ insights.summary.total_floors }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Wings</div>
                    <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ insights.summary.total_wings }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Meeting Rooms</div>
                    <div class="text-3xl font-bold text-teal-600 dark:text-teal-400">{{ insights.summary.total_meeting_rooms }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active MRs</div>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-500">{{ insights.summary.meeting_rooms_by_status.active }}</div>
                </a-card>
            </div>

            <!-- Facilities Table -->
            <a-card>
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Facilities Overview</h3>
                </template>
                <a-table
                    :dataSource="insights.facilities"
                    :columns="facilitiesColumns"
                    :pagination="{ pageSize: 10 }"
                    size="small"
                    class="mt-4"
                />
            </a-card>

            <!-- Top Facilities -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <a-card v-if="insights.top_facilities_by_visitors.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top by Visitors</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_facilities_by_visitors"
                        :columns="topVisitorsColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>

                <a-card v-if="insights.top_facilities_by_tickets.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top by Tickets</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_facilities_by_tickets"
                        :columns="topTicketsColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>

                <a-card v-if="insights.top_facilities_by_bookings.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top by Bookings</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_facilities_by_bookings"
                        :columns="topBookingsColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>
            </div>
        </template>

        <div v-else-if="error" class="text-center text-red-500 p-12">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useFacilityStore } from '../../../stores/facility'

definePageMeta({
    middleware: 'auth'
})

const store = useFacilityStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

// Default to last 6 months
const dateRange = ref<[Dayjs, Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
])

const fetchInsights = () => {
    if (!dateRange.value || dateRange.value.length !== 2) return
    const startDate = dateRange.value[0].format('YYYY-MM-DD')
    const endDate = dateRange.value[1].format('YYYY-MM-DD')
    store.fetchInsightsAction(startDate, endDate)
}

const onDateChange = () => {
    fetchInsights()
}

const facilitiesColumns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'City',
        dataIndex: 'city',
        key: 'city',
    },
    {
        title: 'State',
        dataIndex: 'state',
        key: 'state',
    },
    {
        title: 'Towers',
        dataIndex: 'towers',
        key: 'towers',
    },
    {
        title: 'Floors',
        dataIndex: 'floors',
        key: 'floors',
    },
    {
        title: 'Wings',
        dataIndex: 'wings',
        key: 'wings',
    },
    {
        title: 'Meeting Rooms',
        dataIndex: 'meeting_rooms',
        key: 'meeting_rooms',
    },
    {
        title: 'Visitors Now',
        dataIndex: 'visitors_on_premises_now',
        key: 'visitors_on_premises_now',
    },
]

const topVisitorsColumns = [
    {
        title: 'Facility',
        dataIndex: 'facility_name',
        key: 'facility_name',
    },
    {
        title: 'Visitors',
        dataIndex: 'visitor_count',
        key: 'visitor_count',
    },
]

const topTicketsColumns = [
    {
        title: 'Facility',
        dataIndex: 'facility_name',
        key: 'facility_name',
    },
    {
        title: 'Tickets',
        dataIndex: 'ticket_count',
        key: 'ticket_count',
    },
]

const topBookingsColumns = [
    {
        title: 'Facility',
        dataIndex: 'facility_name',
        key: 'facility_name',
    },
    {
        title: 'Bookings',
        dataIndex: 'booking_count',
        key: 'booking_count',
    },
]

onMounted(() => {
    fetchInsights()
})
</script>
