<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor List</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage and track your company's visitors.</p>
            </div>
            <NuxtLink to="/spoc/visitors/invite">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    <span class="hidden sm:inline">Invite Visitor</span>
                    <span class="sm:hidden">Invite</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <a-select v-model:value="selectedStatus" placeholder="All Status" allow-clear style="min-width: 150px"
                class="w-full sm:w-auto">
                <a-select-option value="pending">Pending</a-select-option>
                <a-select-option value="approved">Approved</a-select-option>
                <a-select-option value="checked_in">Checked In</a-select-option>
                <a-select-option value="checked_out">Checked Out</a-select-option>
                <a-select-option value="rejected">Rejected</a-select-option>
            </a-select>

            <a-input-search v-model:value="searchQuery" placeholder="Search visitors..." allow-clear
                class="flex-1 sm:max-w-xs" />
        </div>

        <!-- Visitor Table/Cards -->
        <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
            <!-- Desktop Table -->
            <div class="hidden sm:block overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-neutral-900">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Visitor</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Date
                                & Time</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Purpose</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Host
                            </th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Status</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Passcode</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-neutral-700">
                        <tr v-for="visitor in filteredVisitors" :key="visitor.id"
                            class="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                            <td class="px-6 py-4">
                                <div>
                                    <p class="font-medium text-gray-900 dark:text-white">{{ visitor.name }}</p>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ visitor.phone }}</p>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                                <div>{{ formatDate(visitor.visitDate) }}</div>
                                <div class="text-gray-400">{{ visitor.visitTime }}</div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{{ visitor.purpose }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{{ visitor.hostName || '-' }}
                            </td>
                            <td class="px-6 py-4">
                                <span :class="getStatusClass(visitor.status)"
                                    class="px-2 py-1 text-xs font-medium rounded-full">
                                    {{ getStatusLabel(visitor.status) }}
                                </span>
                            </td>
                            <td class="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                                {{ visitor.passcode || '-' }}
                            </td>
                        </tr>
                        <tr v-if="filteredVisitors.length === 0">
                            <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                <UsergroupAddOutlined class="text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                                <p>No visitors found</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile Cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-neutral-700">
                <div v-for="visitor in filteredVisitors" :key="visitor.id" class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">{{ visitor.name }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ visitor.phone }}</p>
                        </div>
                        <span :class="getStatusClass(visitor.status)"
                            class="px-2 py-1 text-xs font-medium rounded-full">
                            {{ getStatusLabel(visitor.status) }}
                        </span>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Date</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ formatDate(visitor.visitDate) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Purpose</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ visitor.purpose }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Host</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ visitor.hostName || '-' }}</p>
                        </div>
                        <div v-if="visitor.passcode">
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Passcode</p>
                            <p class="text-gray-600 dark:text-gray-300 font-mono">{{ visitor.passcode }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="filteredVisitors.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <UsergroupAddOutlined class="text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                    <p>No visitors found</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusOutlined, UsergroupAddOutlined } from '@ant-design/icons-vue'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const { visitors, loading } = storeToRefs(store)

const selectedStatus = ref<string | null>(null)
const searchQuery = ref('')

const filteredVisitors = computed(() => {
    let result = visitors.value

    if (selectedStatus.value) {
        result = result.filter(v => v.status === selectedStatus.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(v =>
            v.name.toLowerCase().includes(query) ||
            v.phone.includes(query) ||
            v.hostName?.toLowerCase().includes(query)
        )
    }

    return result
})

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

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

onMounted(() => {
    store.fetchVisitors()
})
</script>
