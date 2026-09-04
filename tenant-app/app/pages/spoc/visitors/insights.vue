<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Analytics and reporting for your company visitors.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker v-model:value="dateRange" @change="onDateChange" />
                <a-button type="primary" :loading="exporting" @click="exportReport">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    <span class="hidden sm:inline">Export Report</span>
                </a-button>
            </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <!-- Error -->
        <div v-else-if="error" class="text-center text-red-500 p-12 bg-red-50 dark:bg-red-900/20 rounded-xl">
            {{ error }}
        </div>

        <!-- Content -->
        <template v-else>
            <!-- Stats Cards -->
            <VisitorStatsWidget :stats="mappedStats" />

            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Visitor Trends Chart -->
                <div class="lg:col-span-2">
                    <VisitorChartWidget :data="mappedTraffic" />
                </div>

                <!-- Visit Purpose Breakdown -->
                <div class="lg:col-span-1">
                    <VisitorPurposeWidget :data="mappedPurposes" />
                </div>
            </div>

            <!-- Top Visiting Companies (if present) -->
            <div v-if="insights?.top_visiting_companies && insights.top_visiting_companies.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <TopVisitingCompaniesWidget :data="insights.top_visiting_companies" />
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DownloadOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { storeToRefs } from 'pinia'
import { useSpocStore } from '../../../../stores/spoc'
import VisitorStatsWidget from '../../../../components/visitors/widgets/VisitorStatsWidget.vue'
import VisitorChartWidget from '../../../../components/visitors/widgets/VisitorChartWidget.vue'
import VisitorPurposeWidget from '../../../../components/visitors/widgets/VisitorPurposeWidget.vue'
import TopVisitingCompaniesWidget from '../../../../components/visitors/widgets/TopVisitingCompaniesWidget.vue'

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const store = useSpocStore()
const { insights, insightsLoading: loading, insightsError: error } = storeToRefs(store)

const exporting = ref(false)

// Initialize date range from query params or default date range
const initialStart = route.query.start_date
    ? dayjs(String(route.query.start_date))
    : dayjs('2025-01-01')
const initialEnd = route.query.end_date
    ? dayjs(String(route.query.end_date))
    : dayjs('2025-12-31')

const dateRange = ref<[Dayjs, Dayjs]>([initialStart, initialEnd])

const mappedStats = computed(() => {
    if (!insights.value?.summary) {
        return {
            total: 0,
            checkedIn: 0,
            checkedOut: 0,
            pending: 0,
            expected: 0
        }
    }
    return {
        total: insights.value.summary.total_visitors || 0,
        checkedIn: insights.value.summary.checked_in || 0,
        checkedOut: insights.value.summary.checked_out || 0,
        pending: insights.value.summary.pending || 0,
        expected: insights.value.summary.expected || 0
    }
})

const mappedTraffic = computed(() => {
    if (!insights.value?.traffic || insights.value.traffic.length === 0) return []
    return insights.value.traffic.map(d => ({
        day: d.date ? new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }) : '',
        count: d.count || 0
    }))
})

const purposeColors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#f97316']

const mappedPurposes = computed(() => {
    if (!insights.value?.visit_purposes || insights.value.visit_purposes.length === 0) return []
    return insights.value.visit_purposes.map((p, index) => ({
        purpose: p.purpose,
        count: p.count,
        color: purposeColors[index % purposeColors.length]
    }))
})

const fetchInsightsData = async () => {
    if (!dateRange.value || dateRange.value.length !== 2) return

    try {
        const startDate = dateRange.value[0].format('YYYY-MM-DD')
        const endDate = dateRange.value[1].format('YYYY-MM-DD')
        await store.fetchInsights(startDate, endDate)
    } catch (err) {
        // Error captured in store.insightsError
    }
}

const onDateChange = () => {
    fetchInsightsData()
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
        const dateFrom = dateRange.value?.[0]?.format('YYYY-MM-DD') || 'start'
        const dateTo = dateRange.value?.[1]?.format('YYYY-MM-DD') || 'end'
        const filename = `spoc-visitor-insights-${dateFrom}_to_${dateTo}.csv`

        // Header
        rows.push('SPOC Visitor Insights Report')
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
        if (insights.value.traffic && insights.value.traffic.length > 0) {
            rows.push('Traffic by Date')
            rows.push('Date,Count')
            insights.value.traffic.forEach(t => {
                rows.push(`${escapeCsv(t.date)},${escapeCsv(t.count)}`)
            })
            rows.push('')
        }

        // Visit Purposes
        if (insights.value.visit_purposes && insights.value.visit_purposes.length > 0) {
            rows.push('Visit Purposes')
            rows.push('Purpose,Count,Percentage')
            insights.value.visit_purposes.forEach(p => {
                rows.push(`${escapeCsv(p.purpose)},${escapeCsv(p.count)},${escapeCsv(p.percentage)}%`)
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

onMounted(() => {
    fetchInsightsData()
})
</script>
