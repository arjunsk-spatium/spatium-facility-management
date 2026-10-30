<template>
    <a-modal
        :open="open"
        title="Review Hold Request"
        :footer="null"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2" v-if="dependency">
            <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 space-y-2 text-sm">
                <div>
                    <span class="text-gray-500 text-xs uppercase block">Reason</span>
                    <span class="font-medium dark:text-white">{{ formatReason(dependency.reason_type) }}</span>
                </div>
                <div v-if="dependency.notes">
                    <span class="text-gray-500 text-xs uppercase block">Requester Notes</span>
                    <span class="text-gray-700 dark:text-gray-300">{{ dependency.notes }}</span>
                </div>
                <div v-if="dependency.expected_resolution_at">
                    <span class="text-gray-500 text-xs uppercase block">Expected Resolution</span>
                    <span>{{ new Date(dependency.expected_resolution_at).toLocaleString() }}</span>
                </div>
                <div v-if="dependency.linked_ticket">
                    <span class="text-gray-500 text-xs uppercase block">Linked Ticket</span>
                    <span class="font-mono text-xs">{{ dependency.linked_ticket }}</span>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Extend Resolution SLA (Minutes)
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                    <a-button
                        v-for="mins in [30, 60, 120, 240]"
                        :key="mins"
                        size="small"
                        :type="extendMinutes === mins ? 'primary' : 'default'"
                        @click="extendMinutes = mins"
                    >
                        +{{ mins }} min
                    </a-button>
                </div>
                <a-input-number
                    v-model:value="extendMinutes"
                    :min="0"
                    class="w-full"
                    placeholder="Optional minutes to extend SLA (e.g. 120)"
                />
                <p class="text-xs text-gray-500 mt-1">Optional. Adds extra resolution time upon hold approval.</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Decision Notes
                </label>
                <a-textarea
                    v-model:value="decisionNotes"
                    placeholder="Enter approval conditions or rejection reason..."
                    :rows="3"
                />
            </div>

            <div class="flex justify-end gap-2 pt-2">
                <a-button @click="handleClose">Cancel</a-button>
                <a-button danger :loading="rejecting" @click="handleReject">
                    Reject Hold
                </a-button>
                <a-button type="primary" :loading="approving" @click="handleApprove">
                    Approve Hold
                </a-button>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type TicketDependency } from '../../../composables/helpdeskService'

const props = defineProps<{
    open: boolean
    ticketId: string
    dependency?: TicketDependency | null
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'decided', result: any): void
}>()

const helpdeskService = useHelpdeskService()
const decisionNotes = ref('')
const extendMinutes = ref<number | null>(null)
const approving = ref(false)
const rejecting = ref(false)

const formatReason = (type: string) => {
    switch (type) {
        case 'PARTS_AWAITED': return 'Parts Awaited'
        case 'VENDOR_VISIT': return 'Vendor Visit'
        case 'APPROVAL_PENDING': return 'Approval Pending'
        case 'ACCESS_UNAVAILABLE': return 'Access Unavailable'
        case 'DEPENDENT_TICKET': return 'Dependent Ticket'
        default: return type || 'Other'
    }
}

const handleApprove = async () => {
    if (!props.dependency) return
    approving.value = true
    try {
        const payload: { decision_notes?: string; extend_minutes?: number } = {
            decision_notes: decisionNotes.value.trim() || undefined,
            extend_minutes: extendMinutes.value ? Number(extendMinutes.value) : undefined
        }
        const res = await helpdeskService.approveHold(
            props.ticketId,
            props.dependency.id,
            payload
        )
        message.success('Hold request approved — ticket is now ON HOLD')
        emit('decided', res)
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to approve hold')
    } finally {
        approving.value = false
    }
}

const handleReject = async () => {
    if (!props.dependency) return
    rejecting.value = true
    try {
        const res = await helpdeskService.rejectHold(
            props.ticketId,
            props.dependency.id,
            decisionNotes.value.trim() || undefined
        )
        message.info('Hold request rejected')
        emit('decided', res)
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to reject hold')
    } finally {
        rejecting.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        decisionNotes.value = ''
        extendMinutes.value = null
    }
})
</script>
