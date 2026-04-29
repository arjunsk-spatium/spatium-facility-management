<template>
    <div class="space-y-6">
        <div v-if="!canView" class="text-center py-12">
            <p class="text-gray-500">You don't have permission to view meeting rooms.</p>
        </div>
        <template v-else>
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Meeting Rooms</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage meeting spaces and configurations.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button v-if="canViewBookings" @click="navigateTo('/meeting-rooms/bookings')">
                    <template #icon>
                        <CalendarOutlined />
                    </template>
                    Bookings
                </a-button>
                <a-button v-if="canViewInsights" @click="navigateTo('/meeting-rooms/insights')">
                    <template #icon>
                        <BarChartOutlined />
                    </template>
                    Insights
                </a-button>
                <a-button v-if="canCreate" type="primary" @click="navigateTo('/meeting-rooms/create')">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Add Room
                </a-button>
            </div>
        </div>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a-input-search 
                    v-model:value="searchText" 
                    placeholder="Search rooms..." 
                    class="w-full md:w-64"
                    @search="handleSearch"
                    allow-clear
                />

                <a-select 
                    v-model:value="facilityFilter" 
                    placeholder="Filter by Facility" 
                    class="w-full md:w-48"
                    allow-clear 
                    @change="handleFacilityFilterChange"
                >
                    <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">{{ fac.name
                    }}</a-select-option>
                </a-select>
            </div>
        </div>

        <ResponsiveDataView 
            :columns="columns" 
            :data="rooms" 
            :loading="loading" 
            row-key="id"
            :pagination="paginationConfig"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    <div class="flex items-center gap-3">
                        <a-avatar shape="square" :size="40" :src="record.images?.[0]?.image || null">
                            <template #icon>
                                <PictureOutlined />
                            </template>
                        </a-avatar>
                        <div>
                            <a @click="navigateTo(`/meeting-rooms/${record.id}`)"
                                class="font-medium hover:underline block text-gray-900 dark:text-white">{{
                                    record.name }}</a>
                        </div>
                    </div>
                </template>

                <template v-if="column.key === 'status'">
                    <RoomStatusBadge :status="record.status" />
                </template>

                <template v-if="column.key === 'capacity'">
                    <span class="flex items-center gap-1">
                        <UserOutlined class="text-gray-400" />
                        {{ record.pax }} PAX
                    </span>
                </template>

                <template v-if="column.key === 'pricing'">
                    <div>
                        <div class="font-medium">₹{{ record.price }}/30 min</div>
                        <div class="text-xs text-gray-500">{{ record.credits }} Credits/30 min</div>
                    </div>
                </template>

                <template v-if="column.key === 'location'">
                    <div>
                        <div class="font-medium">{{ record.facility }}</div>
                    </div>
                </template>
            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <a-avatar shape="square" :size="40" :src="record.images?.[0]?.image || null">
                                <template #icon>
                                    <PictureOutlined />
                                </template>
                            </a-avatar>
                            <div>
                                <h4 class="font-bold text-base dark:text-white cursor-pointer"
                                    @click="navigateTo(`/meeting-rooms/${record.id}`)">
                                    {{ record.name }}
                                </h4>
                            </div>
                        </div>
                        <RoomStatusBadge :status="record.status" />
                    </div>

                    <div class="grid grid-cols-2 gap-y-2 text-sm mb-3">
                        <div class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                            <UserOutlined /> {{ record.pax }} PAX
                        </div>
                        <div class="text-gray-600 dark:text-gray-400">
                            {{ record.room_type_details?.name }}
                        </div>
                        <div class="col-span-2 text-gray-600 dark:text-gray-400">
                            {{ record.facility }}
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <div class="font-bold text-gray-900 dark:text-white">₹{{ record.price }}/30 min</div>
                            <div class="text-xs text-gray-400">{{ record.credits }} Credits/30 min</div>
                        </div>
                        <a-button type="link" size="small" @click="navigateTo(`/meeting-rooms/${record.id}`)">
                            View Details
                        </a-button>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { useFacilityStore } from '../../../stores/facility';
import { useAuthStore } from '../../../stores/auth';
import { storeToRefs } from 'pinia';
import {
    PlusOutlined,
    BarChartOutlined,
    CalendarOutlined,
    UserOutlined,
    PictureOutlined
} from '@ant-design/icons-vue';
import RoomStatusBadge from '../../../components/meeting-rooms/RoomStatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';
import type { RoomListParams } from '../../../composables/meetingRoomService';

definePageMeta({
    middleware: 'auth'
});

// Stores
const roomStore = useMeetingRoomStore();
const facilityStore = useFacilityStore();
const authStore = useAuthStore();
const { rooms, loading, count, page, pageSize } = storeToRefs(roomStore);
const { facilities } = storeToRefs(facilityStore);

const canView = computed(() => authStore.hasPermission('meeting-rooms-list:view'))
const canCreate = computed(() => authStore.hasPermission('meeting-rooms-list:create'))
const canUpdate = computed(() => authStore.hasPermission('meeting-rooms-list:update'))
const canDelete = computed(() => authStore.hasPermission('meeting-rooms-list:delete'))
const canViewInsights = computed(() => authStore.hasPermission('meeting-rooms-insights:view'))
const canViewBookings = computed(() => authStore.hasPermission('meeting-rooms-bookings:view'))

// State
const searchText = ref('');
const facilityFilter = ref<string | undefined>(undefined);

// Columns
const columns = [
    { title: 'Room Details', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: ['room_type_details', 'name'], key: 'type', width: 150 },
    { title: 'Capacity', dataIndex: 'pax', key: 'capacity', width: 120 },
    { title: 'Location', dataIndex: 'facility', key: 'location', width: 200 },
    { title: 'Pricing', dataIndex: 'price', key: 'pricing', width: 150 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
];

// Pagination config
const paginationConfig = computed(() => ({
    total: count.value,
    current: page.value,
    pageSize: pageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: handlePageChange,
}));

const handlePageChange = async (pageNum: number, newPageSize: number) => {
    const params: RoomListParams = { page: pageNum };
    if (facilityFilter.value) {
        params.facility_id = facilityFilter.value;
    }
    if (searchText.value) {
        params.search = searchText.value;
    }
    if (newPageSize !== pageSize.value) {
        params.page_size = newPageSize;
    }
    await roomStore.fetchRooms(params);
};

const handleSearch = () => {
    fetchRoomsByFilter();
};

const handleFacilityFilterChange = () => {
    fetchRoomsByFilter();
};

const fetchRoomsByFilter = async () => {
    const params: RoomListParams = { page: 1 };
    if (facilityFilter.value) {
        params.facility_id = facilityFilter.value;
    }
    if (searchText.value) {
        params.search = searchText.value;
    }
    await roomStore.fetchRooms(params);
};

// Initialization
onMounted(async () => {
    await Promise.all([
        roomStore.fetchRooms(),
        facilityStore.fetchFacilities()
    ]);
});
</script>
