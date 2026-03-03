<template>
    <div class="space-y-6">
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
                <a-button type="primary" @click="showBookingModal = true">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    New Booking
                </a-button>
            </div>
        </div>



        <!-- Filters -->
        <!-- Filters -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a-input-search v-model:value="searchText" placeholder="Search booking ID or user..."
                    class="w-full md:w-64" />

                <a-range-picker v-model:value="dateRange" class="w-full md:w-auto" />

                <a-select v-model:value="statusFilter" placeholder="Filter Status" class="w-full md:w-40" allow-clear>
                    <a-select-option value="PENDING">Pending</a-select-option>
                    <a-select-option value="CONFIRMED">Confirmed</a-select-option>
                    <a-select-option value="COMPLETED">Completed</a-select-option>
                    <a-select-option value="CANCELLED">Cancelled</a-select-option>
                </a-select>
            </div>
            <a-button class="w-full md:w-auto">
                <template #icon>
                    <ExportOutlined />
                </template>
                Export
            </a-button>
        </div>

        <ResponsiveDataView :columns="columns" :data="filteredBookings" :loading="loading" row-key="bookingId">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                    <span class="font-medium">{{ record.bookingId }}</span>
                </template>

                <template v-if="column.key === 'room'">
                    <a @click="navigateTo(`/meeting-rooms/${record.meetingRoom}`)"
                        class="hover:underline text-blue-600 dark:text-blue-400">
                        {{ record.meetingRoomName }}
                    </a>
                </template>

                <template v-if="column.key === 'status'">
                    <BookingStatusBadge :status="record.bookingStatus" />
                </template>

                <template v-if="column.key === 'time'">
                    <div class="text-sm">
                        {{ record.startTime?.substring(0, 5) }} - {{ record.endTime?.substring(0, 5) }}
                    </div>
                </template>

                <template v-if="column.key === 'cost'">
                    <div class="text-right">
                        <div>₹{{ record.amountCharged }}</div>
                        <div class="text-xs text-gray-400">{{ record.creditsUsed || 0 }} Credits</div>
                    </div>
                </template>

                <template v-if="column.key === 'user'">
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ record.userName }}</div>
                        <div class="text-xs text-gray-500">{{ record.companyName }}</div>
                    </div>
                </template>

                <template v-if="column.key === 'date'">
                    <div class="font-medium">{{ record.bookingDate }}</div>
                </template>

                <template v-if="column.key === 'time'">
                    <div class="text-sm">
                        {{ record.startTime?.substring(0, 5) }} - {{ record.endTime?.substring(0, 5) }}
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
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="font-bold text-base dark:text-white mb-0">{{ record.bookingId }}</h4>
                            <span class="text-xs text-gray-500">{{ record.bookingDate }}</span>
                        </div>
                        <BookingStatusBadge :status="record.bookingStatus" />
                    </div>

                    <div class="space-y-2 text-sm mb-3">
                        <div class="flex justify-between">
                            <span class="text-gray-500">Room:</span>
                            <span class="font-medium dark:text-white cursor-pointer"
                                @click="navigateTo(`/meeting-rooms/${record.meetingRoom}`)">
                                {{ record.meetingRoomName }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Time:</span>
                            <span class="dark:text-white">
                                {{ record.startTime?.substring(0, 5) }} - {{ record.endTime?.substring(0, 5) }}
                            </span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-500">Booked By:</span>
                            <div class="text-right">
                                <div class="dark:text-white">{{ record.userName }}</div>
                                <div class="text-xs text-gray-500">{{ record.companyName }}</div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div class="text-right">
                            <div class="font-bold text-gray-900 dark:text-white">₹{{ record.amountCharged }}</div>
                            <div class="text-xs text-gray-400">{{ record.creditsUsed || 0 }} Credits</div>
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

        <!-- New Booking Modal -->
        <a-modal v-model:open="showBookingModal" title="New Booking" :width="700" :confirm-loading="bookingLoading" @ok="handleCreateBooking" @cancel="handleCancelBooking">
            <a-form :model="bookingForm" layout="vertical">
                <a-form-item label="Company" required>
                    <a-select v-model:value="bookingForm.company" placeholder="Select company" show-search :filter-option="filterCompany">
                        <a-select-option v-for="company in companies" :key="company.id" :value="company.id">
                            {{ company.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Meeting Room" required>
                    <a-select v-model:value="bookingForm.meetingRoom" placeholder="Select room" show-search :filter-option="filterRoom">
                        <a-select-option v-for="room in rooms" :key="room.id" :value="room.id">
                            {{ room.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Booking Date" required>
                    <a-date-picker v-model:value="bookingForm.bookingDate" class="w-full" :disabled-date="disabledDate" />
                </a-form-item>

                <a-form-item label="Available Time Slots">
                    <div v-if="!bookingForm.company || !bookingForm.meetingRoom || !bookingForm.bookingDate" class="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                        Select company, room and date to view available slots
                    </div>
                    <div v-else-if="loading" class="text-center py-4">
                        <a-spin />
                    </div>
                    <div v-else-if="timeSlots.length === 0" class="text-gray-500 text-sm py-4 text-center bg-gray-50 rounded-lg">
                        No slots available for selected options
                    </div>
                    <div v-else class="space-y-3">
                        <div class="flex flex-wrap gap-2">
                            <div
                                v-for="slot in timeSlots"
                                :key="slot.id"
                                :class="[
                                    'flex flex-col items-center justify-center px-4 py-3 rounded-lg cursor-pointer transition-all min-w-[90px] border-2',
                                    slot.isAvailable
                                        ? selectedSlots.includes(slot.id)
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:shadow-sm'
                                        : 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                ]"
                                @click="slot.isAvailable && toggleSlot(slot.id)"
                            >
                                <span class="text-xs opacity-75">{{ slot.startTime }}</span>
                                <span class="text-xs font-medium">{{ slot.endTime }}</span>
                            </div>
                        </div>
                        <div v-if="selectedSlots.length > 0" class="text-sm text-gray-600 mt-2">
                            Selected: <span class="font-medium">{{ selectedSlots.length }} slot(s)</span>
                            ({{ selectedSlots.length * 30 }} minutes)
                        </div>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { useCompanyService } from '../../../composables/companyService';
import { useFacilityService } from '../../../composables/facilityService';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import {
    PlusOutlined,
    AppstoreOutlined,
    ExportOutlined,
    MoreOutlined
} from '@ant-design/icons-vue';
import BookingStatusBadge from '../../../components/meeting-rooms/BookingStatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';

definePageMeta({
    middleware: 'auth'
});

// Stores
const roomStore = useMeetingRoomStore();
const { bookings, loading, rooms, timeSlots } = storeToRefs(roomStore);

// Services
const companyService = useCompanyService();
const facilityService = useFacilityService();

// State
const searchText = ref('');
const statusFilter = ref<string | undefined>(undefined);
const dateRange = ref<[Dayjs, Dayjs]>();

// Booking modal state
const showBookingModal = ref(false);
const bookingLoading = ref(false);
const companies = ref<Array<{ id: string; name: string }>>([]);
const bookingForm = ref({
    company: null as string | null,
    meetingRoom: null as string | null,
    bookingDate: null as Dayjs | null,
    amountCharged: 0
});
const selectedSlots = ref<string[]>([]);

// Columns
const columns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'id', width: 150 },
    { title: 'Status', dataIndex: 'bookingStatus', key: 'status', width: 120 },
    { title: 'Room', dataIndex: 'meetingRoomName', key: 'room' },
    { title: 'Date', dataIndex: 'bookingDate', key: 'date', width: 120 },
    { title: 'Time', dataIndex: 'startTime', key: 'time', width: 120 },
    { title: 'User / Company', dataIndex: 'userName', key: 'user' },
    { title: 'Cost', dataIndex: 'amountCharged', key: 'cost', align: 'right', width: 120 },
    { title: '', key: 'actions', width: 50 }
];

// Computed
const availableSlots = computed(() => timeSlots.value.filter(s => s.isAvailable));

const filteredBookings = computed(() => {
    if (!bookings.value || !Array.isArray(bookings.value)) return [];
    let result = [...bookings.value];
    if (statusFilter.value) {
        result = result.filter(b => b.bookingStatus === statusFilter.value);
    }
    if (searchText.value) {
        const query = searchText.value.toLowerCase();
        result = result.filter(b =>
            (b.id || '').toLowerCase().includes(query) ||
            (b.userName || '').toLowerCase().includes(query) ||
            (b.companyName || '').toLowerCase().includes(query)
        );
    }
    return result;
});

// Methods
const filterCompany = (input: string, option: any) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
};

const filterRoom = (input: string, option: any) => {
    return option.children.toLowerCase().includes(input.toLowerCase());
};

const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day');
};

