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
                <div class="h-64">
                    <BarChart v-if="!loading" :chart-data="statusChartData" :options="chartOptions" />
                </div>
            </a-card>
            <a-card>
                <template #title>
                    <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">Revenue Trend (Mock)</h3>
                </template>
                <div class="h-64">
                    <LineChart v-if="!loading" :chart-data="revenueChartData" :options="chartOptions" />
                </div>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useCompanyStore } from '../../../stores/company'
import BarChart from '../../../components/common/charts/BarChart.vue'
import LineChart from '../../../components/common/charts/LineChart.vue'

definePageMeta({
    middleware: 'auth'
})

const store = useCompanyStore()
const insights = computed(() => store.insights)
const loading = computed(() => store.loading)

onMounted(() => {
    store.fetchInsightsAction()
})

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const
        }
    }
}

const statusChartData = computed(() => ({
    labels: ['Active', 'Inactive', 'Pending'],
    datasets: [{
        label: 'Companies',
        backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
        data: [
            insights.value?.activeCompanies || 0,
            insights.value?.inactiveCompanies || 0,
            (insights.value?.totalCompanies || 0) - (insights.value?.activeCompanies || 0) - (insights.value?.inactiveCompanies || 0)
        ]
    }]
}))

const revenueChartData = computed(() => ({
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
        label: 'Revenue (₹)',
        borderColor: '#3378ff',
        backgroundColor: 'rgba(51, 120, 255, 0.2)',
        tension: 0.4,
        fill: true,
        data: [12000, 19000, 15000, 25000, 22000, 30000] // Mock data
    }]
}))
</script>
