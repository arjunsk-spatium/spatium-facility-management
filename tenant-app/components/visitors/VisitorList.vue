<template>
    <div>
        <ResponsiveDataView :data="visitors" :columns="columns" :loading="loading" :mobilePageSize="5" :pagination="pagination">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'photo'">
                    <a-avatar 
                        v-if="record.image_url" 
                        :src="record.image_url" 
                        :size="40" 
                        shape="square"
                        class="cursor-pointer"
                        @click.stop="openImagePreview(record.image_url)"
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
                <template v-else-if="column.key === 'name'">
                    <a 
                        @click="openDetailsModal(record)" 
                        class="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-medium"
                    >
                        {{ record.name }}
                    </a>
                </template>
                <template v-else-if="column.key === 'status'">
                    <a-tag :color="getStatusColor(record.status)">
                        {{ record.status }}
                    </a-tag>
                </template>
                <template v-else-if="column.key === 'visitor_type'">
                    <a-tag :color="record.visitor_type === 'walk_in' ? 'blue' : 'purple'">
                        {{ record.visitor_type === 'walk_in' ? 'Walk-in' : 'Pre-invite' }}
                    </a-tag>
                </template>
                <template v-else-if="column.key === 'actions'">
                    <div v-if="showActions" class="flex gap-2">
                        <a-button v-if="record.status === 'Pending'" size="small" type="primary"
                            @click="openRemarksModal(record.id, 'Approved')">
                            Approve
                        </a-button>
                        <a-button v-if="record.status === 'Pending'" size="small" danger
                            @click="openRemarksModal(record.id, 'Rejected')">
                            Reject
                        </a-button>
                        <a-button v-if="record.status === 'Approved' && !record.check_out_time" size="small"
                            class="!bg-green-500 !text-white !border-green-500"
                            @click="$emit('update-status', record.id, 'Checked Out')">
                            Check Out
                        </a-button>
                        <a-button v-if="canPrintStickerFeature" size="small" type="default"
                            @click="handlePrintSticker(record.id)" :loading="printingId === record.id">
                            Print Sticker
                        </a-button>
                    </div>
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
                            @click.stop="openImagePreview(record.image_url)"
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
                                    <div class="text-sm text-gray-500">{{ record.company_name || record.from_company || '-' }}</div>
                                </div>
                                <div class="flex flex-col items-end gap-1">
                                    <a-tag :color="getStatusColor(record.status)" class="ml-2">{{ record.status }}</a-tag>
                                    <a-tag :color="record.visitor_type === 'walk_in' ? 'blue' : 'purple'" class="ml-2 text-xs">
                                        {{ record.visitor_type === 'walk_in' ? 'Walk-in' : 'Pre-invite' }}
                                    </a-tag>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="space-y-2 text-sm text-gray-600 mb-4">
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Phone:</span>
                            <span>{{ record.phone_number || '-' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Email:</span>
                            <span class="truncate">{{ record.email || '-' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Company:</span>
                            <span>{{ record.company_name || '-' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">From:</span>
                            <span>{{ record.from_company || '-' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Type:</span>
                            <a-tag :color="record.visitor_type === 'walk_in' ? 'blue' : 'purple'" class="m-0">
                                {{ record.visitor_type === 'walk_in' ? 'Walk-in' : 'Pre-invite' }}
                            </a-tag>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Purpose:</span>
                            <span>{{ record.purpose_of_visit }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Facility:</span>
                            <span>{{ record.facility_name }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">Check-in:</span>
                            <span>{{ record.check_in_time ? formatDate(record.check_in_time) : '-' }}</span>
                        </div>
                        <div class="flex gap-2">
                            <span class="font-medium w-20">On Premises:</span>
                            <a-tag :color="record.is_on_premises ? 'green' : 'default'">
                                {{ record.is_on_premises ? 'Yes' : 'No' }}
                            </a-tag>
                        </div>
                    </div>

                    <div class="flex gap-2 border-t pt-3">
                        <a-button v-if="record.status === 'Pending'" size="small" type="primary" block
                            @click="openRemarksModal(record.id, 'Approved')">
                            Approve
                        </a-button>
                        <a-button v-if="record.status === 'Pending'" size="small" danger block
                            @click="openRemarksModal(record.id, 'Rejected')">
                            Reject
                        </a-button>
                        <a-button v-if="record.status === 'Approved' && !record.check_out_time" size="small"
                            class="!bg-green-500 !text-white !border-green-500" block
                            @click="$emit('update-status', record.id, 'Checked Out')">
                            Check Out
                        </a-button>
                        <a-button v-if="canPrintStickerFeature" size="small" type="default" block
                            @click="handlePrintSticker(record.id)" :loading="printingId === record.id">
                            Print Sticker
                        </a-button>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <VisitorDetailsModal v-model:open="showDetailsModal" :visitor="selectedVisitor" />

        <ImagePreviewModal v-model:open="showImagePreview" :src="previewImageUrl" alt="Visitor Photo" />

        <!-- Remarks Modal -->
        <a-modal
            v-model:open="showRemarksModal"
            :title="remarksAction === 'Approved' ? 'Approve Visitor' : 'Reject Visitor'"
            :ok-text="remarksAction === 'Approved' ? 'Approve' : 'Reject'"
            :ok-button-props="{ type: remarksAction === 'Approved' ? 'primary' : 'primary', danger: remarksAction === 'Rejected' }"
            cancel-text="Cancel"
            @ok="submitStatusUpdate"
            @cancel="cancelRemarksModal"
        >
            <div class="py-2">
                <p class="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    Add a remark for this {{ remarksAction === 'Approved' ? 'approval' : 'rejection' }} (optional).
                </p>
                <a-textarea
                    v-model:value="frontdeskRemarks"
                    placeholder="Enter frontdesk remarks..."
                    :auto-size="{ minRows: 3, maxRows: 5 }"
                    :maxlength="500"
                    show-count
                />
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import ResponsiveDataView from '../ResponsiveDataView.vue'
import VisitorDetailsModal from './VisitorDetailsModal.vue'
import ImagePreviewModal from './ImagePreviewModal.vue'
import { useVisitorStore, type Visitor } from '../../stores/visitor'
import { useAuthStore } from '../../stores/auth'
import { message } from 'ant-design-vue'

const authStore = useAuthStore()

const canPrintStickerFeature = computed(() => {
    return authStore.permissions.some(p => p.includes('visitor_sticker_print'))
})

const printingId = ref<string | null>(null)

const handlePrintSticker = async (visitorId: string) => {
    printingId.value = visitorId
    try {
        const config = useRuntimeConfig()
        const tenantId = useCookie('tenant_id').value || localStorage.getItem('tenant_id')
        
        const response = await fetch(`${config.public.apiBaseUrl}/api/portal/visitors/client/sticker/print/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authStore.token}`,
                ...(tenantId ? { 'X-TENANT-ID': tenantId } : {})
            },
            body: JSON.stringify({ visitor_id: visitorId })
        })
        
        if (!response.ok) throw new Error('Failed to generate sticker')
        
        const contentType = response.headers.get('content-type')
        if (contentType && contentType.includes('application/json')) {
            const result = await response.json()
            if (result.data && result.data.url) {
                window.open(result.data.url, '_blank')
            } else if (result.data && result.data.base64) {
                 const pdfWindow = window.open("")
                 pdfWindow?.document.write("<iframe width='100%' height='100%' src='data:application/pdf;base64, " + encodeURI(result.data.base64) + "'></iframe>")
            } else if (result.url) {
                window.open(result.url, '_blank')
            } else {
                 throw new Error('Invalid response format')
            }
            return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        
        const pdfWindow = window.open(url, '_blank')
        if (pdfWindow) {
            setTimeout(() => URL.revokeObjectURL(url), 10000)
        }
    } catch (error) {
        console.error(error)
        message.error('Failed to print sticker')
    } finally {
        printingId.value = null
    }
}

const props = defineProps<{
    visitors: Visitor[],
    loading: boolean,
    showActions?: boolean
    pagination?: any
}>()

const emit = defineEmits<{
    'update-status': [id: string, status: string, frontdeskRemarks?: string]
}>()

// Remarks modal state
const showRemarksModal = ref(false)
const remarksTargetId = ref('')
const remarksAction = ref<'Approved' | 'Rejected'>('Approved')
const frontdeskRemarks = ref('')

const openRemarksModal = (id: string, action: 'Approved' | 'Rejected') => {
    remarksTargetId.value = id
    remarksAction.value = action
    frontdeskRemarks.value = ''
    showRemarksModal.value = true
}

const submitStatusUpdate = () => {
    emit('update-status', remarksTargetId.value, remarksAction.value, frontdeskRemarks.value || undefined)
    showRemarksModal.value = false
}

const cancelRemarksModal = () => {
    showRemarksModal.value = false
    frontdeskRemarks.value = ''
}

const baseColumns = [
    { title: '', key: 'photo', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Company', dataIndex: 'company_name', key: 'company_name' },
    { title: 'From', dataIndex: 'from_company', key: 'from_company' },
    { title: 'Type', key: 'visitor_type' },
    { title: 'Purpose', dataIndex: 'purpose_of_visit', key: 'purpose_of_visit' },
    { title: 'Facility', dataIndex: 'facility_name', key: 'facility_name' },
    { title: 'Status', key: 'status' },
]

const columns = computed(() => {
    if (props.showActions) {
        return [...baseColumns, { title: 'Actions', key: 'actions', width: 180 }]
    }
    return baseColumns
})

const showDetailsModal = ref(false)
const selectedVisitor = ref<Visitor | null>(null)
const showImagePreview = ref(false)
const previewImageUrl = ref('')

const openDetailsModal = (visitor: Visitor) => {
    selectedVisitor.value = visitor
    showDetailsModal.value = true
}

const openImagePreview = (url: string) => {
    previewImageUrl.value = url
    showImagePreview.value = true
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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Approved': return 'green'
        case 'Pending': return 'orange'
        case 'Rejected': return 'red'
        default: return 'default'
    }
}

const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}
</script>