const fetchTimeSlots = () => {
    if (bookingForm.value.company && bookingForm.value.meetingRoom && bookingForm.value.bookingDate) {
        roomStore.fetchTimeSlots(
            bookingForm.value.meetingRoom,
            bookingForm.value.bookingDate.format('YYYY-MM-DD'),
            bookingForm.value.company
        );
    }
};

const toggleSlot = (slotId: string) => {
    const index = selectedSlots.value.indexOf(slotId);
    if (index === -1) {
        selectedSlots.value.push(slotId);
    } else {
        selectedSlots.value.splice(index, 1);
    }
};

watch(() => bookingForm.value.company, () => {
    selectedSlots.value = [];
    fetchTimeSlots();
});

watch(() => bookingForm.value.bookingDate, () => {
    selectedSlots.value = [];
    fetchTimeSlots();
});

watch(() => bookingForm.value.meetingRoom, () => {
    selectedSlots.value = [];
    fetchTimeSlots();
});

const handleCreateBooking = async () => {
    if (!bookingForm.value.company || !bookingForm.value.meetingRoom || !bookingForm.value.bookingDate) {
        message.error('Please fill all required fields');
        return;
    }

    if (selectedSlots.value.length === 0) {
        message.error('Please select at least one time slot');
        return;
    }

    const selectedSlotsData = timeSlots.value.filter(s => selectedSlots.value.includes(s.id));
    const sortedSlots = [...selectedSlotsData].sort((a, b) => a.startTime.localeCompare(b.startTime));
    const startTime = sortedSlots[0]?.startTime || '09:00';
    const endTime = sortedSlots[sortedSlots.length - 1]?.endTime || '10:00';
    const hours = selectedSlots.value.length * 0.5;

    bookingLoading.value = true;
    try {
        await roomStore.createBooking({
            company: bookingForm.value.company,
            meetingRoom: bookingForm.value.meetingRoom,
            bookingDate: bookingForm.value.bookingDate.format('YYYY-MM-DD'),
            startTime,
            endTime,
            bookingType: 'INTERNAL',
            bookingHours: hours,
            amountCharged: bookingForm.value.amountCharged,
            slots: selectedSlots.value.map(slotId => ({ 
                slot: slotId
            }))
        });
        message.success('Booking created successfully');
        showBookingModal.value = false;
        resetBookingForm();
        roomStore.fetchBookings();
    } catch (error: any) {
        message.error(error.message || 'Failed to create booking');
    } finally {
        bookingLoading.value = false;
    }
};

const handleCancelBooking = () => {
    resetBookingForm();
    showBookingModal.value = false;
};

const resetBookingForm = () => {
    bookingForm.value = {
        company: null,
        meetingRoom: null,
        bookingDate: null,
        amountCharged: 0
    };
    selectedSlots.value = [];
};

// Initialization
onMounted(async () => {
    try {
        await Promise.all([
            roomStore.fetchBookings(),
            roomStore.fetchRooms()
        ]);
        const companiesData = await companyService.getCompanies();
        companies.value = companiesData.map(c => ({ id: c.id, name: c.name }));
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
});
</script>
