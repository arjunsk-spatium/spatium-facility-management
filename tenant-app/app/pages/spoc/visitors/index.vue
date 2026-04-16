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
                <template v-if="column.key === 'photo'">
                    <a-avatar 
                        v-if="record.photoUrl" 
                        :src="record.photoUrl" 
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
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex gap-3 items-start mb-3">
                        <!-- Profile Picture -->
                        <a-avatar 
                            v-if="record.photoUrl" 
                            :src="record.photoUrl" 
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
                                    <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.phone }}</p>
                                </div>
                                <span :class="getStatusClass(record.status)" class="px-2 py-1 text-xs font-medium rounded-full ml-2 flex-shrink-0">
                                    {{ getStatusLabel(record.status) }}
                                </span>
                            </div>
                        </div>
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

        <VisitorDetailsModal v-model:open="showDetailsModal" :visitor="selectedVisitor" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { PlusOutlined, BarChartOutlined, QrcodeOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'
import VisitorDetailsModal from '../../../../components/visitors/VisitorDetailsModal.vue'
import type { Visitor } from '../../../../composables/visitorService'
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
const selectedVisitor = ref<Visitor | null>(null)

// Table columns
const columns = [
    { title: '', key: 'photo', width: 60 },
    { title: 'Visitor', key: 'visitor', dataIndex: 'name' },
    { title: 'Date & Time', key: 'datetime', dataIndex: 'visitDate', width: 150 },
    { title: 'Purpose', dataIndex: 'purpose', key: 'purpose' },
    { title: 'Host', dataIndex: 'hostName', key: 'host' },
    { title: 'Status', key: 'status', dataIndex: 'status', width: 120 },
    { title: 'Passcode', key: 'passcode', dataIndex: 'passcode', width: 100 }
]

const openDetailsModal = (visitor: Visitor) => {
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

onMounted(async () => {
    await store.fetchFacilities()
    store.fetchVisitors()
})
</script>
