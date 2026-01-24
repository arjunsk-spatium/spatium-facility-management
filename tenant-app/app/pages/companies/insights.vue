<template>
    <div class="space-y-6">
        <div class="mb-8">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Company Insights</h1>
            <p class="text-gray-600 dark:text-gray-400">Overview of company performance and statistics</p>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        <div v-else-if="insights" class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <!-- Total Companies -->
            <a-card>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Companies</div>
                <div class="text-3xl font-bold text-gray-900 dark:text-white">{{ insights.totalCompanies }}</div>
            </a-card>

            <!-- Active Companies -->
            <a-card>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Active Companies</div>
                <div class="text-3xl font-bold text-green-600 dark:text-green-500">{{ insights.activeCompanies }}</div>
            </a-card>

            <!-- Inactive Companies -->
            <a-card>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Inactive Companies</div>
                <div class="text-3xl font-bold text-gray-600 dark:text-gray-400">{{ insights.inactiveCompanies }}</div>
            </a-card>

            <!-- Revenue -->
            <a-card>
                <div class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Revenue</div>
                <div class="text-3xl font-bold text-indigo-600 dark:text-indigo-400">₹{{
                    insights.revenue.toLocaleString() }}</div>
            </a-card>
        </div>

        <!-- Charts Section -->
        <div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <a-card>
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Company Status Distribution</h3>
                </template>
                <div class="h-64 mt-4 overflow-hidden">
                    <div ref="statusChartContainer" v-if="!loading && insights" class="w-full h-full"></div>
                    <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
                </div>
            </a-card>
            <a-card>
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue Trend (Mock)</h3>
                </template>
                <div class="h-64 mt-4 overflow-hidden">
                    <div ref="revenueChartContainer" v-if="!loading" class="w-full h-full"></div>
                    <div v-else class="flex items-center justify-center h-full text-gray-500">No data available</div>
                </div>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch, onBeforeUnmount, nextTick } from 'vue'
import { useCompanyStore } from '../../../stores/company'
import { Column, Line } from '@antv/g2plot'

definePageMeta({
    middleware: 'auth'
})

const store = useCompanyStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)

const statusChartContainer = ref<HTMLDivElement | null>(null)
const revenueChartContainer = ref<HTMLDivElement | null>(null)
let statusChartInstance: Column | null = null
let revenueChartInstance: Line | null = null

const statusChartData = computed(() => {
    if (!insights.value) return []
    return [
        { status: 'Active', count: insights.value.activeCompanies, color: '#10b981' },
        { status: 'Inactive', count: insights.value.inactiveCompanies, color: '#ef4444' },
        { status: 'Pending', count: (insights.value.totalCompanies - insights.value.activeCompanies - insights.value.inactiveCompanies), color: '#f59e0b' }
    ]
})

const revenueChartData = [
    { month: 'Jan', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Apr', revenue: 25000 },
    { month: 'May', revenue: 22000 },
    { month: 'Jun', revenue: 30000 }
]

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
            const item = statusChartData.value.find(d => d.status === status)
            return item?.color || '#666'
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
    if (!revenueChartContainer.value) return

    if (revenueChartInstance) {
        revenueChartInstance.destroy()
    }

    revenueChartInstance = new Line(revenueChartContainer.value, {
        data: revenueChartData,
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
            min: 10000,
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
    store.fetchInsightsAction()
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
