<template>
    <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Meeting Rooms</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage meeting spaces and configurations.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button @click="navigateTo('/meeting-rooms/bookings')">
                    <template #icon>
                        <CalendarOutlined />
                    </template>
                    Bookings
                </a-button>
                <a-button @click="navigateTo('/meeting-rooms/insights')">
                    <template #icon>
                        <BarChartOutlined />
                    </template>
                    Insights
                </a-button>
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Add Room
                </a-button>
            </div>
        </div>

        <a-card :bordered="false" class="shadow-sm">

            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <a-input-search v-model:value="searchText" placeholder="Search rooms..." class="w-full md:w-64" />

                    <a-select v-model:value="facilityFilter" placeholder="Filter by Facility" class="w-full md:w-48"
                        allow-clear>
                        <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">{{ fac.name
                            }}</a-select-option>
                    </a-select>

                    <a-select v-model:value="typeFilter" placeholder="Room Type" class="w-full md:w-44" allow-clear>
                        <a-select-option value="Meeting Room">Meeting Room</a-select-option>
                        <a-select-option value="Board Room">Board Room</a-select-option>
                        <a-select-option value="Discussion Room">Discussion Room</a-select-option>
                        <a-select-option value="Training Room">Training Room</a-select-option>
                    </a-select>
                </div>
            </div>

            <ResponsiveDataView :columns="columns" :data="filteredRooms" :loading="loading" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <div class="flex items-center gap-3">
                            <a-avatar shape="square" :size="40" :src="record.images?.[0] || null">
                                <template #icon>
                                    <PictureOutlined />
                                </template>
                            </a-avatar>
                            <div>
                                <a @click="navigateTo(`/meeting-rooms/${record.id}`)"
                                    class="font-medium hover:underline block text-gray-900 dark:text-white">{{
                                        record.name }}</a>
                                <span class="text-xs text-gray-500">{{ record.id }}</span>
                            </div>
                        </div>
                    </template>

                    <template v-if="column.key === 'status'">
                        <RoomStatusBadge :status="record.status" />
                    </template>

                    <template v-if="column.key === 'capacity'">
                        <span class="flex items-center gap-1">
                            <UserOutlined class="text-gray-400" />
                            {{ record.capacity }} PAX
                        </span>
                    </template>

                    <template v-if="column.key === 'pricing'">
                        <div>
                            <div class="font-medium">₹{{ record.pricePerHour }}/hr</div>
                            <div class="text-xs text-gray-500">{{ record.creditCost }} Credits/hr</div>
                        </div>
                    </template>

                    <template v-if="column.key === 'location'">
                        <div>
                            <div class="font-medium">{{ record.facilityName }}</div>
                            <div class="text-xs text-gray-500">{{ record.locationDetails }}</div>
                        </div>
                    </template>

                    <template v-if="column.key === 'actions'">
                        <a-tooltip title="Edit Configuration">
                            <a-button type="text" shape="circle" @click="navigateTo(`/meeting-rooms/${record.id}`)">
                                <template #icon>
                                    <SettingOutlined />
                                </template>
                            </a-button>
                        </a-tooltip>
                    </template>
                </template>

                <!-- Mobile Card View -->
                <template #mobileCard="{ record }">
                    <a-card
                        class="mb-4 shadow-sm !border-neutral-200 dark:!border-neutral-700 hover:shadow-md transition-shadow"
                        :bordered="true" :bodyStyle="{ padding: '16px' }">
                        <div class="flex justify-between items-start mb-3">
                            <div class="flex items-center gap-3">
                                <a-avatar shape="square" :size="40" :src="record.images?.[0] || null">
                                    <template #icon>
                                        <PictureOutlined />
                                    </template>
                                </a-avatar>
                                <div>
                                    <h4 class="font-bold text-base dark:text-white cursor-pointer"
                                        @click="navigateTo(`/meeting-rooms/${record.id}`)">
                                        {{ record.name }}
                                    </h4>
                                    <div class="text-xs text-gray-500">{{ record.id }}</div>
                                </div>
                            </div>
                            <RoomStatusBadge :status="record.status" />
                        </div>

                        <div class="grid grid-cols-2 gap-y-2 text-sm mb-3">
                            <div class="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                <UserOutlined /> {{ record.capacity }} PAX
                            </div>
                            <div class="text-gray-600 dark:text-gray-400">
                                {{ record.type }}
                            </div>
                            <div class="col-span-2 text-gray-600 dark:text-gray-400">
                                {{ record.facilityName }}
                            </div>
                        </div>

                        <div
                            class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div>
                                <div class="font-bold text-gray-900 dark:text-white">₹{{ record.pricePerHour }}/hr</div>
                                <div class="text-xs text-gray-400">{{ record.creditCost }} Credits</div>
                            </div>
                            <a-button @click="navigateTo(`/meeting-rooms/${record.id}`)">
                                <template #icon>
                                    <SettingOutlined />
                                </template>
                                Configure
                            </a-button>
                        </div>
                    </a-card>
                </template>
            </ResponsiveDataView>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { useFacilityStore } from '../../../stores/facility';
import { storeToRefs } from 'pinia';
import {
    PlusOutlined,
    BarChartOutlined,
    CalendarOutlined,
    SettingOutlined,
    UserOutlined,
    PictureOutlined
} from '@ant-design/icons-vue';
import RoomStatusBadge from '../../../components/meeting-rooms/RoomStatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';

definePageMeta({
    middleware: 'auth'
});

// Stores
const roomStore = useMeetingRoomStore();
const facilityStore = useFacilityStore();
const { rooms, loading } = storeToRefs(roomStore);
const { facilities } = storeToRefs(facilityStore);

// State
const searchText = ref('');
const facilityFilter = ref<string | undefined>(undefined);
const typeFilter = ref<string | undefined>(undefined);

// Columns
const columns = [
    { title: 'Room Details', dataIndex: 'name', key: 'name' },
    { title: 'Type', dataIndex: 'type', key: 'type', width: 150 },
    { title: 'Capacity', dataIndex: 'capacity', key: 'capacity', width: 120 },
    { title: 'Location', dataIndex: 'location', key: 'location', width: 200 },
    { title: 'Pricing', dataIndex: 'pricing', key: 'pricing', width: 150 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
    { title: '', key: 'actions', width: 60 }
];

// Computed Filtered Data
const filteredRooms = computed(() => {
    let result = [...rooms.value];

    // Facility Filter
    if (facilityFilter.value) {
        result = result.filter(r => r.facilityId === facilityFilter.value);
    }

    // Type Filter
    if (typeFilter.value) {
        result = result.filter(r => r.type === typeFilter.value);
    }

    // Search
    if (searchText.value) {
        const query = searchText.value.toLowerCase();
        result = result.filter(r =>
            r.name.toLowerCase().includes(query) ||
            r.id.toLowerCase().includes(query)
        );
    }

    return result;
});

// Initialization
onMounted(async () => {
    await Promise.all([
        roomStore.fetchRooms(),
        facilityStore.fetchFacilities()
    ]);
});
</script>
