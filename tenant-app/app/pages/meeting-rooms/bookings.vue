<template>
    <div class="space-y-6">
        <div v-if="!canView" class="text-center py-12">
            <p class="text-gray-500">You don't have permission to view bookings.</p>
        </div>
        <div v-else class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
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
                <a-button v-if="canCreate" type="primary" @click="showBookingModal = true">
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
                    <a @click="openBookingDetails(record)"
                        class="font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer">{{
                        record.bookingId }}</a>
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

            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <h4 class="font-bold text-base text-primary-600 dark:text-primary-400 mb-0 cursor-pointer hover:underline"
                                @click="openBookingDetails(record)">{{ record.bookingId }}</h4>
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
                        <span class="text-gray-500 font-medium">Total Cost:</span>
                        <div class="text-right">
                            <div class="font-bold text-gray-900 dark:text-white">₹{{ record.amountCharged }}</div>
                            <div class="text-xs text-gray-400">{{ record.creditsUsed || 0 }} Credits</div>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- New Booking Modal -->
        <a-modal v-model:open="showBookingModal" title="New Booking" :width="700" :confirm-loading="bookingLoading"
            @ok="handleCreateBooking" @cancel="handleCancelBooking">
            <a-form :model="bookingForm" layout="vertical">
                <a-form-item label="Company" required>
                    <a-select v-model:value="bookingForm.company" placeholder="Select company" show-search
                        :filter-option="filterCompany">
                        <a-select-option v-for="company in companies" :key="company.id" :value="company.id">
                            {{ company.name }}
                        </a-select-option>
                        <template #notFoundContent>
                            <div class="flex flex-col items-center justify-center py-4 gap-3">
                                <span class="text-gray-500 dark:text-gray-400">No companies available</span>
                                <a-button v-if="canCreateCompany" type="primary" size="small"
                                    @click="navigateTo('/companies/create')">
                                    <template #icon>
                                        <PlusOutlined />
                                    </template>
                                    Add Company
                                </a-button>
                            </div>
                        </template>
                    </a-select>
                </a-form-item>

                <a-form-item label="Meeting Room" required>
                    <a-select v-model:value="bookingForm.meetingRoom" placeholder="Select room" show-search
                        :filter-option="filterRoom">
                        <a-select-option v-for="room in rooms" :key="room.id" :value="room.id">
                            {{ room.name }}
                        </a-select-option>
                        <template #notFoundContent>
                            <div class="flex flex-col items-center justify-center py-4 gap-3">
                                <span class="text-gray-500 dark:text-gray-400">No meeting rooms available</span>
                                <a-button v-if="canCreateRoom" type="primary" size="small"
                                    @click="navigateTo('/meeting-rooms/create')">
                                    <template #icon>
                                        <PlusOutlined />
                                    </template>
                                    Add New Room
                                </a-button>
                            </div>
                        </template>
                    </a-select>
                </a-form-item>

                <a-form-item label="Internal Attendees">
                    <a-select v-model:value="bookingForm.internalAttendees" placeholder="Select internal attendees"
                        mode="multiple" :loading="employeesLoading" :disabled="!bookingForm.company" show-search
                        optionFilterProp="label">
                        <a-select-option v-for="user in companyEmployees" :key="user.id" :value="user.id"
                            :label="user.name">
                            {{ user.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="External Attendees (Optional)">
                    <a-select v-model:value="bookingForm.externalAttendees" placeholder="Add external email addresses"
                        mode="tags" :token-separators="[',', ' ']" :open="false">
                    </a-select>
                </a-form-item>

                <a-form-item label="Booking Date" required>
                    <a-date-picker v-model:value="bookingForm.bookingDate" class="w-full"
                        :disabled-date="disabledDate" />
                </a-form-item>

                <a-form-item label="Available Time Slots">
                    <div v-if="!bookingForm.company || !bookingForm.meetingRoom || !bookingForm.bookingDate"
                        class="text-gray-500 dark:text-gray-400 text-sm py-4 text-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        Select company, room and date to view available slots
                    </div>
                    <div v-else-if="loading" class="text-center py-4">
                        <a-spin />
                    </div>
                    <div v-else-if="timeSlots.length === 0"
                        class="text-gray-500 dark:text-gray-400 text-sm py-4 text-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
                        No slots available for selected options
                    </div>
                    <div v-else class="space-y-3">
                        <p class="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                            <InfoCircleOutlined class="text-xs" />
                            Click and drag or use two clicks to select a range of time slots
                        </p>
                        <div class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 select-none"
                            @mouseup="endDrag">
                            <div v-for="slot in timeSlots" :key="slot.id" :class="[
                                'flex flex-col items-center justify-center px-2 py-3 rounded-lg transition-all w-full border-2 select-none',
                                isSlotInPast(slot)
                                    ? 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                                    : slot.isAvailable
                                        ? selectedSlots.includes(slot.id)
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md cursor-pointer'
                                            : 'bg-white dark:bg-neutral-900 border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-200 hover:border-emerald-400 hover:shadow-sm cursor-pointer'
                                        : 'bg-gray-100 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700 text-gray-400 dark:text-gray-500 cursor-not-allowed opacity-50'
                            ]"
                                @mousedown.prevent="handleSlotMouseDown(slot, $event)"
                                @mouseenter="handleSlotMouseEnter(slot)"
                                @click="handleSlotClick(slot)">
                                <span class="text-xs opacity-75 select-none">{{ slot.startTime }}</span>
                                <span class="text-xs font-medium select-none">{{ slot.endTime }}</span>
                            </div>
                        </div>
                        <div v-if="selectedSlots.length > 0" class="text-sm text-gray-600 dark:text-gray-300 mt-2">
                            Selected: <span class="font-medium">{{ selectedSlots.length }} slot(s)</span>
                            ({{ selectedSlots.length * 30 }} minutes)
                        </div>
                    </div>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Booking Detail Modal -->
        <a-modal v-model:open="showDetailModal" title="Booking Details" :width="600" :footer="null">
            <template v-if="selectedBookingDetails">
                <div class="space-y-6">
                    <!-- Header section -->
                    <div class="flex justify-between items-start border-b pb-4">
                        <div>
                            <h2 class="text-xl font-bold mb-1">{{ selectedBookingDetails.meetingRoomName }}</h2>
                            <p class="text-sm text-gray-500 mb-0">Booking ID: {{ selectedBookingDetails.bookingId }}</p>
                        </div>
                        <BookingStatusBadge :status="selectedBookingDetails.bookingStatus" />
                    </div>

                    <!-- Details sections -->
                    <a-descriptions :column="2" layout="vertical" bordered size="small">
                        <a-descriptions-item label="Date">
                            <span class="font-medium">{{ selectedBookingDetails.bookingDate }}</span>
                        </a-descriptions-item>
                        <a-descriptions-item label="Time">
                            <span class="font-medium">
                                {{ selectedBookingDetails.startTime?.substring(0, 5) }} -
                                {{ selectedBookingDetails.endTime?.substring(0, 5) }}
                            </span>
                        </a-descriptions-item>
                        <a-descriptions-item label="Booked By">
                            <div>{{ selectedBookingDetails.userName }}</div>
                            <div class="text-xs text-gray-500">{{ selectedBookingDetails.companyName }}</div>
                        </a-descriptions-item>
                        <a-descriptions-item label="Cost">
                            <div>₹{{ selectedBookingDetails.amountCharged }}</div>
                            <div class="text-xs text-gray-500">{{ selectedBookingDetails.creditsUsed || 0 }} Credits
                            </div>
                        </a-descriptions-item>
                    </a-descriptions>

                    <!-- Attendees Section -->
                    <div v-if="selectedBookingDetails.attendees && selectedBookingDetails.attendees.length > 0">
                        <h3 class="text-base font-semibold mb-3 border-b pb-2">Attendees</h3>
                        <a-list item-layout="horizontal" :data-source="selectedBookingDetails.attendees" size="small"
                            :bordered="true">
                            <template #renderItem="{ item }">
                                <a-list-item>
                                    <a-list-item-meta>
                                        <template #title>
                                            <span v-if="item.attendee_type === 'INTERNAL'">
                                                {{ item.user_name || item.name || 'Internal Employee' }}
                                            </span>
                                            <span v-else>
                                                {{ item.email || item.name || 'External Guest' }}
                                            </span>
                                        </template>
                                        <template #avatar>
                                            <a-avatar size="small" class="bg-primary-100 text-primary-600">
                                                {{ item.attendee_type === 'INTERNAL' ? 'IN' : 'EX' }}
                                            </a-avatar>
                                        </template>
                                    </a-list-item-meta>
                                    <template #actions>
                                        <a-tag :color="item.attendee_type === 'INTERNAL' ? 'blue' : 'orange'">
                                            {{ item.attendee_type }}
                                        </a-tag>
                                    </template>
                                </a-list-item>
                            </template>
                        </a-list>
                    </div>
                    <div v-else class="text-center py-4 bg-gray-50 rounded border border-gray-100 italic text-gray-500">
                        No additional attendees for this booking.
                    </div>
                </div>
            </template>
        </a-modal>

    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { useAuthStore } from '../../../stores/auth';
import { useCompanyService } from '../../../composables/companyService';
import { useFacilityService } from '../../../composables/facilityService';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import dayjs, { type Dayjs } from 'dayjs';
import {
    PlusOutlined,
    AppstoreOutlined,
    ExportOutlined,
    MoreOutlined,
    InfoCircleOutlined
} from '@ant-design/icons-vue';
import BookingStatusBadge from '../../../components/meeting-rooms/BookingStatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';

definePageMeta({
    middleware: 'auth'
});

// Stores
const roomStore = useMeetingRoomStore();
const authStore = useAuthStore();
const { bookings, loading, rooms, timeSlots } = storeToRefs(roomStore);

const canView = computed(() => authStore.hasPermission('meeting-rooms-bookings:view'))
const canCreate = computed(() => authStore.hasPermission('meeting-rooms-bookings:create'))
const canAction = computed(() => authStore.hasPermission('meeting-rooms-bookings:action'))
const canCreateRoom = computed(() => authStore.hasPermission('meeting-rooms-list:create'))
const canCreateCompany = computed(() => authStore.hasPermission('companies-list:create'))

if (!canView.value) {
    navigateTo('/meeting-rooms');
}

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
    amountCharged: 0,
    internalAttendees: [] as string[],
    externalAttendees: [] as string[]
});
const selectedSlots = ref<string[]>([]);
const isDragging = ref(false);
const dragStartSlotId = ref<string | null>(null);
const hasDragged = ref(false);
const rangeAnchor = ref<string | null>(null);
const companyEmployees = ref<Array<{ id: string; name: string }>>([]);
const employeesLoading = ref(false);

