<template>
    <div class="max-w-5xl mx-auto space-y-6">
        <!-- Back Button -->
        <a-button type="link" @click="router.push('/privacy-requests')">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Back to Privacy Requests
        </a-button>

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <!-- Request Detail -->
        <template v-else-if="request">
            <!-- Header Card -->
            <a-card>
                <div class="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 mb-2">
                            <a-tag :color="getRequestTypeColor(request.request_type)">
                                {{ request.request_type_display || formatRequestType(request.request_type) }}
                            </a-tag>
                            <a-tag :color="getStatusColor(request.status)">
                                {{ request.status_display || formatStatus(request.status) }}
                            </a-tag>
                            <span v-if="request.is_overdue" class="text-danger-500 text-sm font-medium">Overdue</span>
                        </div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ request.request_reference }}</h1>
                        <p class="text-neutral-500 mt-1">Submitted {{ formatDateTime(request.submitted_at) }}</p>
                    </div>

                    <a-space wrap>
                        <a-button v-if="canReview" @click="openModal('review')">
                            <template #icon>
                                <EyeOutlined />
                            </template>
                            Review
                        </a-button>
                        <a-button v-if="canApprove" type="primary" @click="openModal('approve')">
                            <template #icon>
                                <CheckOutlined />
                            </template>
                            Approve
                        </a-button>
                        <a-button v-if="canReject" danger @click="openModal('reject')">
                            <template #icon>
                                <CloseOutlined />
                            </template>
                            Reject
                        </a-button>
                        <a-button v-if="canComplete" type="primary" @click="openModal('complete')">
                            <template #icon>
                                <CheckCircleOutlined />
                            </template>
                            Complete
                        </a-button>
                        <a-button v-if="canCreateTasks" @click="openModal('tasks')">
                            <template #icon>
                                <SafetyOutlined />
                            </template>
                            Create Tasks
                        </a-button>
                        <a-button v-if="canExport" @click="openModal('export')">
                            <template #icon>
                                <ExportOutlined />
                            </template>
                            Export
                        </a-button>
                        <a-button @click="openModal('assign')">
                            <template #icon>
                                <UserOutlined />
                            </template>
                            Assign
                        </a-button>
                    </a-space>
                </div>

                <a-divider />

                <p v-if="request.description" class="text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">
                    {{ request.description }}
                </p>

                <a-card class="bg-neutral-50 dark:bg-neutral-800 mt-4">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span class="text-neutral-500">Tenant:</span>
                            <span class="ml-2 font-medium">{{ tenantName(request.tenant_id) }}</span>
                        </div>
                        <div>
                            <span class="text-neutral-500">Requested By:</span>
                            <span class="ml-2 font-medium">{{ request.requested_by_id }}</span>
                        </div>
                        <div>
                            <span class="text-neutral-500">Assigned To:</span>
                            <span class="ml-2 font-medium">{{ request.assigned_to_id || 'Unassigned' }}</span>
                        </div>
                        <div>
                            <span class="text-neutral-500">Due Date:</span>
                            <span class="ml-2 font-medium" :class="{ 'text-danger-500': request.is_overdue }">
                                {{ formatDate(request.due_date) }}
                            </span>
                        </div>
                        <div v-if="request.legal_basis_display">
                            <span class="text-neutral-500">Legal Basis:</span>
                            <span class="ml-2 font-medium">{{ request.legal_basis_display }}</span>
                        </div>
                        <div v-if="request.verification_status_display">
                            <span class="text-neutral-500">Verification:</span>
                            <span class="ml-2 font-medium">{{ request.verification_status_display }}</span>
                        </div>
                        <div v-if="request.admin_notes">
                            <span class="text-neutral-500">Admin Notes:</span>
                            <span class="ml-2 font-medium">{{ request.admin_notes }}</span>
                        </div>
                        <div v-if="request.rejection_reason">
                            <span class="text-neutral-500">Rejection Reason:</span>
                            <span class="ml-2 font-medium">{{ request.rejection_reason }}</span>
                        </div>
                    </div>
                </a-card>
            </a-card>

            <!-- Audit Logs -->
            <a-card title="Audit Timeline">
                <a-timeline v-if="request.audit_logs && request.audit_logs.length">
                    <a-timeline-item v-for="log in request.audit_logs" :key="log.id">
                        <div class="flex flex-col sm:flex-row sm:justify-between gap-1">
                            <span class="font-medium">{{ log.action }}</span>
                            <span class="text-neutral-500 text-sm">{{ formatDateTime(log.created_at) }}</span>
                        </div>
                        <div v-if="log.previous_status || log.new_status" class="text-sm text-neutral-600 dark:text-neutral-300">
                            <span v-if="log.previous_status">{{ log.previous_status }}</span>
                            <span v-if="log.previous_status && log.new_status" class="mx-1">→</span>
                            <span v-if="log.new_status">{{ log.new_status }}</span>
                        </div>
                        <div v-if="log.metadata && Object.keys(log.metadata).length" class="text-sm text-neutral-500 mt-1">
                            {{ JSON.stringify(log.metadata) }}
                        </div>
                    </a-timeline-item>
                </a-timeline>
                <a-empty v-else description="No audit logs available" />
            </a-card>
        </template>

        <!-- Not Found -->
        <a-card v-else class="text-center py-12">
            <a-empty description="Privacy request not found" />
        </a-card>

        <!-- Action Modal -->
        <a-modal v-model:open="modalVisible" :title="modalTitle" :confirm-loading="store.loading" @ok="handleModalOk"
            @cancel="closeModal">
            <a-form layout="vertical">
                <a-form-item v-if="modalAction === 'review'" label="Notes">
                    <a-textarea v-model:value="form.notes" rows="3" placeholder="Add review notes..." />
                </a-form-item>

                <a-form-item v-if="modalAction === 'approve'" label="Admin Notes">
                    <a-textarea v-model:value="form.admin_notes" rows="2" placeholder="Identity confirmation details..." />
                </a-form-item>
                <a-form-item v-if="modalAction === 'approve'" label="Notes">
                    <a-textarea v-model:value="form.notes" rows="2" placeholder="Approval notes..." />
                </a-form-item>

                <a-form-item v-if="modalAction === 'reject'" label="Rejection Reason" required>
                    <a-textarea v-model:value="form.rejection_reason" rows="2" placeholder="Reason for rejection..." />
                </a-form-item>
                <a-form-item v-if="modalAction === 'reject'" label="Notes">
                    <a-textarea v-model:value="form.notes" rows="2" placeholder="Additional notes..." />
                </a-form-item>

                <a-form-item v-if="modalAction === 'complete'" label="Resolution Notes">
                    <a-textarea v-model:value="form.resolution_notes" rows="3" placeholder="How was this request resolved?" />
                </a-form-item>
                <a-form-item v-if="modalAction === 'complete'" label="Notes">
                    <a-textarea v-model:value="form.notes" rows="2" placeholder="Additional notes..." />
                </a-form-item>

                <a-form-item v-if="modalAction === 'assign'" label="Assignee ID" required>
                    <a-input v-model:value="form.assignee_id" placeholder="Enter user ID..." />
                </a-form-item>

                <template v-if="modalAction === 'tasks'">
                    <a-form-item label="Task Types">
                        <a-checkbox-group v-model:value="form.task_types" :options="taskTypeOptions" />
                    </a-form-item>
                    <a-form-item v-if="request?.request_type === 'withdraw_consent'" label="Consent Types">
                        <a-checkbox-group v-model:value="form.consent_type_codes" :options="consentTypeOptions" />
                    </a-form-item>
                </template>

                <p v-if="modalAction === 'export'">
                    This will trigger a data export for this request. You will be notified when the file is ready.
                </p>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
    ArrowLeftOutlined,
    EyeOutlined,
    CheckOutlined,
    CloseOutlined,
    CheckCircleOutlined,
    SafetyOutlined,
    ExportOutlined,
    UserOutlined,
} from '@ant-design/icons-vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const store = usePrivacyRequestStore()
const tenantStore = useTenantStore()

