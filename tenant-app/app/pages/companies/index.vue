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
                <a-statistic title="Revenue" :value="9342" :precision="2" prefix="₹" />
            </a-card>
        </div>

        <!-- Data Table -->
        <a-card :bordered="false" class="shadow-sm">
            <!-- Table Header with Search and Download -->
            <template #title>
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <span class="text-lg font-semibold">Company List</span>
                    <div class="flex items-center gap-3">
                        <a-input-search v-model:value="searchText" placeholder="Search companies..."
                            style="width: 250px" allow-clear />
                        <a-button @click="downloadExcel" :loading="downloading">
                            <template #icon>
                                <DownloadOutlined />
                            </template>
                            Export
                        </a-button>
                    </div>
                </div>
            </template>

            <a-table :columns="columns" :data-source="filteredCompanies" :loading="loading"
                :row-key="(record: any) => record.id" :pagination="paginationConfig" :scroll="{ x: 900 }">
                <template #bodyCell="{ column, record }">
                    <!-- Name column with link to view details -->
                    <template v-if="column.key === 'name'">
                        <NuxtLink :to="`/companies/${record.id}`"
                            class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                            {{ record.name }}
                        </NuxtLink>
                    </template>
                    <!-- Action column with Edit and Delete only -->
                    <template v-if="column.key === 'action'">
                        <a-space>
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
import { ref, onMounted, computed } from 'vue'
import { useCompanyStore } from '../../../stores/company'
import {
    PlusOutlined,
    BankOutlined,
    CheckCircleOutlined,
    StopOutlined,
    DownloadOutlined
} from '@ant-design/icons-vue'

const store = useCompanyStore()
const companies = computed(() => store.companies)
const loading = computed(() => store.loading)

// Search functionality
const searchText = ref('')
const downloading = ref(false)

// Filtered companies based on search
const filteredCompanies = computed(() => {
    if (!searchText.value) return companies.value
    const search = searchText.value.toLowerCase()
    return companies.value.filter(company =>
        company.name.toLowerCase().includes(search) ||
        company.spoc_name.toLowerCase().includes(search) ||
        company.spoc_email.toLowerCase().includes(search) ||
        company.spoc_phone.toLowerCase().includes(search) ||
        (company.facility && company.facility.toLowerCase().includes(search))
    )
})

// Stats for companies
const stats = computed(() => ({
    total: companies.value.length,
    active: companies.value.length, // All companies are active
    inactive: 0
}))

// Download as Excel
const downloadExcel = async () => {
    downloading.value = true
    try {
        // Dynamic imports for client-side only
        const XLSX = await import('xlsx')

        const data = filteredCompanies.value.map(company => ({
            'Company Name': company.name,
            'Address': company.address,
            'SPOC Name': company.spoc_name,
            'SPOC Email': company.spoc_email,
            'SPOC Phone': company.spoc_phone,
            'GSTIN': company.gstin || '',
            'Facility': company.facility || ''
        }))

        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies')

        // Generate filename with date-time
        const now = new Date()
        const dateTime = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
        const fileName = `companies-${dateTime}.xlsx`

        // Use built-in download which handles browser compatibility better
        XLSX.writeFile(workbook, fileName)
    } catch (error) {
        console.error('Error exporting to Excel:', error)
    } finally {
        downloading.value = false
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
        title: 'SPOC Name',
        dataIndex: 'spoc_name',
        key: 'spoc_name',
    },
    {
        title: 'SPOC Email',
        dataIndex: 'spoc_email',
        key: 'spoc_email',
    },
    {
        title: 'SPOC Phone',
        dataIndex: 'spoc_phone',
        key: 'spoc_phone',
    },
    {
        title: 'Facility',
        dataIndex: 'facility',
        key: 'facility',
    },
    {
        title: 'Action',
        key: 'action',
    },
];

// Pagination configuration
const paginationConfig = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} companies`,
}))

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
