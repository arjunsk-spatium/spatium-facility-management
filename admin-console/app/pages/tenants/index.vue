<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center p-4  transition-colors duration-300">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
            <NuxtLink to="/tenants/create">
                <a-button type="primary" size="large">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <span class="hidden sm:inline">Tenant</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Stats Section -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Tenants" :value="stats.count || 0" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <TeamOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Active" :value="stats.active || 0" :value-style="{ color: '#52c41a' }">
                    <template #prefix>
                        <CheckCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Trial" :value="stats.trial || 0" :value-style="{ color: '#faad14' }">
                    <template #prefix>
                        <ClockCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Suspended" :value="0" :value-style="{ color: '#ff4d4f' }">
                    <template #prefix>
                        <StopOutlined />
                    </template>
                </a-statistic>
            </a-card>
        </div>

        <!-- Search and Actions Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:mb-4 md:px-0">
            <span class="text-lg font-semibold">Tenant List</span>
            <div class="flex items-center gap-3">
                <a-input-search v-model:value="searchText" placeholder="Search tenants..." style="width: 250px"
                    allow-clear />
                <a-button @click="exportData" :loading="exporting">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    <span class="hidden sm:inline">Export</span>
                </a-button>
            </div>
        </div>

        <!-- Data View -->
        <ResponsiveDataView :columns="columns" :data="filteredTenants" :loading="loading"
            :row-key="(record: any) => record.id" :pagination="paginationConfig">
            <!-- Desktop Table Cells -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    <NuxtLink :to="`/tenants/${record.id}`"
                        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        {{ record.name }}
                    </NuxtLink>
                </template>
                <template v-if="column.key === 'status'">
                    <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>
                <template v-if="column.key === 'modules'">
                    <span>{{ record.moduleCount ?? (record.modules || []).length }} modules</span>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <NuxtLink :to="`/tenants/${record.id}/edit`">
                            <a-button type="link">Edit</a-button>
                        </NuxtLink>
                        <a-popconfirm title="Are you sure delete this tenant?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="link" danger>Delete</a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record: tenant }">
                <a-card class="mb-4">
                    <div class="flex flex-col gap-3">
                        <!-- Header: Name + Status -->
                        <div class="flex justify-between items-start">
                            <NuxtLink :to="`/tenants/${tenant.id}`"
                                class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                {{ tenant.name }}
                            </NuxtLink>
                            <a-tag :color="getStatusColor(tenant.status)">{{ tenant.status }}</a-tag>
                        </div>

                        <!-- Details -->
                        <div class="grid grid-cols-1 gap-2 text-sm">
                            <div class="flex flex-col">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">Domain</span>
                                <span class="text-neutral-900 dark:text-neutral-200">{{ tenant.domain }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">Plan</span>
                                <span class="text-neutral-900 dark:text-neutral-200">{{ tenant.planName }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">Admin</span>
                                <span class="text-neutral-900 dark:text-neutral-200">{{ tenant.adminEmail }}</span>
                            </div>
                            <div class="flex flex-col">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">Modules</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <a-tag v-for="mod in (tenant.modules || [])" :key="mod" size="small">{{ mod
                                        }}</a-tag>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div
                            class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <NuxtLink :to="`/tenants/${tenant.id}/edit`">
                                <a-button type="default" size="small">Edit</a-button>
                            </NuxtLink>
                            <a-popconfirm title="Are you sure delete this tenant?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(tenant.id)">
                                <a-button type="default" danger size="small">Delete</a-button>
                            </a-popconfirm>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    TeamOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    StopOutlined,
    DownloadOutlined
} from '@ant-design/icons-vue'
import { useTenantStore } from '../../../stores/tenant'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'

const store = useTenantStore()
const tenants = computed(() => store.tenants)
const stats = computed(() => store.dashboardData?.stats?.total_tenants || {})
const loading = computed(() => store.loading)

const searchText = ref('')
const exporting = ref(false)

// Filtered tenants based on search
const filteredTenants = computed(() => {
    if (!searchText.value) return tenants.value
    const search = searchText.value.toLowerCase()
    return tenants.value.filter(tenant =>
        tenant.name.toLowerCase().includes(search) ||
        tenant.domain.toLowerCase().includes(search) ||
        (tenant.adminEmail?.toLowerCase() || '').includes(search) ||
        (tenant.planName?.toLowerCase() || '').includes(search)
    )
})

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'green'
        case 'trial': return 'orange'
        case 'suspended': return 'red'
        default: return 'default'
    }
}

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name)
    },
    {
        title: 'Domain',
        dataIndex: 'domain',
        key: 'domain',
    },
    {
        title: 'Plan',
        dataIndex: 'planName',
        key: 'planName',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'Modules',
        dataIndex: 'modules',
        key: 'modules',
    },
    {
        title: 'Users',
        dataIndex: 'userCount',
        key: 'userCount',
        sorter: (a: any, b: any) => a.userCount - b.userCount
    },
    {
        title: 'Action',
        key: 'action',
    },
]

const paginationConfig = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} tenants`,
}))

const handleDelete = async (id: string) => {
    try {
        await store.deleteTenantAction(id)
        message.success('Tenant deleted successfully')
    } catch {
        message.error('Failed to delete tenant')
    }
}

const exportData = async () => {
    exporting.value = true
    try {
        const XLSX = await import('xlsx')
        const data = filteredTenants.value.map(t => ({
            'Name': t.name,
            'Domain': t.domain,
            'Admin Email': t.adminEmail,
            'Plan': t.planName || '',
            'Status': t.status,
            'Modules': (t.modules || []).join(', '),
            'Users': t.userCount,
            'Created': t.createdAt
        }))
        const ws = XLSX.utils.json_to_sheet(data)
        const wb = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(wb, ws, 'Tenants')
        XLSX.writeFile(wb, `tenants-${new Date().toISOString().slice(0, 10)}.xlsx`)
    } catch (error) {
        message.error('Failed to export data')
    } finally {
        exporting.value = false
    }
}

onMounted(() => {
    store.fetchTenants()
    store.fetchDashboardData()
})
</script>

<style scoped>
.page-header {
    background: #ffffff;
    border: 1px solid #e5e5e5;
}

.dark .page-header {
    background: #1f1f1f;
    border-color: #333333;
}
</style>
