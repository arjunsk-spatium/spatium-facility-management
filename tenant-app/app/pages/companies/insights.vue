<template>
    <div class="space-y-6">
        <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Company Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of company performance and statistics</p>
            </div>
            <a-range-picker v-model:value="dateRange" @change="onDateChange" />
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <template v-else-if="insights">
            <!-- Summary Stats -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Companies</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ insights.summary.total_companies }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Companies</div>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-500">{{ insights.summary.active_companies }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Inactive Companies</div>
                    <div class="text-3xl font-bold text-gray-600 dark:text-gray-400">{{ insights.summary.inactive_companies }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</div>
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400" data-testid="total-revenue">
                        {{ formatNumber(totalRevenue) }}
                    </div>
                    <div v-if="revenueSources.length" class="text-xs text-gray-400 mt-1" data-testid="total-revenue-sources">
                        {{ revenueSources.map(source => source.label).join(' + ') }}
                    </div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">New (30 Days)</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ insights.summary.new_last_30_days }}</div>
                </a-card>
            </div>

            <!-- Booking Insights -->
            <div v-if="bookingInsights" data-testid="booking-insights">
                <h2 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-3">Booking Insights</h2>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <a-card>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Bookings</div>
                        <div class="text-3xl font-bold text-gray-900 dark:text-white" data-testid="booking-total-bookings">
                            {{ formatNumber(bookingInsights.total_bookings) }}
                        </div>
                    </a-card>

                    <a-card>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Money on Bookings</div>
                        <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400" data-testid="booking-money">
                            ₹{{ formatNumber(bookingInsights.money_on_bookings) }}
                        </div>
                    </a-card>

                    <a-card>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Credits Spent on Bookings</div>
                        <div class="text-3xl font-bold text-amber-600 dark:text-amber-400" data-testid="booking-credits">
                            {{ formatNumber(bookingInsights.credit_spent_on_bookings) }}
                            <span class="text-base font-medium text-gray-500 dark:text-gray-400">credits</span>
                        </div>
                    </a-card>

                    <a-card>
                        <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total</div>
                        <div class="text-3xl font-bold text-green-600 dark:text-green-500" data-testid="booking-total">
                            {{ formatNumber(bookingInsights.total) }}
                        </div>
                        <div class="text-xs text-gray-400 mt-1">Money + credits</div>
                    </a-card>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <a-card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Company Status Distribution</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div v-show="statusChartData.length > 0" ref="statusChartContainer" class="w-full h-full"></div>
                        <div v-if="statusChartData.length === 0" class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span>No company status data for this period</span>
                        </div>
                    </div>
                </a-card>
                <a-card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue Trend</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div v-show="revenueChartData.length > 0" ref="revenueChartContainer" class="w-full h-full"></div>
                        <div v-if="revenueChartData.length === 0" class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                            <span>No revenue data for this period</span>
                        </div>
                    </div>
                </a-card>
            </div>

            <!-- Top Companies by Tickets -->
            <a-card v-if="insights.top_companies_by_tickets && insights.top_companies_by_tickets.length > 0">
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Companies by Tickets</h3>
                </template>
                <a-table
                    :dataSource="insights.top_companies_by_tickets"
                    :columns="topCompaniesColumns"
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
import { onMounted, computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useCompanyStore } from '../../../stores/company'
import { Column, Line } from '@antv/g2plot'

definePageMeta({
    middleware: 'auth'
})

const store = useCompanyStore()
const insights = computed(() => store.insights)
const bookingInsights = computed(() => insights.value?.booking_insights || null)
const formatNumber = (value?: number | null) => Number(value || 0).toLocaleString('en-IN')

// Total Revenue = sum of all revenue sources. Today the only source is bookings
// (booking_insights.total, money + credits); add future sources to this list.
const revenueSources = computed(() => {
    const sources: Array<{ label: string; amount: number }> = []
    if (bookingInsights.value) {
        sources.push({ label: 'Bookings', amount: Number(bookingInsights.value.total) || 0 })
    }
    return sources
})

// Falls back to summary.total_revenue when the API sends no revenue sources
const totalRevenue = computed(() => revenueSources.value.length
    ? revenueSources.value.reduce((sum, source) => sum + source.amount, 0)
    : Number(insights.value?.summary.total_revenue) || 0)
const loading = computed(() => store.loading)
const error = computed(() => store.error)

// Default to last 6 months
const dateRange = ref<[Dayjs, Dayjs]>([
    dayjs().subtract(6, 'month'),
    dayjs()
])

const fetchInsights = () => {
    let startDate: string | undefined
    let endDate: string | undefined
    if (dateRange.value && dateRange.value.length === 2 && dateRange.value[0] && dateRange.value[1]) {
        startDate = dateRange.value[0].format('YYYY-MM-DD')
        endDate = dateRange.value[1].format('YYYY-MM-DD')
    }
    store.fetchInsightsAction(startDate, endDate)
}

const onDateChange = () => {
    fetchInsights()
}

const statusChartContainer = ref<HTMLDivElement | null>(null)
const revenueChartContainer = ref<HTMLDivElement | null>(null)
let statusChartInstance: Column | null = null
let revenueChartInstance: Line | null = null

const topCompaniesColumns = [
    {
        title: 'Company',
        dataIndex: 'company_name',
        key: 'company_name',
    },
    {
        title: 'Tickets',
        dataIndex: 'ticket_count',
        key: 'ticket_count',
    },
]

const statusChartData = computed(() => {
    if (!insights.value) return []
    return insights.value.status_distribution.map(item => ({
        status: item.status.charAt(0).toUpperCase() + item.status.slice(1),
        count: item.count,
    }))
})

// Revenue Trend plots booking revenue (money + credits) per month from booking_revenue_trend,
// matching the Total Revenue card. Older responses without it fall back to the wallet revenue_trend.
const usesBookingRevenue = computed(() => Array.isArray(insights.value?.booking_revenue_trend))

const revenueChartData = computed(() => {
    if (!insights.value) return []
    if (usesBookingRevenue.value) {
        return insights.value.booking_revenue_trend!.map(item => ({
            month: item.month,
            revenue: Number(item.total) || 0,
            money: Number(item.money_on_bookings) || 0,
            credits: Number(item.credit_spent_on_bookings) || 0,
        }))
    }
    return (insights.value.revenue_trend || []).map(item => ({
        month: item.month,
        revenue: item.revenue,
    }))
})

// Booking totals mix rupees and credits, so they are shown without ₹
const formatRevenueValue = (value: number) => usesBookingRevenue.value
    ? formatNumber(value)
    : `₹${Number(value || 0).toLocaleString('en-IN')}`

const revenueTooltipItems = (datum: any) => {
    if (!usesBookingRevenue.value) {
        return [{ name: 'Revenue', value: formatRevenueValue(datum.revenue) }]
    }
    return [
        { name: 'Money on bookings', value: `₹${formatNumber(datum.money)}` },
        { name: 'Credits spent', value: `${formatNumber(datum.credits)} credits` },
        { name: 'Total', value: formatNumber(datum.revenue) },
    ]
}

const statusColors: Record<string, string> = {
    'Active': '#10b981',
    'Inactive': '#ef4444',
    'Pending': '#f59e0b',
}

const createStatusChart = async () => {
    await nextTick()
    if (statusChartInstance) {
        statusChartInstance.destroy()
        statusChartInstance = null
    }
    if (!statusChartContainer.value || !statusChartData.value.length) return

    statusChartInstance = new Column(statusChartContainer.value, {
        data: statusChartData.value,
        xField: 'status',
        yField: 'count',
        autoFit: true,
        padding: [10, 10, 30, 40],
        columnStyle: {
            radius: [4, 4, 0, 0],
        },
        color: ({ status }: any) => {
            return statusColors[status] || '#666'
        },
        xAxis: {
            label: {
                style: {
                    fill: '#666',
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fill: '#666',
                },
            },
            min: 0,
        },
        legend: {
            position: 'bottom',
            itemName: {
                formatter: () => 'Companies',
            },
        },
        tooltip: {
            formatter: (datum: any) => {
                return { name: datum.status, value: datum.count }
            },
        },
        animation: {
            appear: {
                animation: 'scale-in-y',
                duration: 2000,
            },
        },
    })

    statusChartInstance.render()
}

const createRevenueChart = async () => {
    await nextTick()
    if (revenueChartInstance) {
        revenueChartInstance.destroy()
        revenueChartInstance = null
    }
    if (!revenueChartContainer.value || !revenueChartData.value.length) return

    revenueChartInstance = new Line(revenueChartContainer.value, {
        data: revenueChartData.value,
        xField: 'month',
        yField: 'revenue',
        smooth: true,
        autoFit: true,
        // Wide left padding so ₹ labels like "₹16,000" aren't clipped
        padding: [10, 10, 30, 72],
        point: {
            size: 5,
            shape: 'circle',
        },
        area: {
            style: {
                fill: 'l(270) 0:#ffffff 0.5:#3378ff 1:#3378ff',
                fillOpacity: 0.2,
            },
        },
        color: '#3378ff',
        xAxis: {
            label: {
                style: {
                    fill: '#666',
                },
            },
        },
        yAxis: {
            label: {
                style: {
                    fill: '#666',
                },
                formatter: (v: string) => formatRevenueValue(Number(v)),
            },
            min: 0,
        },
        legend: {
            position: 'bottom',
            itemName: {
                formatter: () => (usesBookingRevenue.value ? 'Booking revenue' : 'Revenue (₹)'),
            },
        },
        tooltip: {
            showCrosshairs: true,
            shared: true,
            // One row per breakdown value (money, credits, total) for the hovered month
            customItems: (items: any[]) => {
                const first = items[0]
                if (!first) return items
                return revenueTooltipItems(first.data).map(row => ({ ...first, ...row }))
            },
        },
        animation: {
            appear: {
                animation: 'wave-in',
                duration: 2000,
            },
        },
    })

    revenueChartInstance.render()
}

watch([insights, loading], async () => {
    if (!loading.value) {
        await createStatusChart()
        await createRevenueChart()
    }
}, { immediate: true })

onMounted(() => {
    fetchInsights()
})

onBeforeUnmount(() => {
    if (statusChartInstance) {
        statusChartInstance.destroy()
        statusChartInstance = null
    }
    if (revenueChartInstance) {
        revenueChartInstance.destroy()
        revenueChartInstance = null
    }
})
</script>
