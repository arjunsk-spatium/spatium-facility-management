<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex justify-between items-center p-4 rounded-lg shadow-sm transition-colors duration-300 page-header">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
            <NuxtLink to="/companies/create">
                <a-button type="primary" size="large">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create Company
                </a-button>
            </NuxtLink>
        </div>

        <!-- Insights Section -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <a-card :bordered="false" class="shadow-sm">
                <a-statistic title="Total Companies" :value="stats.total" :value-style="{ color: '#3f8600' }">
                    <template #prefix>
                        <BankOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card :bordered="false" class="shadow-sm">
                <a-statistic title="Active" :value="stats.active" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <CheckCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card :bordered="false" class="shadow-sm">
                <a-statistic title="Inactive" :value="stats.inactive" :value-style="{ color: '#cf1322' }">
                    <template #prefix>
                        <StopOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card :bordered="false" class="shadow-sm">
                <a-statistic title="Revenue" :value="9342" :precision="2" prefix="$" />
            </a-card>
        </div>

        <!-- Data Table -->
        <a-card :bordered="false" class="shadow-sm" title="Company List">
            <a-table :columns="columns" :data-source="companies" :loading="loading" :row-key="record => record.id"
                :pagination="{ pageSize: 5 }">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'status'">
                        <a-tag :color="record.status === 'active' ? 'green' : 'red'">
                            {{ record.status.toUpperCase() }}
                        </a-tag>
                    </template>
                    <template v-if="column.key === 'action'">
                        <a-space>
                            <NuxtLink :to="`/companies/${record.id}`">
                                <a-button type="link">View</a-button>
                            </NuxtLink>
                            <NuxtLink :to="`/companies/${record.id}/edit`">
                                <a-button type="link">Edit</a-button>
                            </NuxtLink>
                            <a-popconfirm title="Are you sure delete this company?" ok-text="Yes" cancel-text="No">
                                <a-button type="link" danger>Delete</a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useCompanyStore } from '../../../stores/company'
import {
    PlusOutlined,
    BankOutlined,
    CheckCircleOutlined,
    StopOutlined
} from '@ant-design/icons-vue'

const store = useCompanyStore()
const companies = computed(() => store.companies)
const loading = computed(() => store.loading)

// Mock stats for now - ideally fetch from store
const stats = computed(() => ({
    total: companies.value.length,
    active: companies.value.filter(c => c.status === 'active').length,
    inactive: companies.value.filter(c => c.status === 'inactive').length
}))

const columns = [
    {
        title: 'Name',
        dataIndex: 'name',
        key: 'name',
        sorter: (a: any, b: any) => a.name.localeCompare(b.name)
    },
    {
        title: 'Address',
        dataIndex: 'address',
        key: 'address',
    },
    {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'Action',
        key: 'action',
    },
];

onMounted(() => {
    store.fetchCompanies()
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
