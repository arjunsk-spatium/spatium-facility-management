<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center p-4 transition-colors duration-300">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Privacy Requests</h1>
        </div>

        <!-- Stats Section -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Requests" :value="stats.total" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <SafetyOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Pending" :value="stats.pending" :value-style="{ color: '#faad14' }">
                    <template #prefix>
                        <ClockCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Erasure" :value="stats.erasure" :value-style="{ color: '#ff4d4f' }">
                    <template #prefix>
                        <DeleteOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Withdraw Consent" :value="stats.withdrawConsent" :value-style="{ color: '#722ed1' }">
                    <template #prefix>
                        <FileProtectOutlined />
                    </template>
                </a-statistic>
            </a-card>
        </div>

        <!-- Filters -->
        <a-card class="shadow-sm">
            <div class="flex flex-col lg:flex-row lg:items-end gap-4">
                <div class="flex flex-col sm:flex-row gap-4 flex-wrap flex-grow">
                    <a-input-search v-model:value="filters.search" placeholder="Search reference..." style="width: 220px"
                        allow-clear @search="applyFilters" />

                    <a-select v-model:value="filters.status" placeholder="Status" style="width: 160px" allow-clear
                        @change="applyFilters">
                        <a-select-option value="pending">Pending</a-select-option>
                        <a-select-option value="under_review">Under Review</a-select-option>
                        <a-select-option value="approved">Approved</a-select-option>
                        <a-select-option value="rejected">Rejected</a-select-option>
                        <a-select-option value="completed">Completed</a-select-option>
                        <a-select-option value="cancelled">Cancelled</a-select-option>
                    </a-select>

                    <a-select v-model:value="filters.request_type" placeholder="Request Type" style="width: 180px"
                        allow-clear @change="applyFilters">
                        <a-select-option value="erasure">Erasure</a-select-option>
                        <a-select-option value="withdraw_consent">Withdraw Consent</a-select-option>
                        <a-select-option value="rectification">Rectification</a-select-option>
                        <a-select-option value="access">Access</a-select-option>
                    </a-select>

                    <a-select v-model:value="filters.tenant_id" placeholder="Tenant" style="width: 200px" allow-clear
                        show-search option-filter-prop="label" @change="applyFilters">
                        <a-select-option v-for="tenant in tenantStore.tenants" :key="tenant.id" :value="tenant.id"
                            :label="tenant.name">
                            {{ tenant.name }}
                        </a-select-option>
                    </a-select>

                    <a-range-picker v-model:value="filters.dateRange" style="width: 240px" @change="applyFilters" />
                </div>

                <a-button type="primary" @click="applyFilters">
                    <template #icon>
                        <SearchOutlined />
                    </template>
                    Search
                </a-button>
                <a-button @click="resetFilters">
                    Reset
                </a-button>
            </div>
        </a-card>

        <!-- Data View -->
        <a-card class="shadow-sm">
            <ResponsiveDataView :columns="columns" :data="store.requests" :loading="store.loading"
                :row-key="(record: any) => record.id" :pagination="paginationConfig" @change="handleTableChange">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'request_reference'">
                        <NuxtLink :to="`/privacy-requests/${record.id}`"
                            class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                            {{ record.request_reference }}
                        </NuxtLink>
                    </template>
                    <template v-if="column.key === 'request_type'">
                        <a-tag :color="getRequestTypeColor(record.request_type)">
                            {{ record.request_type_display || formatRequestType(record.request_type) }}
                        </a-tag>
                    </template>
                    <template v-if="column.key === 'status'">
                        <a-tag :color="getStatusColor(record.status)">
                            {{ record.status_display || formatStatus(record.status) }}
                        </a-tag>
                    </template>
                    <template v-if="column.key === 'tenant'">
                        {{ tenantName(record.tenant_id) }}
                    </template>
                    <template v-if="column.key === 'due_date'">
                        <span :class="{ 'text-danger-500': record.is_overdue }">
                            {{ formatDate(record.due_date) }}
                        </span>
                    </template>
                    <template v-if="column.key === 'submitted_at'">
                        {{ formatDate(record.submitted_at) }}
                    </template>
                    <template v-if="column.key === 'action'">
                        <NuxtLink :to="`/privacy-requests/${record.id}`">
                            <a-button type="link" size="small">View</a-button>
                        </NuxtLink>
                    </template>
                </template>

                <template #mobileCard="{ record: request }">
                    <a-card class="mb-4">
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-start">
                                <NuxtLink :to="`/privacy-requests/${request.id}`"
                                    class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                    {{ request.request_reference }}
                                </NuxtLink>
                                <a-tag :color="getStatusColor(request.status)">
                                    {{ request.status_display || formatStatus(request.status) }}
                                </a-tag>
                            </div>
                            <div class="flex items-center gap-2">
                                <a-tag :color="getRequestTypeColor(request.request_type)">
                                    {{ request.request_type_display || formatRequestType(request.request_type) }}
                                </a-tag>
                                <span v-if="request.is_overdue" class="text-danger-500 text-xs font-medium">Overdue</span>
                            </div>
                            <div class="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">
                                {{ request.description || 'No description provided.' }}
                            </div>
                            <div class="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span class="text-neutral-500">Tenant:</span>
                                    <span class="ml-1">{{ tenantName(request.tenant_id) }}</span>
                                </div>
                                <div>
                                    <span class="text-neutral-500">Due:</span>
                                    <span class="ml-1" :class="{ 'text-danger-500': request.is_overdue }">
                                        {{ formatDate(request.due_date) }}
                                    </span>
                                </div>
                            </div>
                            <div class="text-xs text-neutral-500">
                                Submitted {{ formatDate(request.submitted_at) }}
                            </div>
                            <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                <NuxtLink :to="`/privacy-requests/${request.id}`">
                                    <a-button type="default" size="small">View</a-button>
                                </NuxtLink>
                            </div>
                        </div>
                    </a-card>
                </template>
            </ResponsiveDataView>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { Dayjs } from 'dayjs'
