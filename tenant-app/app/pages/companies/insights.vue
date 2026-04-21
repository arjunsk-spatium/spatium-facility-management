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
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{{ insights.summary.total_revenue.toLocaleString() }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">New (30 Days)</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ insights.summary.new_last_30_days }}</div>
                </a-card>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <a-card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Company Status Distribution</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="statusChartContainer" class="w-full h-full"></div>
                    </div>
                </a-card>
                <a-card>
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue Trend</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="revenueChartContainer" class="w-full h-full"></div>
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

const revenueChartData = computed(() => {
    if (!insights.value) return []
    return insights.value.revenue_trend.map(item => ({
        month: item.month,
        revenue: item.revenue,
    }))
})

const statusColors: Record<string, string> = {
    'Active': '#10b981',
    'Inactive': '#ef4444',
    'Pending': '#f59e0b',
}

const createStatusChart = async () => {
    await nextTick()
    if (!statusChartContainer.value || !statusChartData.value.length) return

    if (statusChartInstance) {
        statusChartInstance.destroy()
    }

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
    if (!revenueChartContainer.value || !revenueChartData.value.length) return

    if (revenueChartInstance) {
        revenueChartInstance.destroy()
    }

    revenueChartInstance = new Line(revenueChartContainer.value, {
        data: revenueChartData.value,
        xField: 'month',
        yField: 'revenue',
        smooth: true,
        autoFit: true,
        padding: [10, 10, 30, 40],
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
                formatter: (v: string) => `₹${Number(v).toLocaleString()}`,
            },
            min: 0,
        },
        legend: {
            position: 'bottom',
            itemName: {
                formatter: () => 'Revenue (₹)',
            },
        },
        tooltip: {
            showCrosshairs: true,
            shared: true,
            formatter: (datum: any) => {
                return { name: datum.month, value: `₹${datum.revenue.toLocaleString()}` }
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
    if (!loading.value && insights.value) {
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