const request = computed(() => store.currentRequest)

const terminalStatuses = ['rejected', 'completed', 'cancelled']

const canReview = computed(() => request.value?.status === 'pending')
const canApprove = computed(() => request.value?.status === 'under_review')
const canReject = computed(() => request.value && !terminalStatuses.includes(request.value.status))
const canComplete = computed(() => request.value && !terminalStatuses.includes(request.value.status))
const canCreateTasks = computed(() => request.value && !terminalStatuses.includes(request.value.status))
const canExport = computed(() => request.value?.request_type === 'access')

const modalVisible = ref(false)
const modalAction = ref<string>('')

const form = ref({
    notes: '',
    admin_notes: '',
    rejection_reason: '',
    resolution_notes: '',
    assignee_id: '',
    task_types: [] as string[],
    consent_type_codes: [] as string[],
})

const taskTypeOptions = [
    { label: 'Update Email', value: 'update_email' },
    { label: 'Update Phone Number', value: 'update_phone_number' },
    { label: 'Erase Personal Data', value: 'erase_personal_data' },
    { label: 'Withdraw Consent', value: 'withdraw_consent' },
    { label: 'Update Profile', value: 'update_profile' },
]

const consentTypeOptions = [
    { label: 'Terms of Service', value: 'TERMS_OF_SERVICE' },
    { label: 'Privacy Policy', value: 'PRIVACY_POLICY' },
    { label: 'Marketing', value: 'MARKETING' },
]

