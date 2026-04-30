<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Company Dashboard</h1>
                <p class="text-gray-600 dark:text-gray-400">Overview of your company's visitors and employees.</p>
            </div>
            <NuxtLink to="/spoc/visitors/invite">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Invite Visitor
                </a-button>
            </NuxtLink>
        </div>

        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
                class="bg-white dark:bg-transparent rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                        <UsergroupAddOutlined class="text-lg sm:text-xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Total Visitors</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats?.totalVisitors
                            || 0 }}
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-transparent rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                        <ClockCircleOutlined class="text-lg sm:text-xl text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Pending</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{
                            stats?.pendingApprovals || 0
                        }}</p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-transparent rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                        <CheckCircleOutlined class="text-lg sm:text-xl text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Checked In</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats?.checkedInToday
                            || 0 }}
                        </p>
                    </div>
                </div>
            </div>

            <div
                class="bg-white dark:bg-transparent rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
                <div class="flex items-center gap-3">
                    <div
                        class="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                        <TeamOutlined class="text-lg sm:text-xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                        <p class="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Employees</p>
                        <p class="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">{{ stats?.totalEmployees
                            || 0 }}
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="bg-white dark:bg-transparent rounded-xl border border-gray-100 dark:border-neutral-700 p-4 sm:p-6">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <QuickActionCard title="Pre-register Visitor" description="Send invite link" to="/spoc/visitors/invite"
                    :icon="UserAddOutlined" icon-bg-class="bg-blue-50 dark:bg-blue-900/30"
                    icon-class="text-blue-600 dark:text-blue-400" />
                <QuickActionCard title="View Employees" description="Manage team" to="/spoc/employees"
                    :icon="TeamOutlined" icon-bg-class="bg-purple-50 dark:bg-purple-900/30"
                    icon-class="text-purple-600 dark:text-purple-400" />
                <QuickActionCard title="Visitor Report" description="Download data" to="/spoc/visitors"
                    :icon="DownloadOutlined" icon-bg-class="bg-green-50 dark:bg-green-900/30"
                    icon-class="text-green-600 dark:text-green-400" />
                <QuickActionCard title="Pending Approvals" :description="`${stats?.pendingApprovals || 0} waiting`"
                    to="/spoc/visitors?status=pending" :icon="ClockCircleOutlined"
                    icon-bg-class="bg-yellow-50 dark:bg-yellow-900/30"
                    icon-class="text-yellow-600 dark:text-yellow-400" />
            </div>
        </div>

        <!-- Recent Visitors -->
        <div
            class="bg-white dark:bg-transparent rounded-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
            <div
                class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center">
                <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Visitors</h2>
                <NuxtLink to="/spoc/visitors" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                    View All
                </NuxtLink>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-neutral-900">
                        <tr>
                            <th
                                class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Visitor</th>
                            <th
                                class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden sm:table-cell">
                                Purpose</th>
                            <th
                                class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase hidden md:table-cell">
                                Host</th>
                            <th
                                class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Status</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-neutral-700">
                        <tr v-for="visitor in recentVisitors" :key="visitor.id"
                            class="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                            <td class="px-4 sm:px-6 py-4">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">{{ visitor.name }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ visitor.phone }}</p>
                                </div>
                            </td>
                            <td class="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden sm:table-cell">
                                {{
                                    visitor.purpose }}</td>
                            <td class="px-4 sm:px-6 py-4 text-sm text-gray-600 dark:text-gray-300 hidden md:table-cell">
                                {{
                                    visitor.hostName }}</td>
                            <td class="px-4 sm:px-6 py-4">
                                <span :class="getStatusClass(visitor.status)"
                                    class="px-2 py-1 text-xs font-medium rounded-full">
                                    {{ getStatusLabel(visitor.status) }}
                                </span>
                            </td>
                        </tr>
                        <tr v-if="recentVisitors.length === 0">
                            <td colspan="4" class="px-4 sm:px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                No recent visitors
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <!-- Credit Transaction History (only when credit system is enabled) -->
        <div v-if="creditSystemEnabled"
            class="bg-white dark:bg-transparent rounded-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
            <div
                class="px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-neutral-700 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <WalletOutlined class="text-lg text-primary-600 dark:text-primary-400" />
                    <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Credit Transaction History</h2>
                </div>
                <div v-if="walletSummary" class="flex items-center gap-3">
                    <span class="text-sm text-gray-500 dark:text-gray-400">Balance:</span>
                    <span class="text-lg font-bold text-green-600">{{ walletSummary.current_balance }}</span>
                </div>
            </div>
            <div v-if="walletLoading" class="flex justify-center py-12">
                <a-spin size="large" />
            </div>
            <div v-else>
                <a-table :dataSource="walletTransactions" :columns="walletColumns" size="small"
                    :pagination="{ pageSize: 5 }" rowKey="id">
                    <template #bodyCell="{ column, record }">
                        <template v-if="column.key === 'transaction_type'">
                            <a-tag :color="record.transaction_type === 'credit' ? 'green' : 'red'">
                                {{ record.transaction_type === 'credit' ? 'Credit' : 'Debit' }}
                            </a-tag>
                        </template>
                        <template v-if="column.key === 'credits'">
                            <span
                                :class="record.transaction_type === 'credit' ? 'text-green-600 font-semibold' : 'text-red-500 font-semibold'">
                                {{ record.transaction_type === 'credit' ? '+' : '-' }}{{ record.credits }}
                            </span>
                        </template>
                        <template v-if="column.key === 'balance_after'">
                            <span class="font-medium">{{ record.balance_after }}</span>
                        </template>
                        <template v-if="column.key === 'reference_type'">
                            <span class="text-gray-600 dark:text-gray-300 text-xs">
                                {{ formatReferenceType(record.reference_type) }}
                            </span>
                            <div v-if="record.metadata?.reason" class="text-xs text-gray-400 mt-0.5">
                                {{ record.metadata.reason }}
                            </div>
                        </template>
                        <template v-if="column.key === 'created_at'">
                            {{ formatDate(record.created_at) }}
                        </template>
                    </template>
                </a-table>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
    PlusOutlined,
    UsergroupAddOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TeamOutlined,
    UserAddOutlined,
    DownloadOutlined,
    WalletOutlined
} from '@ant-design/icons-vue'
import QuickActionCard from '../../../components/common/QuickActionCard.vue'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const { stats, visitors } = storeToRefs(store)