import {
    SafetyOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    FileProtectOutlined,
    SearchOutlined,
} from '@ant-design/icons-vue'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'

definePageMeta({ layout: 'default' })

const store = usePrivacyRequestStore()
const tenantStore = useTenantStore()

const filters = ref<{
    search: string
    status: string | undefined
    request_type: string | undefined
    tenant_id: string | undefined
    dateRange: [Dayjs, Dayjs] | null
}>({
    search: '',
    status: undefined,
    request_type: undefined,
    tenant_id: undefined,
    dateRange: null,
})

const columns = [
    { title: 'Reference', key: 'request_reference', dataIndex: 'request_reference', ellipsis: true },
    { title: 'Type', key: 'request_type', dataIndex: 'request_type', width: 180 },
    { title: 'Status', key: 'status', dataIndex: 'status', width: 140 },
    { title: 'Tenant', key: 'tenant', width: 180 },
    { title: 'Due Date', key: 'due_date', dataIndex: 'due_date', width: 140 },
    { title: 'Submitted', key: 'submitted_at', dataIndex: 'submitted_at', width: 170 },
    { title: 'Action', key: 'action', fixed: 'right', width: 100 },
]

const stats = computed(() => ({
    total: store.summary?.total ?? 0,
    pending: store.summary?.by_status?.pending ?? 0,
    erasure: store.summary?.by_type?.erasure ?? 0,
    withdrawConsent: store.summary?.by_type?.withdraw_consent ?? 0,
}))

const paginationConfig = computed(() => ({
    current: store.page,
    pageSize: store.pageSize,
    total: store.count,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number) => `Total ${total} requests`,
}))

const tenantName = (id: string) => {
    return tenantStore.tenants.find((t) => t.id === id)?.name || id
}

const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
        pending: 'warning',
        under_review: 'processing',
        approved: 'success',
        rejected: 'error',
        completed: 'success',
        cancelled: 'default',
    }
    return colors[status || ''] || 'default'
}

const getRequestTypeColor = (type?: string) => {
    const colors: Record<string, string> = {
        erasure: 'error',
        withdraw_consent: 'purple',
        rectification: 'blue',
        access: 'cyan',
    }
    return colors[type || ''] || 'default'
}

const formatStatus = (status?: string) => {
    if (!status) return '-'
    return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatRequestType = (type?: string) => {
    if (!type) return '-'
    return type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    })
}

const buildParams = () => {
    const params: Record<string, any> = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.request_type) params.request_type = filters.value.request_type
    if (filters.value.tenant_id) params.tenant_id = filters.value.tenant_id
    if (filters.value.dateRange) {
        params.date_from = filters.value.dateRange[0].format('YYYY-MM-DD')
        params.date_to = filters.value.dateRange[1].format('YYYY-MM-DD')
    }
    return params
}

const applyFilters = () => {
    store.fetchRequests({ ...buildParams(), page: 1 })
}

const resetFilters = () => {
    filters.value = {
        search: '',
        status: undefined,
        request_type: undefined,
        tenant_id: undefined,
        dateRange: null,
    }
    store.fetchRequests({ page: 1 })
}

const handleTableChange = (pagination: any) => {
    store.fetchRequests({
        ...buildParams(),
        page: pagination.current,
        page_size: pagination.pageSize,
    })
}

onMounted(() => {
    store.fetchRequests()
    store.fetchSummary()
    tenantStore.fetchTenants()
})
</script>
