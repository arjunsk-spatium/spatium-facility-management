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
            <a-select v-model:value="selectedFacility" placeholder="All Facilities" allow-clear style="min-width: 180px"
                class="w-full sm:w-auto" @change="handleFacilityChange">
                <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                    {{ facility.name }}
                </a-select-option>
            </a-select>

            <a-button 
                :disabled="!selectedFacility"
                @click="generateQR" 
                :loading="generatingQR"
                title="Generate QR Code"
                type="default">
                <template #icon><QrcodeOutlined /></template>
                <span class="hidden sm:inline">QR Code</span>
            </a-button>

            <a-select v-model:value="selectedStatus" placeholder="All Status" allow-clear style="min-width: 150px"
                class="w-full sm:w-auto">
                <a-select-option value="Pending">Pending</a-select-option>
                <a-select-option value="Approved">Approved</a-select-option>
                <a-select-option value="Rejected">Rejected</a-select-option>
            </a-select>

            <a-input-search v-model:value="searchQuery" placeholder="Search visitors..." allow-clear
                class="flex-1 sm:max-w-xs" />
        </div>

        <!-- Visitor Table/Cards using ResponsiveDataView -->
        <ResponsiveDataView :columns="columns" :data="filteredVisitors" :loading="loading" row-key="id">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'photo'">
                    <a-avatar 
                        v-if="record.image_url" 
                        :src="record.image_url" 
                        :size="40" 
                        shape="square"
                        class="cursor-pointer"
                        @click="openDetailsModal(record)"
                    />
                    <a-avatar 
                        v-else 
                        :size="40" 
                        shape="square"
                        class="bg-gradient-to-br from-blue-500 to-blue-600 cursor-pointer"
                        @click="openDetailsModal(record)"
                    >
                        <span class="text-white font-bold">{{ getInitials(record.name) }}</span>
                    </a-avatar>
                </template>
                
                <template v-else-if="column.key === 'visitor'">
                    <div>
                        <a 
                            @click="openDetailsModal(record)" 
                            class="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                            {{ record.name }}
                        </a>
                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.phone_number }}</p>
                    </div>
                </template>

                <template v-if="column.key === 'datetime'">
                    <div>{{ formatDate(record.appointment_time || record.created_at) }}</div>
                    <div class="text-gray-400 text-xs">{{ formatTime(record.appointment_time) }}</div>
                </template>

                <template v-if="column.key === 'status'">
                    <a-tag :color="getStatusColor(record.status)">
                        {{ record.status }}
                    </a-tag>
                </template>

                <template v-if="column.key === 'passcode'">
                    <span class="font-mono">{{ record.visitor_pass_url ? 'Generated' : '-' }}</span>
                </template>
            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex gap-3 items-start mb-3">
                        <!-- Profile Picture -->
                        <a-avatar 
                            v-if="record.image_url" 
                            :src="record.image_url" 
                            :size="48" 
                            shape="square"
                            class="cursor-pointer flex-shrink-0"
                            @click="openDetailsModal(record)"
                        />
                        <a-avatar 
                            v-else 
                            :size="48" 
                            shape="square"
                            class="bg-gradient-to-br from-blue-500 to-blue-600 cursor-pointer flex-shrink-0"
                            @click="openDetailsModal(record)"
                        >
                            <span class="text-white font-bold">{{ getInitials(record.name) }}</span>
                        </a-avatar>
                        
                        <!-- Info -->
                        <div class="flex-1 min-w-0">
                            <div class="flex justify-between items-start">
                                <div class="flex-1 min-w-0">
                                    <a 
                                        @click="openDetailsModal(record)" 
                                        class="font-bold text-base text-blue-600 dark:text-blue-400 hover:underline cursor-pointer block truncate"
                                    >
                                        {{ record.name }}
                                    </a>
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.phone_number }}</p>
                                </div>
                                <a-tag :color="getStatusColor(record.status)" class="ml-2 flex-shrink-0">
                                    {{ record.status }}
                                </a-tag>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm mb-3">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Date</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ formatDate(record.appointment_time || record.created_at) }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Purpose</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.purpose_of_visit }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Facility</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.facility_name }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">From</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.from_company || '-' }}</p>
                        </div>
                    </div>

                    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-400">Created: {{ formatDate(record.created_at) }}</span>
                        </div>
                        <span v-if="record.visitor_pass_url" class="font-mono text-sm text-gray-600 dark:text-gray-300">
                            Pass Generated
                        </span>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <VisitorDetailsModal v-model:open="showDetailsModal" :visitor="selectedVisitor" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusOutlined, BarChartOutlined, QrcodeOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'
