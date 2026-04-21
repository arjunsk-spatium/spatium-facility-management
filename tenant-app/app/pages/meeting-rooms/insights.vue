<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Meeting Rooms Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of room utilization and booking trends.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker v-model:value="dateRange" @change="onDateChange" />
                <a-button type="primary" :loading="exporting" @click="exportReport">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    Export Report
                </a-button>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <template v-else-if="insights">
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Bookings</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ insights.summary.total_bookings }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</div>
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{{ insights.summary.total_revenue.toLocaleString() }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Utilization</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ insights.summary.utilization_percentage }}%</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg Daily Bookings</div>
                    <div class="text-3xl font-bold text-teal-600 dark:text-teal-400">{{ insights.summary.avg_daily_bookings }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Booked Hours</div>
                    <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ insights.summary.total_booked_hours }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Cancellation Rate</div>
                    <div class="text-3xl font-bold text-red-600 dark:text-red-400">{{ insights.summary.cancellation_rate_percentage }}%</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Rooms</div>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-500">{{ insights.summary.active_rooms }}</div>
                </a-card>

                <a-card v-if="insights.most_utilised_room && insights.most_utilised_room.room_name">
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Most Utilised Room</div>
                    <div class="text-xl font-bold text-orange-600 dark:text-orange-400 truncate">{{ insights.most_utilised_room.room_name }}</div>
                    <div class="text-xs text-gray-500">{{ insights.most_utilised_room.total_hours }} hrs</div>
                </a-card>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <a-card class="lg:col-span-2">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Bookings Trend</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="bookingsTrendContainer" class="w-full h-full"></div>
                    </div>
                </a-card>

                <a-card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Status Distribution</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="statusDistributionContainer" class="w-full h-full"></div>
                    </div>
                </a-card>
            </div>

            <!-- Tables -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <a-card v-if="insights.top_meeting_rooms.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Meeting Rooms</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_meeting_rooms"
                        :columns="topRoomsColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>

                <a-card v-if="insights.top_companies.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Companies</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_companies"
                        :columns="topCompaniesColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>
            </div>

            <!-- Peak Booking Hours -->
            <a-card v-if="insights.peak_booking_hours.length > 0">
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Peak Booking Hours</h3>
                </template>
                <a-table
                    :dataSource="insights.peak_booking_hours"
                    :columns="peakHoursColumns"
                    :pagination="false"
                    size="small"
                    class="mt-4"
                />
            </a-card>
        </template>

        <div v-else-if="error" class="text-center text-red-500 p-12">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useMeetingRoomStore } from '../../../stores/meetingRoom'
import { Line, Pie } from '@antv/g2plot'

definePageMeta({
    middleware: 'auth'
})

const store = useMeetingRoomStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const exporting = ref(false)

// Default to last 6 months
const dateRange = ref<[Dayjs, Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
])

const bookingsTrendContainer = ref<HTMLDivElement | null>(null)
const statusDistributionContainer = ref<HTMLDivElement | null>(null)
let bookingsTrendInstance: Line | null = null
let statusDistributionInstance: Pie | null = null

const topRoomsColumns = [
    { title: 'Room', dataIndex: 'room_name', key: 'room_name' },
    { title: 'Bookings', dataIndex: 'booking_count', key: 'booking_count' },
    { title: 'Revenue', dataIndex: 'revenue', key: 'revenue', customRender: ({ text }: any) => `₹${Number(text).toLocaleString()}` },
]

const topCompaniesColumns = [
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'Bookings', dataIndex: 'booking_count', key: 'booking_count' },
    { title: 'Hours', dataIndex: 'total_hours', key: 'total_hours' },
]

const peakHoursColumns = [
    { title: 'Hour', dataIndex: 'hour', key: 'hour' },
    { title: 'Bookings', dataIndex: 'booking_count', key: 'booking_count' },
]

