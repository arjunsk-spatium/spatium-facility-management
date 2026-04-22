<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitors Management</h1>
                <p class="text-gray-600 dark:text-gray-400">Track and manage facility visitors.</p>
            </div>
            <a-button v-if="canAction" type="primary" ghost>
                <template #icon>
                    <ExportOutlined />
                </template>
                Export <span class="hidden sm:inline">Log</span>
            </a-button>
        </div>

        <div v-if="canView">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3 sm:items-center mb-6">
                <!-- Date Range Filter -->
                <a-range-picker v-model:value="dateRange" format="YYYY-MM-DD" :allow-clear="true"
                    class="w-full sm:w-auto" @change="handleFilterChange" />

                <!-- Facility Filter -->
                <a-select v-model:value="selectedFacility" placeholder="All Facilities" allow-clear style="min-width: 180px"
                    class="w-full sm:w-auto" @change="handleFilterChange">
                    <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                        {{ facility.name }}
                    </a-select-option>
                </a-select>

                <!-- Company Filter -->
                <a-select v-model:value="selectedCompany" placeholder="All Companies" allow-clear style="min-width: 180px"
                    class="w-full sm:w-auto" @change="handleFilterChange">
                    <a-select-option v-for="company in companies" :key="company.id" :value="company.id">
                        {{ company.name }}
                    </a-select-option>
                </a-select>

                <!-- Search -->
                <a-input-search v-model:value="searchQuery" placeholder="Search visitors..." allow-clear
                    class="flex-1 sm:max-w-xs" @search="handleFilterChange" />
            </div>

            <VisitorList
                :visitors="visitors"
                :loading="loading"
                :showActions="canAction"
                :pagination="paginationConfig"
                @update-status="handleStatusUpdate"
            />
        </div>

        <div v-else class="text-center py-12 text-gray-500">
            You don't have permission to view visitors.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ExportOutlined } from '@ant-design/icons-vue'
import type { Dayjs } from 'dayjs'

import VisitorList from './VisitorList.vue'
import { useAuthStore } from '../../stores/auth'

const store = useVisitorStore()
const companyStore = useCompanyStore()
const facilityStore = useFacilityStore()
const authStore = useAuthStore()

const { visitors, loading, count, page, pageSize } = storeToRefs(store)

// Permission checks
const canView = computed(() => authStore.hasPermission('visitors-list:view'))
const canAction = computed(() => authStore.hasPermission('visitors-list:action'))

// Filter state
const selectedFacility = ref<string | null>(null)
const selectedCompany = ref<string | null>(null)
const searchQuery = ref('')
const dateRange = ref<[Dayjs, Dayjs] | null>(null)

// Facility and company lists
const facilities = computed(() => facilityStore.facilities)
const companies = computed(() => companyStore.companies)

// Pagination config for table
const paginationConfig = computed(() => ({
    total: count.value,
    current: page.value,
    pageSize: pageSize.value,
    onChange: handlePageChange,
}))

const buildParams = (): any => {
    const params: any = {
        facility_id: selectedFacility.value || undefined,
        company_id: selectedCompany.value || undefined,
        search: searchQuery.value || undefined,
    }

    if (dateRange.value && dateRange.value.length === 2) {
        params.start_date = dateRange.value[0].format('YYYY-MM-DD')
        params.end_date = dateRange.value[1].format('YYYY-MM-DD')
    }

    return params
}

const handleFilterChange = async () => {
    // Reset to page 1 when filters change
    const params = buildParams()
    await store.fetchVisitors({ ...params, page: 1 })
}

const handlePageChange = async (pageNum: number) => {
    const params = buildParams()
    await store.fetchVisitors({ ...params, page: pageNum })
}

const handleStatusUpdate = async (id: string, status: string, frontdeskRemarks?: string) => {
    // Update status in store, passing optional frontdesk_remarks
    await store.updateStatus(id, status, frontdeskRemarks)
}

onMounted(async () => {
    // Fetch all required data
    await Promise.all([
        store.fetchVisitors(),
        facilityStore.fetchFacilities(),
        companyStore.fetchCompanies()
    ])
})
</script>
