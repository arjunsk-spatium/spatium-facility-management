<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Bookings</h1>
                <p class="text-gray-600 dark:text-gray-400">View and manage meeting room reservations for your company.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button :loading="exporting" @click="handleExport">
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    Export
                </a-button>
                <a-button type="default" @click="fetchBookingsByFilter">
                    <template #icon>
                        <ReloadOutlined />
                    </template>
                    Refresh
                </a-button>
            </div>
        </div>

        <!-- Filters Toolbar -->
        <div class="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3">
            <!-- Search -->
            <a-input-search 
                v-model:value="searchText" 
                placeholder="Search booking ID or user..." 
                allow-clear 
                style="min-width: 220px;"
                class="w-full sm:w-64" 
                @search="handleFilterChange" 
            />

            <!-- Facility Filter -->
            <a-select 
                v-model:value="selectedFacility" 
                placeholder="All Facilities" 
                allow-clear 
                style="min-width: 160px;"
                class="w-full sm:w-44" 
                @change="handleFacilityChange"
            >
                <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                    {{ facility.name }}
                </a-select-option>
            </a-select>

            <!-- Meeting Room Filter -->
            <a-select 
                v-model:value="selectedRoom" 
                placeholder="All Meeting Rooms" 
                allow-clear 
                style="min-width: 170px;"
                class="w-full sm:w-48" 
                @change="handleFilterChange"
            >
                <a-select-option v-for="room in filteredRooms" :key="room.id" :value="room.id">
                    {{ room.name }}
                </a-select-option>
            </a-select>

            <!-- Booking Status Filter -->
            <a-select 
                v-model:value="selectedStatus" 
                placeholder="All Status" 
                allow-clear 
                style="min-width: 130px;"
                class="w-full sm:w-36" 
                @change="handleFilterChange"
            >
                <a-select-option value="PENDING">Pending</a-select-option>
                <a-select-option value="CONFIRMED">Confirmed</a-select-option>
                <a-select-option value="COMPLETED">Completed</a-select-option>
                <a-select-option value="CANCELLED">Cancelled</a-select-option>
            </a-select>

            <!-- Date Range -->
            <a-range-picker 
                v-model:value="dateRange" 
                style="min-width: 240px;"
                class="w-full sm:w-auto" 
                @change="handleFilterChange" 
            />

            <!-- Clear/Reset Filters -->
            <a-button 
                v-if="hasActiveFilters" 
                type="link" 
                class="px-2 text-xs text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200"
                @click="resetFilters"
            >
                Reset
            </a-button>
        </div>

        <!-- Bookings Data View -->
        <ResponsiveDataView 
            :columns="columns" 
            :data="bookings" 
            :loading="loading" 
            row-key="id" 
            :pagination="paginationConfig"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                    <a 
                        class="font-medium text-primary-600 hover:text-primary-700 hover:underline cursor-pointer"
                        @click="openBookingDetails(record)"
                    >
                        {{ record.bookingId || record.id }}
                    </a>
                </template>

                <template v-if="column.key === 'room'">
                    <span class="font-medium text-gray-900 dark:text-gray-100">
                        {{ record.meetingRoomName || record.roomName || 'Meeting Room' }}
                    </span>
                </template>

                <template v-if="column.key === 'time'">
                    <div class="text-sm">
                        {{ record.startTime?.substring(0, 5) }} - {{ record.endTime?.substring(0, 5) }}
                    </div>
                </template>

                <template v-if="column.key === 'user'">
                    <div>
                        <div class="font-medium text-gray-900 dark:text-white">{{ record.userName || 'Unknown' }}</div>
                        <div class="text-xs text-gray-500">{{ record.companyName || '' }}</div>
                    </div>
                </template>

                <template v-if="column.key === 'cost'">
                    <div class="text-right">
                        <div>₹{{ record.amountCharged || '0.00' }}</div>
                        <div class="text-xs text-gray-400">{{ record.creditsUsed || 0 }} Credits</div>
                    </div>
                </template>

                <template v-if="column.key === 'status'">
                    <BookingStatusBadge :status="record.bookingStatus" />
                </template>
            </template>

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record }">
                <a-card size="small" class="mb-3">
                    <div class="flex justify-between items-start mb-2">
                        <a 
                            class="font-semibold text-primary-600 hover:underline cursor-pointer"
                            @click="openBookingDetails(record)"
                        >
                            {{ record.bookingId || record.id }}
                        </a>
                        <BookingStatusBadge :status="record.bookingStatus" />
                    </div>
                    <div class="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <span class="font-medium">Room:</span> {{ record.meetingRoomName || record.roomName }}
                        </div>
                        <div>
                            <span class="font-medium">Date:</span> {{ record.bookingDate }} ({{ record.startTime?.substring(0, 5) }} - {{ record.endTime?.substring(0, 5) }})
                        </div>
                        <div>
                            <span class="font-medium">Booked By:</span> {{ record.userName }}
                        </div>
                        <div class="flex justify-between items-center pt-1 border-t border-gray-100 dark:border-gray-800">
                            <span class="text-xs text-gray-400">{{ record.creditsUsed || 0 }} Credits</span>
                            <span class="font-semibold text-gray-900 dark:text-gray-100">₹{{ record.amountCharged || '0.00' }}</span>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- Booking Details Modal -->
        <a-modal 
            v-model:open="showDetailModal" 
            title="Booking Details" 
            :footer="null" 
            width="600px"
        >
            <div v-if="selectedBooking" class="space-y-4 pt-2">
                <div class="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <div class="text-xs text-gray-400">Booking ID</div>
                        <div class="font-bold text-lg text-gray-900 dark:text-gray-100">
                            {{ selectedBooking.bookingId || selectedBooking.id }}
                        </div>
                    </div>
                    <BookingStatusBadge :status="selectedBooking.bookingStatus" />
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <div class="text-xs text-gray-400">Meeting Room</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.meetingRoomName || selectedBooking.roomName || 'N/A' }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Booking Date</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.bookingDate || 'N/A' }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Time</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.startTime?.substring(0, 5) }} - {{ selectedBooking.endTime?.substring(0, 5) }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Duration</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.bookingHours || '1' }} hr(s)
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Booked By</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.userName || 'N/A' }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Payment Mode</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.paymentMode || 'Credits' }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Amount Charged</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            ₹{{ selectedBooking.amountCharged || '0.00' }}
                        </div>
                    </div>
                    <div>
                        <div class="text-xs text-gray-400">Credits Used</div>
                        <div class="font-medium text-gray-800 dark:text-gray-200">
                            {{ selectedBooking.creditsUsed || 0 }} Credits
                        </div>
                    </div>
                </div>

                <!-- Attendees if available -->
                <div v-if="selectedBooking.attendees && selectedBooking.attendees.length > 0" class="pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div class="text-xs text-gray-400 mb-2">Attendees ({{ selectedBooking.attendees.length }})</div>
                    <div class="flex flex-wrap gap-2">
                        <a-tag v-for="(att, idx) in selectedBooking.attendees" :key="idx">
                            {{ att.user_name || att.name || att.email || 'Attendee' }}
                        </a-tag>
                    </div>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { ExportOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'
import BookingStatusBadge from '../../../../components/meeting-rooms/BookingStatusBadge.vue'
import { useMeetingRoomService, type Booking, type BookingListParams, type MeetingRoom } from '../../../../composables/meetingRoomService'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()
const spocStore = useSpocStore()
const roomStore = useMeetingRoomStore()
const meetingRoomService = useMeetingRoomService()

const { facilities } = storeToRefs(spocStore)
const { rooms } = storeToRefs(roomStore)

// State
const bookings = ref<Booking[]>([])
const bookingsCount = ref(0)
const bookingsPage = ref(1)
const bookingsPageSize = ref(10)
const loading = ref(false)
const exporting = ref(false)

const selectedFacility = ref<string | undefined>(undefined)
const selectedRoom = ref<string | undefined>(undefined)
const selectedStatus = ref<string | undefined>(undefined)
const dateRange = ref<[Dayjs, Dayjs]>()
const searchText = ref('')

const showDetailModal = ref(false)
const selectedBooking = ref<Booking | null>(null)

// Columns definition
const columns = [
    { title: 'Booking ID', dataIndex: 'bookingId', key: 'id', width: 130 },
    { title: 'Room', key: 'room', width: 170 },
    { title: 'Date', dataIndex: 'bookingDate', key: 'date', width: 110 },
    { title: 'Time', key: 'time', width: 140 },
    { title: 'Booked By', key: 'user', ellipsis: true },
    { title: 'Amount / Credits', key: 'cost', align: 'right' as const, width: 150 },
    { title: 'Status', dataIndex: 'bookingStatus', key: 'status', width: 120 }
]

// Filter active status
const hasActiveFilters = computed(() => {
    return Boolean(
        selectedFacility.value ||
        selectedRoom.value ||
        selectedStatus.value ||
        (dateRange.value && dateRange.value.length > 0) ||
        searchText.value
    )
})

const resetFilters = () => {
    selectedFacility.value = undefined
    selectedRoom.value = undefined
    selectedStatus.value = undefined
    dateRange.value = undefined
    searchText.value = ''
    bookingsPage.value = 1
    fetchBookings()
}

// Rooms filtered by facility if facility is selected
const filteredRooms = computed(() => {
    if (!selectedFacility.value) return rooms.value
    return rooms.value.filter(r => r.facility === selectedFacility.value)
})

// Pagination configuration
const paginationConfig = computed(() => ({
    total: bookingsCount.value,
    current: bookingsPage.value,
    pageSize: bookingsPageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: handlePageChange,
    showTotal: (total: number) => `Total ${total} bookings`
}))

const handleFacilityChange = () => {
    selectedRoom.value = undefined
    handleFilterChange()
}

const handleFilterChange = () => {
    bookingsPage.value = 1
    fetchBookings()
}

const handlePageChange = (page: number, newPageSize?: number) => {
    bookingsPage.value = page
    if (newPageSize) {
        bookingsPageSize.value = newPageSize
    }
    fetchBookings()
}

const fetchBookingsByFilter = () => {
    fetchBookings()
}

const buildFilterParams = (): BookingListParams => {
    // Determine the SPOC user's company ID
    const spocCompanyId = authStore.companyId 
        || (facilities.value.length > 0 ? facilities.value[0].companyId : undefined)

    const params: BookingListParams = {
        page: bookingsPage.value,
        page_size: bookingsPageSize.value,
        company: spocCompanyId || undefined
    }

    if (selectedFacility.value) {
        params.meeting_room__facility = selectedFacility.value
    }
    if (selectedRoom.value) {
        params.meeting_room = selectedRoom.value
    }
    if (selectedStatus.value) {
        params.booking_status = selectedStatus.value
    }
    if (searchText.value) {
        params.search = searchText.value
    }
    if (dateRange.value && dateRange.value[0] && dateRange.value[1]) {
        params.start_date = dateRange.value[0].format('YYYY-MM-DD')
        params.end_date = dateRange.value[1].format('YYYY-MM-DD')
    }

    return params
}

const fetchBookings = async () => {
    loading.value = true
    try {
        const params = buildFilterParams()
        const response = await meetingRoomService.getBookings(params)
        bookings.value = response.results || []
        bookingsCount.value = response.count || 0
    } catch (err) {
        console.error('Failed to fetch SPOC bookings:', err)
        bookings.value = []
        bookingsCount.value = 0
    } finally {
        loading.value = false
    }
}

const openBookingDetails = (booking: Booking) => {
    selectedBooking.value = booking
    showDetailModal.value = true
}

const handleExport = async () => {
    exporting.value = true
    try {
        const XLSX = await import('xlsx')
        const params = buildFilterParams()
        params.page = 1
        params.page_size = bookingsCount.value || 1000

        const response = await meetingRoomService.getBookings(params)
        const exportList = response.results && response.results.length > 0 ? response.results : bookings.value

        if (!exportList || exportList.length === 0) {
            message.warning('No bookings to export')
            return
        }

        const data = exportList.map(b => ({
            'Booking ID': b.bookingId || b.id,
            'Room': b.meetingRoomName || b.roomName || '',
            'Date': b.bookingDate || '',
            'Time': `${b.startTime?.substring(0, 5) || ''} - ${b.endTime?.substring(0, 5) || ''}`,
            'User': b.userName || '',
            'Company': b.companyName || '',
            'Status': b.bookingStatus || '',
            'Amount (₹)': b.amountCharged || '0.00',
            'Credits Used': b.creditsUsed ?? 0,
            'Payment Mode': b.paymentMode || '',
            'Type': b.bookingType || '',
            'Duration (Hours)': b.bookingHours || '',
            'Attendees': b.attendees?.map((a: any) => a.user_name || a.name || a.email).filter(Boolean).join(', ') || ''
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Bookings')
        const now = dayjs().format('YYYY-MM-DD')
        XLSX.writeFile(workbook, `spoc-room-bookings-${now}.xlsx`)
        message.success('Bookings exported successfully')
    } catch (error) {
        console.error('Error exporting bookings to Excel:', error)
        message.error('Failed to export bookings')
    } finally {
        exporting.value = false
    }
}

onMounted(async () => {
    try {
        await Promise.all([
            spocStore.fetchFacilities(),
            roomStore.fetchRooms({ page_size: 100 })
        ])
    } catch (err) {
        console.error('Failed to load facilities or rooms:', err)
    }
    await fetchBookings()
})
</script>
