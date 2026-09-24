<template>
    <a-modal
        :open="open"
        title="Change Resolution SLA"
        :confirm-loading="submitting"
        @ok="handleSubmit"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2">
            <a-alert
                type="info"
                show-icon
                message="Resolution SLA can be adjusted while ticket is on hold. This updates the resolution deadline accordingly."
                class="mb-2"
            />

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Extension Minutes *
                </label>
                <div class="flex flex-wrap gap-2 mb-2">
                    <a-button
                        v-for="mins in [15, 30, 45, 60, 120, 240]"
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
                    :min="1"
                    :max="10080"
                    class="w-full"
                    placeholder="Enter extension in minutes (e.g. 45)"
                />
                <p class="text-xs text-gray-500 mt-1">Number of minutes to extend the ticket resolution deadline.</p>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Decision Notes
                </label>
                <a-textarea
                    v-model:value="decisionNotes"
                    placeholder="Reason or context for changing the SLA (optional)..."
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
    (e: 'success', data: any): void
}>()

const helpdeskService = useHelpdeskService()
const submitting = ref(false)
const extendMinutes = ref<number | null>(45)
const decisionNotes = ref('')

const handleSubmit = async () => {
    if (!extendMinutes.value || extendMinutes.value <= 0) {
        message.warning('Please enter valid extension minutes (greater than 0)')
        return
    }

    submitting.value = true
    try {
        const result = await helpdeskService.changeResolutionSla(props.ticketId, {
            extend_minutes: Number(extendMinutes.value),
            decision_notes: decisionNotes.value.trim() || undefined
        })
        message.success('Resolution SLA updated successfully')
        emit('success', result)
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to change resolution SLA')
    } finally {
        submitting.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        extendMinutes.value = 45
        decisionNotes.value = ''
    }
})
</script>
