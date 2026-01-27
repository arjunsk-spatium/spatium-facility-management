<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitors Management</h1>
                <p class="text-gray-600 dark:text-gray-400">Track and manage facility visitors.</p>
            </div>
            <a-button type="primary" ghost>
                <template #icon>
                    <ExportOutlined />
                </template>
                Export <span class="hidden sm:inline">Log</span>
            </a-button>
        </div>

        <!-- Filters -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
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

        <VisitorList :visitors="filteredVisitors" :loading="loading" @update-status="handleStatusUpdate" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ExportOutlined } from '@ant-design/icons-vue'

import VisitorList from './VisitorList.vue'

const store = useVisitorStore()
const companyStore = useCompanyStore()
const facilityStore = useFacilityStore()

const { visitors, loading } = storeToRefs(store)

// Filter state
const selectedFacility = ref<number | null>(null)
const selectedCompany = ref<number | null>(null)
const searchQuery = ref('')

// Facility and company lists
const facilities = computed(() => facilityStore.facilities)
const companies = computed(() => companyStore.companies)

// Filtered visitors
const filteredVisitors = computed(() => {
    let result = visitors.value

    // Filter by facility
    if (selectedFacility.value) {
        result = result.filter(v => v.facilityId === selectedFacility.value)
    }

    // Filter by company
    if (selectedCompany.value) {
        result = result.filter(v => v.companyId === selectedCompany.value)
    }

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(v =>
            v.name.toLowerCase().includes(query) ||
            v.company?.toLowerCase().includes(query) ||
            v.hostName?.toLowerCase().includes(query) ||
            v.visitPurpose?.toLowerCase().includes(query)
        )
    }

    return result
})

const handleFilterChange = () => {
    // Filters are reactive, no need for additional action
}

const handleStatusUpdate = async (id: string, status: any) => {
    await store.updateStatus(id, status)
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
