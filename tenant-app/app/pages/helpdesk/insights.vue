<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Helpdesk Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of ticket performance and facility issues.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
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
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Tickets</div>
                    <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ insights.summary.total_tickets }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Open</div>
                    <div class="text-3xl font-bold text-red-600 dark:text-red-400">{{ insights.summary.open }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">In Progress</div>
                    <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">{{ insights.summary.in_progress }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Resolved</div>
                    <div class="text-3xl font-bold text-green-600 dark:text-green-500">{{ insights.summary.resolved }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Disputed</div>
                    <div class="text-3xl font-bold text-orange-600 dark:text-orange-400">{{ insights.summary.disputed }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Reopened</div>
                    <div class="text-3xl font-bold text-purple-600 dark:text-purple-400">{{ insights.summary.reopened }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">SLA Breached</div>
                    <div class="text-3xl font-bold text-rose-600 dark:text-rose-400">{{ insights.summary.sla_breached }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Near SLA</div>
                    <div class="text-3xl font-bold text-amber-600 dark:text-amber-400">{{ insights.summary.near_sla_breach }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Escalated</div>
                    <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{{ insights.summary.escalated }}</div>
                </a-card>

                <a-card>
                    <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Avg Resolution</div>
                    <div class="text-3xl font-bold text-cyan-600 dark:text-cyan-400">
                        {{ insights.summary.avg_resolution_time_minutes }}<span class="text-sm font-normal text-gray-500 ml-1">min</span>
                    </div>
                </a-card>
            </div>

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <a-card class="lg:col-span-2">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Tickets Over Time</h3>
                    </template>
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="ticketsOverTimeContainer" class="w-full h-full"></div>
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
                <a-card v-if="insights.top_facilities.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Facilities</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_facilities"
                        :columns="topFacilitiesColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>

                <a-card v-if="insights.top_categories.length > 0">
                    <template #title>
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Top Categories</h3>
                    </template>
                    <a-table
                        :dataSource="insights.top_categories"
                        :columns="topCategoriesColumns"
                        :pagination="false"
                        size="small"
                        class="mt-4"
                    />
                </a-card>
            </div>

            <!-- SLA Performance -->
            <a-card v-if="insights.facility_sla_performance.length > 0">
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Facility SLA Performance</h3>
                </template>
                <a-table
                    :dataSource="insights.facility_sla_performance"
                    :columns="slaPerformanceColumns"
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
import dayjs from 'dayjs'
import { useHelpdeskStore } from '../../../stores/helpdesk'
import { Line, Pie } from '@antv/g2plot'

definePageMeta({
    middleware: 'auth'
})

const store = useHelpdeskStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)
const error = computed(() => store.error)
const exporting = ref(false)

const ticketsOverTimeContainer = ref<HTMLDivElement | null>(null)
const statusDistributionContainer = ref<HTMLDivElement | null>(null)
let ticketsOverTimeInstance: Line | null = null
let statusDistributionInstance: Pie | null = null

const topFacilitiesColumns = [
    { title: 'Facility', dataIndex: 'facility_name', key: 'facility_name' },
    { title: 'Tickets', dataIndex: 'ticket_count', key: 'ticket_count' },
]

const topCategoriesColumns = [
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Tickets', dataIndex: 'ticket_count', key: 'ticket_count' },
]

const slaPerformanceColumns = [
    { title: 'Facility', dataIndex: 'facility_name', key: 'facility_name' },
    { title: 'Total Tickets', dataIndex: 'total_tickets', key: 'total_tickets' },
    { title: 'SLA Met', dataIndex: 'sla_met', key: 'sla_met' },
    { title: 'SLA Breached', dataIndex: 'sla_breached', key: 'sla_breached' },
    {
        title: 'Breach Rate',
        dataIndex: 'breach_rate_percentage',
        key: 'breach_rate_percentage',
        customRender: ({ text }: any) => `${text}%`
    },
]

const ticketsOverTimeData = computed(() => {
    if (!insights.value) return []
    return insights.value.tickets_over_time.map(item => ({
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
    'Open': '#ef4444',
    'In_progress': '#3b82f6',
    'In progress': '#3b82f6',
    'Resolved': '#22c55e',
    'Disputed': '#f59e0b',
    'Reopened': '#8b5cf6',
    'Closed': '#9ca3af',
}

const createTicketsOverTimeChart = async () => {
    await nextTick()
    if (!ticketsOverTimeContainer.value || !ticketsOverTimeData.value.length) return

    if (ticketsOverTimeInstance) {
        ticketsOverTimeInstance.destroy()
    }

    ticketsOverTimeInstance = new Line(ticketsOverTimeContainer.value, {
        data: ticketsOverTimeData.value,
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
                fill: 'l(270) 0:#ffffff 0.5:#3b82f6 1:#3b82f6',
                fillOpacity: 0.2,
            },
        },
        color: '#3b82f6',
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

    ticketsOverTimeInstance.render()
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
        const dateFrom = data.date_range.start_date
        const dateTo = data.date_range.end_date
        const filename = `helpdesk-insights-${dateFrom}_to_${dateTo}.csv`

        // Header
        rows.push('Helpdesk Insights Report')
        rows.push(`Date Range,${escapeCsv(dateFrom)} to ${escapeCsv(dateTo)}`)
        rows.push('Generated At,' + escapeCsv(dayjs().format('YYYY-MM-DD HH:mm:ss')))
        rows.push('')

        // Summary
        rows.push('Summary')
        rows.push('Metric,Value')
        rows.push(`Total Tickets,${escapeCsv(data.summary.total_tickets)}`)
        rows.push(`Open,${escapeCsv(data.summary.open)}`)
        rows.push(`In Progress,${escapeCsv(data.summary.in_progress)}`)
        rows.push(`Resolved,${escapeCsv(data.summary.resolved)}`)
        rows.push(`Disputed,${escapeCsv(data.summary.disputed)}`)
        rows.push(`Reopened,${escapeCsv(data.summary.reopened)}`)
        rows.push(`SLA Breached,${escapeCsv(data.summary.sla_breached)}`)
        rows.push(`Near SLA Breach,${escapeCsv(data.summary.near_sla_breach)}`)
        rows.push(`Escalated,${escapeCsv(data.summary.escalated)}`)
        rows.push(`Avg Resolution Time (min),${escapeCsv(data.summary.avg_resolution_time_minutes)}`)
        rows.push('')

        // Tickets Over Time
        rows.push('Tickets Over Time')
        rows.push('Month,Count')
        data.tickets_over_time.forEach(t => {
            rows.push(`${escapeCsv(t.month)},${escapeCsv(t.count)}`)
        })
        rows.push('')

        // Status Distribution
        rows.push('Status Distribution')
        rows.push('Status,Count,Percentage')
        data.status_distribution.forEach(s => {
            rows.push(`${escapeCsv(s.status)},${escapeCsv(s.count)},${escapeCsv(s.percentage)}%`)
        })
        rows.push('')

        // Top Facilities
        if (data.top_facilities.length > 0) {
            rows.push('Top Facilities by Tickets')
            rows.push('Facility,Tickets')
            data.top_facilities.forEach(f => {
                rows.push(`${escapeCsv(f.facility_name)},${escapeCsv(f.ticket_count)}`)
            })
            rows.push('')
        }

        // Top Categories
        if (data.top_categories.length > 0) {
            rows.push('Top Categories by Tickets')
            rows.push('Category,Tickets')
            data.top_categories.forEach(c => {
                rows.push(`${escapeCsv(c.category_name)},${escapeCsv(c.ticket_count)}`)
            })
            rows.push('')
        }

        // Facility SLA Performance
        if (data.facility_sla_performance.length > 0) {
            rows.push('Facility SLA Performance')
            rows.push('Facility,Total Tickets,SLA Met,SLA Breached,Breach Rate')
            data.facility_sla_performance.forEach(f => {
                rows.push(`${escapeCsv(f.facility_name)},${escapeCsv(f.total_tickets)},${escapeCsv(f.sla_met)},${escapeCsv(f.sla_breached)},${escapeCsv(f.breach_rate_percentage)}%`)
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
        await createTicketsOverTimeChart()
        await createStatusDistributionChart()
    }
}, { immediate: true })

onMounted(() => {
    store.fetchInsightsAction()
})

onBeforeUnmount(() => {
    if (ticketsOverTimeInstance) {
        ticketsOverTimeInstance.destroy()
        ticketsOverTimeInstance = null
    }
    if (statusDistributionInstance) {
        statusDistributionInstance.destroy()
        statusDistributionInstance = null
    }
})
</script>
