<template>
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Total Bookings</p>
                    <h3 class="text-2xl font-bold mt-1 dark:text-white">{{ stats?.totalBookings || 0 }}</h3>
                </div>
                <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-full text-purple-500">
                    <CalendarOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">All time</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Total Revenue</p>
                    <h3 class="text-2xl font-bold mt-1 text-green-600 dark:text-green-400">₹{{ stats?.totalRevenue || 0
                        }}</h3>
                </div>
                <div class="p-3 bg-green-50 dark:bg-green-900/20 rounded-full text-green-500">
                    <span class="text-xl font-bold px-1">₹</span>
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Gross revenue</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Utilization</p>
                    <h3 class="text-2xl font-bold mt-1 text-blue-600 dark:text-blue-400">{{ stats?.utilizationRate || 0
                        }}%</h3>
                </div>
                <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                    <PieChartOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Room occupancy</p>
        </a-card>

        <a-card :bordered="false" class="shadow-sm hover:shadow-md transition-shadow">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-gray-500 text-xs uppercase font-semibold">Avg. Daily Bookings</p>
                    <h3 class="text-2xl font-bold mt-1 text-orange-600 dark:text-orange-400">{{ stats?.avgDailyBookings
                        || 0 }}</h3>
                </div>
                <div class="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-full text-orange-500">
                    <BarChartOutlined class="text-xl" />
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-2">Active usage</p>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { CalendarOutlined, PieChartOutlined, BarChartOutlined } from '@ant-design/icons-vue';
import type { RoomStats } from '../../../composables/meetingRoomService';

defineProps<{
    stats: RoomStats | null;
}>();
</script>