import VisitorDetailsModal from '../../../../components/visitors/VisitorDetailsModal.vue'
import type { SpocVisitor } from '../../../../stores/spoc'
import { message } from 'ant-design-vue'
import { useAuthStore } from '../../../../stores/auth'
import { useCompanyStore } from '../../../../stores/company'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const authStore = useAuthStore()
const companyStore = useCompanyStore()
const { visitors, loading, facilities } = storeToRefs(store)

const selectedStatus = ref<string | null>(null)
const selectedFacility = ref<string | null>(null)
const searchQuery = ref('')
const generatingQR = ref(false)

const handleFacilityChange = () => {
    store.fetchVisitors(selectedFacility.value || undefined)
}

const generateQR = async () => {
    if (!selectedFacility.value) return
    const facility = facilities.value.find(f => f.id === selectedFacility.value)
    if (!facility) return
    
    generatingQR.value = true
    try {
        const companyId = facility.companyId || authStore.user?.company_id || authStore.user?.tenant_id || ''
        const companyName = authStore.user?.company_name || authStore.userFullName || 'Company'
        await companyStore.generateCompanyQRCodeAction(companyId, companyName, facility.id)
        message.success('QR Code generated successfully')
    } catch (err) {
        message.error('Failed to generate QR Code')
    } finally {
        generatingQR.value = false
    }
}

const showDetailsModal = ref(false)
const selectedVisitor = ref<SpocVisitor | null>(null)

// Table columns
const columns = [
    { title: '', key: 'photo', width: 60 },
    { title: 'Visitor', key: 'visitor', dataIndex: 'name' },
    { title: 'Date & Time', key: 'datetime', dataIndex: 'appointment_time', width: 150 },
    { title: 'Purpose', dataIndex: 'purpose_of_visit', key: 'purpose' },
    { title: 'Facility', dataIndex: 'facility_name', key: 'facility' },
    { title: 'Status', key: 'status', dataIndex: 'status', width: 120 },
    { title: 'Pass', key: 'passcode', dataIndex: 'visitor_pass_url', width: 100 }
]

const openDetailsModal = (visitor: SpocVisitor) => {
    selectedVisitor.value = visitor
    showDetailsModal.value = true
}

const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ').filter(p => p.length > 0);
    if (parts.length === 0) return '?';
    if (parts.length === 1) {
        const firstPart = parts[0];
        return firstPart ? firstPart.substring(0, 2).toUpperCase() : '?';
    }
    const firstPart = parts[0];
    const lastPart = parts[parts.length - 1];
    const firstInitial = firstPart?.[0] || '';
    const lastInitial = lastPart?.[0] || '';
    return (firstInitial + lastInitial).toUpperCase() || '?';
}

const filteredVisitors = computed(() => {
    let result = visitors.value

    if (selectedStatus.value) {
        const statusMap: Record<string, string> = {
            'pending': 'Pending',
            'approved': 'Approved',
            'checked_in': 'Approved',
            'checked_out': 'Approved',
            'rejected': 'Rejected'
        }
        result = result.filter(v => statusMap[v.status] === selectedStatus.value)
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(v =>
            v.name.toLowerCase().includes(query) ||
            v.phone_number?.includes(query) ||
            v.facility_name?.toLowerCase().includes(query)
        )
    }

    return result
})

const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

const formatTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved': return 'green'
        case 'Pending': return 'orange'
        case 'Rejected': return 'red'
        default: return 'default'
    }
}

onMounted(async () => {
    await store.fetchFacilities()
    store.fetchVisitors()
})
</script>
