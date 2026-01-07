<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitor List</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage and track your company's visitors.</p>
            </div>
            <div class="flex items-center gap-3">
                <NuxtLink to="/spoc/visitors/insights">
                    <a-button>
                        <template #icon>
                            <BarChartOutlined />
                        </template>
                        Insights
                    </a-button>
                </NuxtLink>
                <NuxtLink to="/spoc/visitors/invite">
                    <a-button type="primary">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Invite <hide class="hidden sm:inline">Visitor</hide>
                    </a-button>
                </NuxtLink>
            </div>
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

        <!-- Visitor Table/Cards using ResponsiveDataView -->
        <ResponsiveDataView :columns="columns" :data="filteredVisitors" :loading="loading" row-key="id">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'visitor'">
                    <div>
                        <p class="font-medium text-gray-900 dark:text-white">{{ record.name }}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.phone }}</p>
                    </div>
                </template>

                <template v-if="column.key === 'datetime'">
                    <div>{{ formatDate(record.visitDate) }}</div>
                    <div class="text-gray-400 text-xs">{{ record.visitTime }}</div>
                </template>

                <template v-if="column.key === 'status'">
                    <span :class="getStatusClass(record.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                        {{ getStatusLabel(record.status) }}
                    </span>
                </template>

                <template v-if="column.key === 'passcode'">
                    <span class="font-mono">{{ record.passcode || '-' }}</span>
                </template>
            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card
                    class="mb-4 shadow-sm !border-neutral-200 dark:!border-neutral-700 hover:shadow-md transition-shadow"
                    :bordered="true" :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="font-bold text-base dark:text-white">{{ record.name }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.phone }}</p>
                        </div>
                        <span :class="getStatusClass(record.status)" class="px-2 py-1 text-xs font-medium rounded-full">
                            {{ getStatusLabel(record.status) }}
                        </span>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Date</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ formatDate(record.visitDate) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Purpose</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.purpose }}</p>
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400">Host: {{ record.hostName || '-' }}</span>
                        </div>
                        <span v-if="record.passcode" class="font-mono text-sm text-gray-600 dark:text-gray-300">
                            {{ record.passcode }}
                        </span>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusOutlined, BarChartOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const { visitors, loading } = storeToRefs(store)

const selectedStatus = ref<string | null>(null)
const searchQuery = ref('')

// Table columns
const columns = [
    { title: 'Visitor', key: 'visitor', dataIndex: 'name' },
    { title: 'Date & Time', key: 'datetime', dataIndex: 'visitDate', width: 150 },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
    { title: 'Host', dataIndex: 'hostName', key: 'host' },
    { title: 'Status', key: 'status', dataIndex: 'status', width: 120 },
    { title: 'Passcode', key: 'passcode', dataIndex: 'passcode', width: 100 }
]

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