const fetchInsights = () => {
    if (!dateRange.value || dateRange.value.length !== 2) return
    const startDate = dateRange.value[0].format('YYYY-MM-DD')
    const endDate = dateRange.value[1].format('YYYY-MM-DD')
    store.fetchInsightsAction(startDate, endDate)
}

const onDateChange = () => {
    fetchInsights()
}

const bookingsTrendData = computed(() => {
    if (!insights.value) return []
    return insights.value.bookings_trend.map(item => ({
        month: item.month,
        count: item.count,
    }))
})

const statusDistributionData = computed(() => {
    if (!insights.value) return []
    return insights.value.status_distribution.map(item => ({
        type: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        value: item.count,
    }))
})

const statusColors: Record<string, string> = {
    'Confirmed': '#22c55e',
    'Completed': '#3b82f6',
    'Cancelled': '#ef4444',
    'Pending': '#f59e0b',
}

const createBookingsTrendChart = async () => {
    await nextTick()
    if (!bookingsTrendContainer.value || !bookingsTrendData.value.length) return

    if (bookingsTrendInstance) {
        bookingsTrendInstance.destroy()
    }

    bookingsTrendInstance = new Line(bookingsTrendContainer.value, {
        data: bookingsTrendData.value,
        xField: 'month',
        yField: 'count',
        smooth: true,
        autoFit: true,
        padding: [10, 10, 30, 40],
        point: {
            size: 5,
            shape: 'circle',
        },
        area: {
            style: {
                fill: 'l(270) 0:#ffffff 0.5:#8b5cf6 1:#8b5cf6',
                fillOpacity: 0.2,
            },
        },
        color: '#8b5cf6',
        xAxis: {
            label: {
                style: { fill: '#666' },
            },
        },
        yAxis: {
            label: {
                style: { fill: '#666' },
            },
            min: 0,
        },
        tooltip: {
            showCrosshairs: true,
            shared: true,
            formatter: (datum: any) => {
                return { name: datum.month, value: datum.count }
            },
        },
        animation: {
            appear: {
                animation: 'wave-in',
                duration: 2000,
            },
        },
    })

    bookingsTrendInstance.render()
}

const createStatusDistributionChart = async () => {
    await nextTick()
    if (!statusDistributionContainer.value || !statusDistributionData.value.length) return

    if (statusDistributionInstance) {
        statusDistributionInstance.destroy()
    }

    const total = statusDistributionData.value.reduce((sum, item) => sum + item.value, 0)

    statusDistributionInstance = new Pie(statusDistributionContainer.value, {
        data: statusDistributionData.value,
        angleField: 'value',
        colorField: 'type',
        radius: 0.65,
        innerRadius: 0.6,
        autoFit: true,
        padding: [5, 10, 10, 20],
        color: (data: any) => statusColors[data.type] || '#666',
        label: {
            type: 'spider',
            labelHeight: 40,
            content: (datum: any) => {
                const percent = total > 0 ? ((datum.value / total) * 100).toFixed(0) : '0'
                return `${datum.type}\n${datum.value} (${percent}%)`
            },
            style: {
                fontSize: 13,
                fill: '#333',
                fontWeight: 500,
            },
        },
        legend: false,
        statistic: {
            title: false,
            content: false,
        },
        tooltip: {
            formatter: (datum: any) => {
                const percent = total > 0 ? ((datum.value / total) * 100).toFixed(0) : '0'
                return { name: datum.type, value: `${datum.value} (${percent}%)` }
            },
        },
        animation: {
            appear: {
                animation: 'scale-in',
                duration: 2000,
            },
        },
    })

    statusDistributionInstance.render()
}