const recentVisitors = computed(() => visitors.value.slice(0, 5))

// --- Credit System ---
const creditSystemEnabled = ref(false)
const walletLoading = ref(false)
const walletTransactions = ref<any[]>([])
const walletSummary = ref<{ company_name: string; current_balance: number; total_transactions: number } | null>(null)

const walletColumns = [
    { title: 'Type', dataIndex: 'transaction_type', key: 'transaction_type', width: 80 },
    { title: 'Credits', dataIndex: 'credits', key: 'credits', align: 'right' as const, width: 80 },
    { title: 'Balance', dataIndex: 'balance_after', key: 'balance_after', align: 'right' as const, width: 80 },
    { title: 'Reference', dataIndex: 'reference_type', key: 'reference_type' },
    { title: 'Date', dataIndex: 'created_at', key: 'created_at', width: 150 },
]

const fetchCreditConfig = async () => {
    try {
        const { $api } = useNuxtApp()
        const response = await $api<any>('/api/portal/visitors/public/tenant-config/')
        if (response.success && response.data) {
            creditSystemEnabled.value = response.data.credit_system_enabled ?? false
        }
    } catch (err) {
        creditSystemEnabled.value = false
    }
}

const fetchWalletTransactions = async () => {
    walletLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const result = await $api<any>('/api/portal/users/client_portal/wallet-transactions/')
        if (result.success && result.data) {
            walletTransactions.value = result.data.transactions || []
            walletSummary.value = {
                company_name: result.data.company_name || '',
                current_balance: result.data.current_balance ?? 0,
                total_transactions: result.data.total_transactions ?? 0
            }
        }
    } catch (err) {
        console.error('Failed to fetch wallet transactions:', err)
    } finally {
        walletLoading.value = false
    }
}

const formatReferenceType = (type: string) => {
    if (!type) return 'N/A'
    return type
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
}

const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
    })
}

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400',
        'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400',
        'checked_in': 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400',
        'checked_out': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400'
    }
    const key = status?.toLowerCase() || 'pending'
    return classes[key] || classes['pending']
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'pending': 'Pending',
        'approved': 'Approved',
        'checked_in': 'Checked In',
        'checked_out': 'Checked Out',
        'rejected': 'Rejected'
    }
    const key = status?.toLowerCase() || 'pending'
    return labels[key] || status
}

onMounted(async () => {
    await Promise.all([
        store.fetchStats(),
        store.fetchVisitors(),
        fetchCreditConfig()
    ])
    // Only fetch wallet transactions if credit system is enabled
    if (creditSystemEnabled.value) {
        await fetchWalletTransactions()
    }
})
</script>