// Booking detail modal state
const showDetailModal = ref(false);
const selectedBookingDetails = ref<any | null>(null);

const { $api } = useNuxtApp();

// Columns
const columns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'id', width: 150 },
    { title: 'Status', dataIndex: 'bookingStatus', key: 'status', width: 120 },
    { title: 'Room', dataIndex: 'meetingRoomName', key: 'room' },
    { title: 'Date', dataIndex: 'bookingDate', key: 'date', width: 120 },
    { title: 'Time', dataIndex: 'startTime', key: 'time', width: 120 },
    { title: 'User / Company', dataIndex: 'userName', key: 'user' },
    { title: 'Cost', dataIndex: 'amountCharged', key: 'cost', align: 'right', width: 120 }
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

const isSlotInPast = (slot: { startTime: string }) => {
    if (!bookingForm.value.bookingDate) return false;
    const today = dayjs().startOf('day');
    const selectedDate = bookingForm.value.bookingDate.startOf('day');
    if (!selectedDate.isSame(today, 'day')) return false;
    const now = dayjs();
    const slotTime = dayjs(`${selectedDate.format('YYYY-MM-DD')} ${slot.startTime}`);
    return slotTime.isBefore(now);
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

const selectSlotRange = (fromId: string, toId: string) => {
    const fromIndex = timeSlots.value.findIndex(s => s.id === fromId);
    const toIndex = timeSlots.value.findIndex(s => s.id === toId);
    if (fromIndex === -1 || toIndex === -1) return;
    const start = Math.min(fromIndex, toIndex);
    const end = Math.max(fromIndex, toIndex);
    for (let i = start; i <= end; i++) {
        const slot = timeSlots.value[i];
        if (slot.isAvailable && !isSlotInPast(slot) && !selectedSlots.value.includes(slot.id)) {
            selectedSlots.value.push(slot.id);
        }
    }
};

const handleSlotMouseDown = (slot: any, event: MouseEvent) => {
    if (!slot.isAvailable || isSlotInPast(slot)) return;
    event.preventDefault();
    isDragging.value = true;
    dragStartSlotId.value = slot.id;
    hasDragged.value = false;
};

const handleSlotMouseEnter = (slot: any) => {
    if (!isDragging.value || !dragStartSlotId.value) return;
    if (!slot.isAvailable || isSlotInPast(slot)) return;
    hasDragged.value = true;
    selectedSlots.value = [];
    selectSlotRange(dragStartSlotId.value, slot.id);
};

const endDrag = () => {
    isDragging.value = false;
    dragStartSlotId.value = null;
};

const handleSlotClick = (slot: any) => {
    if (!slot.isAvailable || isSlotInPast(slot)) return;
    if (hasDragged.value) {
        hasDragged.value = false;
        return;
    }
    if (rangeAnchor.value && rangeAnchor.value !== slot.id) {
        selectSlotRange(rangeAnchor.value, slot.id);
        rangeAnchor.value = null;
    } else {
        toggleSlot(slot.id);
        rangeAnchor.value = selectedSlots.value.includes(slot.id) ? slot.id : null;
    }
};

const fetchCompanyEmployees = async () => {
    if (!bookingForm.value.company) {
        companyEmployees.value = [];
        return;
    }
    employeesLoading.value = true;
    try {
        const result = await $api<any>(`/api/portal/users/org_portal/list/?company_id=${bookingForm.value.company}&app_name=hub&page_size=99999`);
        let users: any[] = [];
        if (result.success && Array.isArray(result.data)) {
            users = result.data;
        } else if (result.success && result.data?.results) {
            users = result.data.results;
        }
        companyEmployees.value = users.map((u: any) => ({
            id: u.id,
            name: u.full_name || u.email
        }));
    } catch (err) {
        console.error('Failed to fetch employees:', err);
        companyEmployees.value = [];
    } finally {
        employeesLoading.value = false;
    }
};

watch(() => bookingForm.value.company, () => {
    selectedSlots.value = [];
    bookingForm.value.internalAttendees = [];
    fetchTimeSlots();
    fetchCompanyEmployees();
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
        const attendeesPayload: Array<{ attendee_type: string; user?: string; email?: string }> = [];
        bookingForm.value.internalAttendees.forEach(userId => {
            attendeesPayload.push({ attendee_type: 'INTERNAL', user: userId });
        });
        bookingForm.value.externalAttendees.forEach(email => {
            attendeesPayload.push({ attendee_type: 'EXTERNAL', email: email });
        });

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
            })),
            attendees: attendeesPayload
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
        amountCharged: 0,
        internalAttendees: [],
        externalAttendees: []
    };
    selectedSlots.value = [];
    companyEmployees.value = [];
};

// Initialization
onMounted(async () => {
    try {
        await Promise.all([
            roomStore.fetchBookings(),
            roomStore.fetchRooms()
        ]);
        const { companies: companiesData } = await companyService.getCompanies();
        companies.value = companiesData.map(c => ({ id: c.id, name: c.name }));
    } catch (error) {
        console.error('Failed to load initial data:', error);
    }
});

const openBookingDetails = (booking: any) => {
    selectedBookingDetails.value = booking;
    showDetailModal.value = true;
};
</script>