const escapeCsv = (value: string | number | undefined): string => {
    if (value == null) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

const exportReport = () => {
    if (!insights.value || exporting.value) return

    exporting.value = true

    try {
        const rows: string[] = []
        const data = insights.value
        const dateFrom = dateRange.value?.[0]?.format('YYYY-MM-DD') || data.date_range.start_date
        const dateTo = dateRange.value?.[1]?.format('YYYY-MM-DD') || data.date_range.end_date
        const filename = `meeting-room-insights-${dateFrom}_to_${dateTo}.csv`

        // Header
        rows.push('Meeting Room Insights Report')
        rows.push(`Date Range,${escapeCsv(dateFrom)} to ${escapeCsv(dateTo)}`)
        rows.push('Generated At,' + escapeCsv(dayjs().format('YYYY-MM-DD HH:mm:ss')))
        rows.push('')

        // Summary
        rows.push('Summary')
        rows.push('Metric,Value')
        rows.push(`Total Bookings,${escapeCsv(data.summary.total_bookings)}`)
        rows.push(`Total Revenue,${escapeCsv(data.summary.total_revenue)}`)
        rows.push(`Utilization %,${escapeCsv(data.summary.utilization_percentage)}`)
        rows.push(`Avg Daily Bookings,${escapeCsv(data.summary.avg_daily_bookings)}`)
        rows.push(`Total Booked Hours,${escapeCsv(data.summary.total_booked_hours)}`)
        rows.push(`Cancellation Rate %,${escapeCsv(data.summary.cancellation_rate_percentage)}`)
        rows.push(`Active Rooms,${escapeCsv(data.summary.active_rooms)}`)
        rows.push('')

        // Bookings Trend
        rows.push('Bookings Trend')
        rows.push('Month,Count,Revenue,Revenue Growth %')
        data.bookings_trend.forEach(t => {
            rows.push(`${escapeCsv(t.month)},${escapeCsv(t.count)},${escapeCsv(t.revenue)},${escapeCsv(t.revenue_growth_percentage ?? 0)}%`)
        })
        rows.push('')

        // Status Distribution
        rows.push('Status Distribution')
        rows.push('Status,Count,Percentage')
        data.status_distribution.forEach(s => {
            rows.push(`${escapeCsv(s.status)},${escapeCsv(s.count)},${escapeCsv(s.percentage)}%`)
        })
        rows.push('')

        // Top Meeting Rooms
        if (data.top_meeting_rooms.length > 0) {
            rows.push('Top Meeting Rooms')
            rows.push('Room,Bookings,Revenue')
            data.top_meeting_rooms.forEach(r => {
                rows.push(`${escapeCsv(r.room_name)},${escapeCsv(r.booking_count)},${escapeCsv(r.revenue)}`)
            })
            rows.push('')
        }

        // Top Companies
        if (data.top_companies.length > 0) {
            rows.push('Top Companies')
            rows.push('Company,Bookings,Total Hours')
            data.top_companies.forEach(c => {
                rows.push(`${escapeCsv(c.company_name)},${escapeCsv(c.booking_count)},${escapeCsv(c.total_hours)}`)
            })
            rows.push('')
        }

        // Peak Booking Hours
        if (data.peak_booking_hours.length > 0) {
            rows.push('Peak Booking Hours')
            rows.push('Hour,Booking Count')
            data.peak_booking_hours.forEach(h => {
                rows.push(`${escapeCsv(h.hour)},${escapeCsv(h.booking_count)}`)
            })
            rows.push('')
        }

        const csvContent = rows.join('\n')
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', filename)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
    } finally {
        exporting.value = false
    }
}

watch([insights, loading], async () => {
    if (!loading.value && insights.value) {
        await createBookingsTrendChart()
        await createStatusDistributionChart()
    }
}, { immediate: true })

onMounted(() => {
    fetchInsights()
})

onBeforeUnmount(() => {
    if (bookingsTrendInstance) {
        bookingsTrendInstance.destroy()
        bookingsTrendInstance = null
    }
    if (statusDistributionInstance) {
        statusDistributionInstance.destroy()
        statusDistributionInstance = null
    }
})
</script>
