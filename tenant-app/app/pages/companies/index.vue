<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Companies</h1>
            <NuxtLink to="/companies/create">
                <a-button type="primary" size="medium">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <hide class="hidden sm:inline">Company</hide>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Insights Section -->
        <!-- Insights Section -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Companies" :value="stats.total" :value-style="{ color: '#3f8600' }">
                    <template #prefix>
                        <BankOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Active" :value="stats.active" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <CheckCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Inactive" :value="stats.inactive" :value-style="{ color: '#cf1322' }">
                    <template #prefix>
                        <StopOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Revenue" :value="9342" :precision="2" prefix="₹" />
            </a-card>
        </div>

        <!-- Search and Actions Header (Visible in both views) -->
        <!-- Search and Actions Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:mb-4 md:px-0">
            <span class="text-lg font-semibold">Company List</span>
            <div class="flex items-center gap-3">
                <a-input-search v-model:value="searchText" placeholder="Search companies..." style="width: 250px"
                    allow-clear />
                <a-button @click="downloadExcel" :loading="downloading">
                    <template #icon>
                        <DownloadOutlined />
                    </template>
                    <span class="hidden sm:inline">Export</span>
                </a-button>
            </div>
        </div>

        <ResponsiveDataView :columns="columns" :data="filteredCompanies" :loading="loading"
            :row-key="(record: any) => record.id" :pagination="paginationConfig">
            <!-- Desktop Table Cells -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'name'">
                    <NuxtLink :to="`/companies/${record.id}`"
                        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        {{ record.name }}
                    </NuxtLink>
                </template>
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

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record: company }">
                <a-card class="mb-4">
                    <div class="flex flex-col gap-3">
                        <!-- Header: Name -->
                        <div class="flex justify-between items-start">
                            <NuxtLink :to="`/companies/${company.id}`"
                                class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                {{ company.name }}
                            </NuxtLink>
                            <span
                                class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full dark:bg-green-900 dark:text-green-100">
                                {{ company.status === 'active' ? 'Active' : 'Inactive' }}
                            </span>
                        </div>

                        <!-- Details -->
                        <div class="grid grid-cols-1 gap-2 text-sm">
                            <div class="flex flex-col">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider">Address</span>
                                <span class="text-neutral-900 dark:text-neutral-200">{{ company.contacts[0]?.address }}</span>
                            </div>
                            <!-- Contact Details Section -->
                            <div class="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                <span
                                    class="text-neutral-500 dark:text-neutral-400 text-xs uppercase tracking-wider block mb-1">Contact
                                    Person</span>
                                <div
                                    class="flex flex-col gap-1 pl-2 border-l-2 border-primary-200 dark:border-primary-800">
                                    <span class="font-medium">{{ company.contacts[0]?.contact_name }}</span>
                                    <span class="text-neutral-600 dark:text-neutral-400">{{ company.contacts[0]?.email
                                        }}</span>
                                    <span class="text-neutral-600 dark:text-neutral-400">{{ company.contacts[0]?.phone
                                        }}</span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions -->
                        <div
                            class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <NuxtLink :to="`/companies/${company.id}/edit`">
                                <a-button type="default" size="small">Edit</a-button>
                            </NuxtLink>
                            <a-popconfirm title="Are you sure delete this company?" ok-text="Yes" cancel-text="No">
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
import { ref, onMounted, computed, watch } from 'vue'
import { useCompanyStore } from '../../../stores/company'
import {
    PlusOutlined,
    BankOutlined,
    CheckCircleOutlined,
    StopOutlined,
    DownloadOutlined
} from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue'

definePageMeta({
    middleware: 'auth'
})

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
        company.contacts[0]?.contact_name?.toLowerCase().includes(search) ||
        company.contacts[0]?.email?.toLowerCase().includes(search) ||
        company.contacts[0]?.phone?.toLowerCase().includes(search)
    )
})

// Stats for companies
const stats = computed(() => ({
    total: companies.value.length,
    active: companies.value.filter(c => c.status === 'active').length,
    inactive: companies.value.filter(c => c.status === 'inactive').length
}))

// Download as Excel
const downloadExcel = async () => {
    downloading.value = true
    try {
        // Dynamic imports for client-side only
        const XLSX = await import('xlsx')

        const data = filteredCompanies.value.map(company => ({
            'Company Name': company.name,
            'Status': company.status,
            'Contact Name': company.contacts.contact_name,
            'Email': company.contacts.email,
            'Address': company.contacts.address,
            'Phone': company.contacts.phone,
            'GSTIN': company.contacts.gstin || ''
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
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
    },
    {
        title: 'Contact Name',
        key: 'contact_name',
        customRender: ({ record }: { record: any }) => record.contacts[0]?.contact_name || '-'
    },
    {
        title: 'Email',
        key: 'email',
        customRender: ({ record }: { record: any }) => record.contacts[0]?.email || '-'
    },
    {
        title: 'Phone',
        key: 'phone',
        customRender: ({ record }: { record: any }) => record.contacts[0]?.phone || '-'
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
