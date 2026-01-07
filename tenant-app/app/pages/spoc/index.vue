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
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
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
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
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
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
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
                class="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-6 border border-gray-100 dark:border-neutral-700">
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

        <!-- Recent Visitors -->
        <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
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
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import {
    PlusOutlined,
    UsergroupAddOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    TeamOutlined
} from '@ant-design/icons-vue'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const { stats, visitors } = storeToRefs(store)

const recentVisitors = computed(() => visitors.value.slice(0, 5))

const getStatusClass = (status: string) => {
    const classes: Record<string, string> = {
        'pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        'approved': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        'checked_in': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        'checked_out': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        'rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return classes[status] || classes['pending']
}

const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
        'pending': 'Pending',
        'approved': 'Approved',
        'checked_in': 'Checked In',
        'checked_out': 'Checked Out',
        'rejected': 'Rejected'
    }
    return labels[status] || status
}

onMounted(async () => {
    await Promise.all([
        store.fetchStats(),
        store.fetchVisitors()
    ])
})
</script>
