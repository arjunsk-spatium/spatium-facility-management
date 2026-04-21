<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Analytics and reporting for facility visitors.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker v-model:value="dateRange" @change="onDateChange" />
                <a-button type="primary" @click="exportReport">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    Export <span class="hidden sm:inline">Report</span>
                </a-button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <template v-else-if="insights">
            <!-- Key Stats -->
            <VisitorStatsWidget :stats="mappedStats" />

            <!-- Charts -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    <VisitorChartWidget :data="mappedTraffic" />
                </div>
                <div class="lg:col-span-1">
                    <VisitorPurposeWidget :data="mappedPurposes" />
                </div>
            </div>

            <!-- Hourly Traffic (today only, if data exists) -->
            <div v-if="mappedHourlyTraffic && mappedHourlyTraffic.length > 0" class="grid grid-cols-1 gap-6">
                <a-card title="Today's Hourly Traffic">
                    <div class="h-64 mt-4 overflow-hidden">
                        <div ref="hourlyChartContainer" class="w-full h-full"></div>
                    </div>
                </a-card>
            </div>

            <!-- Top Visiting Companies -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TopVisitingCompaniesWidget :data="insights.top_visiting_companies" />
            </div>
        </template>

        <div v-else-if="error" class="text-center text-red-500 p-12">
            {{ error }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, onBeforeUnmount, nextTick } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { Column } from '@antv/g2plot'
import { useDashboardService } from '../../../composables/dashboardService'
import type { VisitorInsightsData } from '../../../composables/dashboardService'

import VisitorStatsWidget from '../../../components/visitors/widgets/VisitorStatsWidget.vue'
import VisitorChartWidget from '../../../components/visitors/widgets/VisitorChartWidget.vue'
import VisitorPurposeWidget from '../../../components/visitors/widgets/VisitorPurposeWidget.vue'
import TopVisitingCompaniesWidget from '../../../components/visitors/widgets/TopVisitingCompaniesWidget.vue'

definePageMeta({
    middleware: 'auth'
})

const { getVisitorInsights } = useDashboardService()

const insights = ref<VisitorInsightsData | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Default to last 7 days
const dateRange = ref<[Dayjs, Dayjs]>([
    dayjs().subtract(6, 'day'),
    dayjs()
])

// Hourly chart
const hourlyChartContainer = ref<HTMLDivElement | null>(null)
let hourlyChartInstance: Column | null = null

const mappedStats = computed(() => {
    if (!insights.value) return null
    return {
        total: insights.value.summary.total_visitors,
        checkedIn: insights.value.summary.checked_in,
        checkedOut: insights.value.summary.checked_out,
        pending: insights.value.summary.pending,
        expected: insights.value.summary.expected,
    }
})

const mappedTraffic = computed(() => {
    if (!insights.value?.traffic) return []
    return insights.value.traffic.map(d => ({
        day: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
        count: d.count,
    }))
})

const purposeColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']

const mappedPurposes = computed(() => {
    if (!insights.value?.visit_purposes) return []
    return insights.value.visit_purposes.map((p, index) => ({
        purpose: p.purpose,
        count: p.count,
        color: purposeColors[index % purposeColors.length],
    }))
})

const mappedHourlyTraffic = computed(() => {
    if (!insights.value?.today_hourly_traffic) return []
    return insights.value.today_hourly_traffic.map(h => ({
        hour: h.hour,
        count: h.count,
    }))
})

const createHourlyChart = async () => {
    await nextTick()
    if (!hourlyChartContainer.value || !mappedHourlyTraffic.value.length) return

    if (hourlyChartInstance) {
        hourlyChartInstance.destroy()
    }

    hourlyChartInstance = new Column(hourlyChartContainer.value, {
        data: mappedHourlyTraffic.value,
        xField: 'hour',
        yField: 'count',
        autoFit: true,
        padding: [10, 10, 20, 30],
        columnStyle: {
            radius: [4, 4, 0, 0],
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
        tooltip: { shared: true },
        animation: {
            appear: {
                animation: 'scale-in-y',
                duration: 2000,
            },
        },
    })

    hourlyChartInstance.render()
}

const fetchInsights = async () => {
    if (!dateRange.value || dateRange.value.length !== 2) return

    loading.value = true
    error.value = null
    try {
        const startDate = dateRange.value[0].format('YYYY-MM-DD')
        const endDate = dateRange.value[1].format('YYYY-MM-DD')
        insights.value = await getVisitorInsights(startDate, endDate)
    } catch (err: any) {
        error.value = err.message || 'Failed to fetch visitor insights'
    } finally {
        loading.value = false
    }
}

const onDateChange = () => {
    fetchInsights()
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
    if (!insights.value) return

    const rows: string[] = []
    const dateFrom = dateRange.value[0].format('YYYY-MM-DD')
    const dateTo = dateRange.value[1].format('YYYY-MM-DD')
    const filename = `visitor-insights-${dateFrom}_to_${dateTo}.csv`

    // Header
    rows.push('Visitor Insights Report')
    rows.push(`Date Range,${escapeCsv(dateFrom)} to ${escapeCsv(dateTo)}`)
    rows.push('Generated At,' + escapeCsv(dayjs().format('YYYY-MM-DD HH:mm:ss')))
    rows.push('')

    // Summary
    rows.push('Summary')
    rows.push('Metric,Value')
    rows.push(`Total Visitors,${escapeCsv(insights.value.summary.total_visitors)}`)
    rows.push(`Checked In,${escapeCsv(insights.value.summary.checked_in)}`)
    rows.push(`Checked Out,${escapeCsv(insights.value.summary.checked_out)}`)
    rows.push(`Pending,${escapeCsv(insights.value.summary.pending)}`)
    rows.push(`Expected,${escapeCsv(insights.value.summary.expected)}`)
    rows.push('')

    // Traffic
    rows.push('Traffic by Date')
    rows.push('Date,Count')
    insights.value.traffic.forEach(t => {
        rows.push(`${escapeCsv(t.date)},${escapeCsv(t.count)}`)
    })
    rows.push('')

    // Hourly traffic (if available)
    if (insights.value.today_hourly_traffic && insights.value.today_hourly_traffic.length > 0) {
        rows.push("Today's Hourly Traffic")
        rows.push('Hour,Count')
        insights.value.today_hourly_traffic.forEach(h => {
            rows.push(`${escapeCsv(h.hour)},${escapeCsv(h.count)}`)
        })
        rows.push('')
    }

    // Visit Purposes
    rows.push('Visit Purposes')
    rows.push('Purpose,Count,Percentage')
    insights.value.visit_purposes.forEach(p => {
        rows.push(`${escapeCsv(p.purpose)},${escapeCsv(p.count)},${escapeCsv(p.percentage)}%`)
    })
    rows.push('')

    // Top Visiting Companies
    rows.push('Top Visiting Companies')
    rows.push('Rank,Company,Visitor Count')
    insights.value.top_visiting_companies.forEach((c, index) => {
        rows.push(`${escapeCsv(index + 1)},${escapeCsv(c.name)},${escapeCsv(c.count)}`)
    })
    rows.push('')

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
}

watch([mappedHourlyTraffic, loading], async () => {
    if (!loading.value && mappedHourlyTraffic.value.length > 0) {
        await createHourlyChart()
    }
}, { immediate: true })

onMounted(() => {
    fetchInsights()
})

onBeforeUnmount(() => {
    if (hourlyChartInstance) {
        hourlyChartInstance.destroy()
        hourlyChartInstance = null
    }
})
</script>
