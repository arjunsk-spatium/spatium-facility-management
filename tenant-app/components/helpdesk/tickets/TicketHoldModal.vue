<template>
    <a-modal
        :open="open"
        :title="isDirectHold ? 'Put Ticket on Hold' : 'Request Ticket Hold'"
        :confirm-loading="submitting"
        @ok="handleSubmit"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2">
            <a-alert
                v-if="!isDirectHold"
                type="info"
                show-icon
                message="Requesting a hold notifies Helpdesk for approval. The SLA clock continues until approved."
                class="mb-2"
            />
            <a-alert
                v-else
                type="warning"
                show-icon
                message="Direct hold immediately pauses ticket progress and sets the state to ON HOLD."
                class="mb-2"
            />

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hold Reason *
                </label>
                <a-select
                    v-model:value="form.reason_type"
                    class="w-full"
                    placeholder="Select hold reason"
                    :options="reasonOptions"
                />
            </div>

            <div v-if="form.reason_type === 'DEPENDENT_TICKET'">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Linked Ticket ID *
                </label>
                <a-input
                    v-model:value="form.linked_ticket"
                    placeholder="Enter blocking ticket UUID / number"
                />
                <p class="text-xs text-gray-500 mt-1">Required when hold reason is Dependent Ticket.</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Resolution ETA
                </label>
                <a-date-picker
                    v-model:value="etaDate"
                    show-time
                    class="w-full"
                    placeholder="Optional expected resume date & time"
                />
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                </label>
                <a-textarea
                    v-model:value="form.notes"
                    placeholder="Explain why this ticket is being put on hold..."
                    :rows="3"
                />
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type RequestHoldPayload } from '../../../composables/helpdeskService'
import dayjs, { type Dayjs } from 'dayjs'

const props = defineProps<{
    open: boolean
    ticketId: string
    isDirectHold?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'success', data: any): void
}>()

const helpdeskService = useHelpdeskService()
const submitting = ref(false)
const etaDate = ref<Dayjs | null>(null)

const reasonOptions = [
    { label: 'Parts Awaited', value: 'PARTS_AWAITED' },
    { label: 'Vendor Visit', value: 'VENDOR_VISIT' },
    { label: 'Approval Pending', value: 'APPROVAL_PENDING' },
    { label: 'Access Unavailable', value: 'ACCESS_UNAVAILABLE' },
    { label: 'Dependent Ticket', value: 'DEPENDENT_TICKET' },
    { label: 'Other', value: 'OTHER' },
]

const form = ref<{
    reason_type: 'PARTS_AWAITED' | 'VENDOR_VISIT' | 'APPROVAL_PENDING' | 'ACCESS_UNAVAILABLE' | 'DEPENDENT_TICKET' | 'OTHER'
    notes: string
    linked_ticket?: string
}>({
    reason_type: 'PARTS_AWAITED',
    notes: '',
    linked_ticket: undefined
})

const handleSubmit = async () => {
    if (!form.value.reason_type) {
        message.warning('Please select a reason for the hold')
        return
    }

    if (form.value.reason_type === 'DEPENDENT_TICKET' && !form.value.linked_ticket?.trim()) {
        message.warning('Linked ticket is required for Dependent Ticket holds')
        return
    }

    submitting.value = true
    try {
        const payload: RequestHoldPayload = {
            reason_type: form.value.reason_type,
            notes: form.value.notes.trim() || undefined,
            expected_resolution_at: etaDate.value ? etaDate.value.toISOString() : undefined,
            linked_ticket: form.value.linked_ticket?.trim() || undefined
        }

        let result
        if (props.isDirectHold) {
            result = await helpdeskService.directHold(props.ticketId, payload)
            message.success('Ticket placed on hold')
        } else {
            result = await helpdeskService.requestHold(props.ticketId, payload)
            message.success('Hold request submitted for Helpdesk approval')
        }

        emit('success', result)
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to submit hold')
    } finally {
        submitting.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        form.value = {
            reason_type: 'PARTS_AWAITED',
            notes: '',
            linked_ticket: undefined
        }
        etaDate.value = null
    }
})
</script>
