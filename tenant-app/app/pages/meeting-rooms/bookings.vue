<template>
    <div class="p-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Room Bookings</h1>
                <p class="text-gray-600 dark:text-gray-400">View and manage meeting room reservations.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button @click="navigateTo('/meeting-rooms')">
                    <template #icon>
                        <AppstoreOutlined />
                    </template>
                    Rooms
                </a-button>
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    New Booking
                </a-button>
            </div>
        </div>

        <a-card :bordered="false" class="shadow-sm">

            <!-- Filters -->
            <div class="flex justify-between items-center mb-4 mt-2">
                <div class="flex gap-4 items-center flex-wrap">
                    <a-input-search v-model:value="searchText" placeholder="Search booking ID or user..."
                        style="width: 250px" />

                    <a-range-picker v-model:value="dateRange" />

                    <a-select v-model:value="statusFilter" placeholder="Filter Status" style="width: 150px" allow-clear>
                        <a-select-option value="Confirmed">Confirmed</a-select-option>
                        <a-select-option value="Completed">Completed</a-select-option>
                        <a-select-option value="Cancelled">Cancelled</a-select-option>
                    </a-select>
                </div>
                <a-button>
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    Export
                </a-button>
            </div>

            <ResponsiveDataView :columns="columns" :data="filteredBookings" :loading="loading" row-key="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'id'">
                        <span class="font-medium">{{ record.id }}</span>
                    </template>

                    <template v-if="column.key === 'room'">
                        <a @click="navigateTo(`/meeting-rooms/${record.roomId}`)"
                            class="hover:underline text-blue-600 dark:text-blue-400">
                            {{ record.roomName }}
                        </a>
                    </template>

                    <template v-if="column.key === 'status'">
                        <BookingStatusBadge :status="record.status" />
                    </template>

                    <template v-if="column.key === 'time'">
                        <div>
                            <div class="font-medium">{{ new Date(record.startTime).toLocaleDateString() }}</div>
                            <div class="text-xs text-gray-500">
                                {{ new Date(record.startTime).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) }} -
                                {{ new Date(record.endTime).toLocaleTimeString([], {
                                    hour: '2-digit', minute: '2-digit'
                                })
                                }}
                            </div>
                        </div>
                    </template>

                    <template v-if="column.key === 'cost'">
                        <div class="text-right">
                            <div>₹{{ record.amountCharged }}</div>
                            <div class="text-xs text-gray-400">{{ record.creditsUsed }} Credits</div>
                        </div>
                    </template>

                    <template v-if="column.key === 'user'">
                        <div>
                            <div class="font-medium text-gray-900 dark:text-white">{{ record.bookedBy }}</div>
                            <div class="text-xs text-gray-500">{{ record.companyName }}</div>
                        </div>
                    </template>

                    <template v-if="column.key === 'actions'">
                        <a-dropdown>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item key="1" danger>Cancel Booking</a-menu-item>
                                    <a-menu-item key="2">View Invoice</a-menu-item>
                                </a-menu>
                            </template>
                            <a-button type="text" shape="circle">
                                <template #icon>
                                    <MoreOutlined />
                                </template>
                            </a-button>
                        </a-dropdown>
                    </template>
                </template>

                <!-- Mobile Card View -->
                <template #mobileCard="{ record }">
                    <a-card
                        class="mb-4 shadow-sm !border-neutral-200 dark:!border-neutral-700 hover:shadow-md transition-shadow"
                        :bordered="true" :bodyStyle="{ padding: '16px' }">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <h4 class="font-bold text-base dark:text-white mb-0">{{ record.id }}</h4>
                                <span class="text-xs text-gray-500">{{ new Date(record.startTime).toLocaleDateString()
                                    }}</span>
                            </div>
                            <BookingStatusBadge :status="record.status" />
                        </div>

                        <div class="space-y-2 text-sm mb-3">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Room:</span>
                                <span class="font-medium dark:text-white cursor-pointer"
                                    @click="navigateTo(`/meeting-rooms/${record.roomId}`)">
                                    {{ record.roomName }}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Time:</span>
                                <span class="dark:text-white">
                                    {{ new Date(record.startTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                    minute:'2-digit'}) }} -
                                    {{ new Date(record.endTime).toLocaleTimeString([], {
                                        hour: '2-digit',
                                    minute:'2-digit'}) }}
                                </span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Booked By:</span>
                                <div class="text-right">
                                    <div class="dark:text-white">{{ record.bookedBy }}</div>
                                    <div class="text-xs text-gray-500">{{ record.companyName }}</div>
                                </div>
                            </div>
                        </div>

                        <div
                            class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div class="text-right">
                                <div class="font-bold text-gray-900 dark:text-white">₹{{ record.amountCharged }}</div>
                                <div class="text-xs text-gray-400">{{ record.creditsUsed }} Credits</div>
                            </div>
                            <a-dropdown>
                                <template #overlay>
                                    <a-menu>
                                        <a-menu-item key="1" danger>Cancel</a-menu-item>
                                        <a-menu-item key="2">View Invoice</a-menu-item>
                                    </a-menu>
                                </template>
                                <a-button size="small">
                                    Actions
                                    <MoreOutlined />
                                </a-button>
                            </a-dropdown>
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
import { storeToRefs } from 'pinia';
import {
    PlusOutlined,
    AppstoreOutlined,
    ExportOutlined,
    MoreOutlined
} from '@ant-design/icons-vue';
import BookingStatusBadge from '../../../components/meeting-rooms/BookingStatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';
import type { Dayjs } from 'dayjs';

definePageMeta({
    middleware: 'auth'
});

// Stores
const roomStore = useMeetingRoomStore();
const { bookings, loading } = storeToRefs(roomStore);

// State
const searchText = ref('');
const statusFilter = ref<string | undefined>(undefined);
const dateRange = ref<[Dayjs, Dayjs]>();

// Columns
const columns = [
    { title: 'Booking ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
    { title: 'Room', dataIndex: 'roomName', key: 'room' },
    { title: 'Date & Time', dataIndex: 'startTime', key: 'time', width: 200 },
    { title: 'User / Company', dataIndex: 'bookedBy', key: 'user' },
    { title: 'Cost', dataIndex: 'amountCharged', key: 'cost', align: 'right', width: 120 },
    { title: '', key: 'actions', width: 50 }
];

// Computed Filtered Data
const filteredBookings = computed(() => {
    let result = [...bookings.value];

    // Status Filter
    if (statusFilter.value) {
        result = result.filter(b => b.status === statusFilter.value);
    }

    // Search
    if (searchText.value) {
        const query = searchText.value.toLowerCase();
        result = result.filter(b =>
            b.id.toLowerCase().includes(query) ||
            b.bookedBy.toLowerCase().includes(query) ||
            b.companyName.toLowerCase().includes(query)
        );
    }

    return result;
});

// Initialization
onMounted(() => {
    roomStore.fetchBookings();
});
</script>