const modalTitle = computed(() => {
    const titles: Record<string, string> = {
        review: 'Move to Under Review',
        approve: 'Approve Request',
        reject: 'Reject Request',
        complete: 'Complete Request',
        assign: 'Assign Request',
        tasks: 'Create Verification Tasks',
        export: 'Export Data',
    }
    return titles[modalAction.value] || 'Action'
})

const openModal = (action: string) => {
    modalAction.value = action
    form.value = {
        notes: '',
        admin_notes: '',
        rejection_reason: '',
        resolution_notes: '',
        assignee_id: '',
        task_types: defaultTaskTypes(),
        consent_type_codes: ['TERMS_OF_SERVICE', 'PRIVACY_POLICY'],
    }
    modalVisible.value = true
}

const defaultTaskTypes = () => {
    const type = request.value?.request_type
    if (type === 'erasure') return ['erase_personal_data']
    if (type === 'withdraw_consent') return ['withdraw_consent']
    if (type === 'access') return ['update_profile']
    if (type === 'rectification') return ['update_email', 'update_phone_number']
    return []
}

const closeModal = () => {
    modalVisible.value = false
    modalAction.value = ''
}

const handleModalOk = async () => {
    const id = route.params.id as string

    try {
        if (modalAction.value === 'review') {
            await store.reviewRequest(id, { notes: form.value.notes })
            message.success('Request moved to under review')
        } else if (modalAction.value === 'approve') {
            await store.approveRequest(id, {
                admin_notes: form.value.admin_notes,
                notes: form.value.notes,
            })
            message.success('Request approved')
        } else if (modalAction.value === 'reject') {
            await store.rejectRequest(id, {
                rejection_reason: form.value.rejection_reason,
                notes: form.value.notes,
            })
            message.success('Request rejected')
        } else if (modalAction.value === 'complete') {
            await store.completeRequest(id, {
                resolution_notes: form.value.resolution_notes,
                notes: form.value.notes,
            })
            message.success('Request completed')
        } else if (modalAction.value === 'assign') {
            await store.assignRequest(id, { assignee_id: form.value.assignee_id })
            message.success('Request assigned')
        } else if (modalAction.value === 'tasks') {
            await store.createTasks({
                privacy_request_id: id,
                task_types: form.value.task_types,
                consent_type_codes: form.value.consent_type_codes.length
                    ? form.value.consent_type_codes
                    : undefined,
            })
            message.success('Verification tasks created')
            store.fetchRequest(id)
        } else if (modalAction.value === 'export') {
            await store.exportRequest(id)
            message.success('Export triggered')
        }
        closeModal()
    } catch (err: any) {
        message.error(err.message || 'Action failed')
    }
}

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

const formatDateTime = (dateStr?: string | null) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

onMounted(() => {
    const id = route.params.id as string
    store.fetchRequest(id)
    tenantStore.fetchTenants()
})
</script>
