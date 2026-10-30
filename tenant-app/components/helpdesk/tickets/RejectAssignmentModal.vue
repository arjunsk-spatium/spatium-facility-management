<template>
    <a-modal
        :open="open"
        title="Decline Ticket Assignment"
        :confirm-loading="declining"
        ok-text="Confirm Decline"
        ok-type="danger"
        @ok="handleDecline"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2">
            <a-alert
                type="warning"
                show-icon
                message="Declining will re-route this ticket to the next eligible worker or return it to the open queue."
            />
            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Reason for declining (optional)
                </label>
                <a-textarea
                    v-model:value="reason"
                    placeholder="e.g. Area out of my shift coverage, lack specialized equipment..."
                    :rows="3"
                />
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService } from '../../../composables/helpdeskService'

const props = defineProps<{
    open: boolean
    ticketId: string
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'declined', updatedTicket: any): void
}>()

const helpdeskService = useHelpdeskService()
const reason = ref('')
const declining = ref(false)

const handleDecline = async () => {
    declining.value = true
    try {
        const res = await helpdeskService.rejectAssignment(props.ticketId, reason.value.trim() || undefined)
        message.info('Ticket assignment declined')
        emit('declined', res)
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to decline ticket')
    } finally {
        declining.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        reason.value = ''
    }
})
</script>
