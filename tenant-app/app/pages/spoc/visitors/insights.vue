<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Analytics and reporting for your company visitors.</p>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a-range-picker v-model:value="dateRange" :presets="rangePresets" @change="onDateChange" />
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
            <!-- Stats Cards (Matching backend stats structure) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                <a-card>
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <UsergroupAddOutlined class="text-xl text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Visitors</div>
                            <div class="text-xl sm:text-2xl font-bold dark:text-white">{{ statsData.total_visitors }}</div>
                        </div>
                    </div>
                </a-card>

                <a-card>
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircleOutlined class="text-xl text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Completed Visits</div>
                            <div class="text-xl sm:text-2xl font-bold dark:text-white">{{ statsData.completed_visits }}</div>
                        </div>
                    </div>
                </a-card>

                <a-card>
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <UserOutlined class="text-xl text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Walk-in</div>
                            <div class="text-xl sm:text-2xl font-bold dark:text-white">{{ statsData.walk_in }}</div>
                        </div>
                    </div>
                </a-card>

                <a-card>
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <MailOutlined class="text-xl text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pre-invite</div>
                            <div class="text-xl sm:text-2xl font-bold dark:text-white">{{ statsData.pre_invite }}</div>
                        </div>
                    </div>
                </a-card>

                <a-card>
                    <div class="flex items-center gap-3 sm:gap-4">
                        <div class="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <RiseOutlined class="text-xl text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <div class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">This Month</div>
                            <div class="text-xl sm:text-2xl font-bold dark:text-white">{{ statsData.this_month }}</div>
                        </div>
                    </div>
                </a-card>
            </div>

            <!-- Visit Purpose Breakdown -->
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Visit Purpose Chart -->
                <div class="lg:col-span-1">
                    <VisitorPurposeWidget :data="mappedPurposes" />
                </div>

                <!-- Visit Purpose Progress Breakdown -->
                <div class="lg:col-span-2">
                    <a-card title="Visit Purpose Breakdown">
                        <div v-if="mappedPurposes.length === 0" class="flex items-center justify-center h-48 text-gray-400">
                            No purpose data available
                        </div>
                        <div v-else class="space-y-4 py-2">
                            <div v-for="item in mappedPurposes" :key="item.purpose" class="space-y-1">
                                <div class="flex justify-between items-center text-sm">
                                    <div class="flex items-center gap-2">
                                        <span class="w-3 h-3 rounded-full" :style="{ backgroundColor: item.color }"></span>
                                        <span class="font-medium text-gray-700 dark:text-gray-300">{{ item.purpose }}</span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <span class="font-bold text-gray-900 dark:text-white">{{ item.count }}</span>
                                        <span class="text-xs text-gray-500">({{ item.percentage }}%)</span>
                                    </div>
                                </div>
                                <div class="h-2.5 bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                                    <div class="h-full rounded-full transition-all duration-500"
                                        :style="{ width: item.percentage + '%', backgroundColor: item.color }"></div>
                                </div>
                            </div>
                        </div>
                    </a-card>
                </div>
            </div>

            <!-- Visitor Trends Chart (if traffic data is present) -->
            <div v-if="mappedTraffic.length > 0">
                <VisitorChartWidget :data="mappedTraffic" />
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
import {
    DownloadOutlined,
    UsergroupAddOutlined,
    CheckCircleOutlined,
    UserOutlined,
    MailOutlined,
    RiseOutlined
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { storeToRefs } from 'pinia'
import { useSpocStore } from '../../../../stores/spoc'
import VisitorChartWidget from '../../../../components/visitors/widgets/VisitorChartWidget.vue'
import VisitorPurposeWidget from '../../../../components/visitors/widgets/VisitorPurposeWidget.vue'
import TopVisitingCompaniesWidget from '../../../../components/visitors/widgets/TopVisitingCompaniesWidget.vue'

definePageMeta({
    middleware: 'auth'
})

const route = useRoute()
const store = useSpocStore()
const { getFinancialYearStartDate } = useDate()
const { insights, insightsLoading: loading, insightsError: error } = storeToRefs(store)

const exporting = ref(false)

// Default to start of this financial year and end date today unless query parameters are provided
const defaultStartDate = dayjs(getFinancialYearStartDate())
const defaultEndDate = dayjs()

const initialStart = route.query.start_date
    ? dayjs(String(route.query.start_date))
    : defaultStartDate
const initialEnd = route.query.end_date
    ? dayjs(String(route.query.end_date))
    : defaultEndDate

const dateRange = ref<[Dayjs, Dayjs]>([initialStart, initialEnd])

const rangePresets = [
    { label: 'This Financial Year', value: [defaultStartDate, defaultEndDate] },
    { label: 'This Month', value: [dayjs().startOf('month'), dayjs()] },
    { label: 'Today', value: [dayjs().startOf('day'), dayjs()] }
]

const statsData = computed(() => {
    return {
        total_visitors: insights.value?.stats?.total_visitors ?? insights.value?.summary?.total_visitors ?? 0,
        completed_visits: insights.value?.stats?.completed_visits ?? insights.value?.summary?.checked_out ?? 0,
        walk_in: insights.value?.stats?.walk_in ?? 0,
        pre_invite: insights.value?.stats?.pre_invite ?? 0,
        this_month: insights.value?.stats?.this_month ?? 0
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
    const list = insights.value?.visit_purpose_breakdown || insights.value?.visit_purposes || []
    if (list.length === 0) return []
    return list.map((p, index) => ({
        purpose: p.purpose,
        count: p.count,
        percentage: p.percentage ?? 0,
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
        rows.push(`Total Visitors,${escapeCsv(statsData.value.total_visitors)}`)
        rows.push(`Completed Visits,${escapeCsv(statsData.value.completed_visits)}`)
        rows.push(`Walk-in,${escapeCsv(statsData.value.walk_in)}`)
        rows.push(`Pre-invite,${escapeCsv(statsData.value.pre_invite)}`)
        rows.push(`This Month,${escapeCsv(statsData.value.this_month)}`)
        rows.push('')

        // Visit Purposes
        if (mappedPurposes.value && mappedPurposes.value.length > 0) {
            rows.push('Visit Purpose Breakdown')
            rows.push('Purpose,Count,Percentage')
            mappedPurposes.value.forEach(p => {
                rows.push(`${escapeCsv(p.purpose)},${escapeCsv(p.count)},${escapeCsv(p.percentage)}%`)
            })
            rows.push('')
        }

        // Traffic
        if (insights.value.traffic && insights.value.traffic.length > 0) {
            rows.push('Traffic by Date')
            rows.push('Date,Count')
            insights.value.traffic.forEach(t => {
                rows.push(`${escapeCsv(t.date)},${escapeCsv(t.count)}`)
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
