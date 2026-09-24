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

            <div v-if="isDependentTicket">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Linked Ticket ID *
                </label>
                <a-select
                    v-model:value="form.linked_ticket"
                    show-search
                    allow-clear
                    :filter-option="false"
                    :loading="searchingTickets"
                    placeholder="Search by ticket number or title (e.g. TKT-1042)..."
                    class="w-full"
                    :options="linkedTicketOptions"
                    @search="handleTicketSearch"
                    @focus="handleTicketFocus"
                />
                <p class="text-xs text-gray-500 mt-1">Required when hold reason is Dependent Ticket. Search by ticket number or title.</p>
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
import { ref, computed, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type RequestHoldPayload, type DependencyReasonType } from '../../../composables/helpdeskService'
import { useHelpdeskStore } from '../../../stores/helpdesk'
import dayjs, { type Dayjs } from 'dayjs'

const props = defineProps<{
    open: boolean
    ticketId: string
    facilityId?: string
    isDirectHold?: boolean
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'success', data: any): void
}>()

const helpdeskService = useHelpdeskService()
const helpdeskStore = useHelpdeskStore()
const submitting = ref(false)
const loadingReasons = ref(false)
const dynamicReasons = ref<DependencyReasonType[]>([])
const etaDate = ref<Dayjs | null>(null)

// Linked Ticket Search State
const searchingTickets = ref(false)
const searchedTickets = ref<any[]>([])
const lastSearchQuery = ref('')
let searchTimeout: any = null

const defaultReasonOptions = [
    { label: 'Parts Awaited', value: 'PARTS_AWAITED' },
    { label: 'Vendor Visit', value: 'VENDOR_VISIT' },
    { label: 'Approval Pending', value: 'APPROVAL_PENDING' },
    { label: 'Access Unavailable', value: 'ACCESS_UNAVAILABLE' },
    { label: 'Dependent Ticket', value: 'DEPENDENT_TICKET' },
    { label: 'Other', value: 'OTHER' },
]

const reasonOptions = computed(() => {
    if (dynamicReasons.value.length > 0) {
        return dynamicReasons.value.map(r => ({
            label: r.name,
            value: r.id
        }))
    }
    return defaultReasonOptions
})

const form = ref<{
    reason_type: string
    notes: string
    linked_ticket?: string
}>({
    reason_type: 'PARTS_AWAITED',
    notes: '',
    linked_ticket: undefined
})

const isDependentTicket = computed(() => {
    if (!form.value.reason_type) return false
    if (form.value.reason_type === 'DEPENDENT_TICKET') return true
    const selected = dynamicReasons.value.find(r => r.id === form.value.reason_type)
    if (selected) {
        return selected.key === 'DEPENDENT_TICKET' ||
            selected.name?.toLowerCase().includes('dependent')
    }
    return false
})

const effectiveFacilityId = computed(() => {
    return props.facilityId || helpdeskStore.currentTicket?.facility || undefined
})

const linkedTicketOptions = computed(() => {
    const list = searchedTickets.value.map((t: any) => {
        const num = t.ticket_number || t.id
        const title = t.title ? ` - ${t.title}` : ''
        return {
            label: `${num}${title}`,
            value: t.id
        }
    })

    // If a custom linked_ticket value is set, ensure it is in the options list so Ant Design Select displays it properly
    if (form.value.linked_ticket && !list.some(item => item.value === form.value.linked_ticket)) {
        list.unshift({
            label: form.value.linked_ticket,
            value: form.value.linked_ticket
        })
    }

    // If user typed a search query that doesn't match any returned id, allow selecting it directly
    const query = lastSearchQuery.value.trim()
    if (query && !list.some(item => item.value === query || item.label.toLowerCase().includes(query.toLowerCase()))) {
        list.push({
            label: `Use "${query}"`,
            value: query
        })
    }

    return list
})

const loadExcludeClosedTickets = async (query: string = '') => {
    searchingTickets.value = true
    try {
        const params: { facility_id?: string; search?: string } = {}
        if (effectiveFacilityId.value) {
            params.facility_id = effectiveFacilityId.value
        }
        if (query?.trim()) {
            params.search = query.trim()
        }

        const results = await helpdeskService.getExcludeClosedTickets(params)
        searchedTickets.value = (Array.isArray(results) ? results : []).filter(
            (t: any) => t.id !== props.ticketId
        )
    } catch (err) {
        console.error('Failed to search tickets for hold dependency:', err)
    } finally {
        searchingTickets.value = false
    }
}

const handleTicketSearch = (val: string) => {
    lastSearchQuery.value = val || ''
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadExcludeClosedTickets(val)
    }, 300)
}

const handleTicketFocus = () => {
    if (searchedTickets.value.length === 0) {
        loadExcludeClosedTickets('')
    }
}

const loadReasons = async () => {
    loadingReasons.value = true
    try {
        const reasons = await helpdeskService.getDependencyReasonTypes()
        if (Array.isArray(reasons) && reasons.length > 0) {
            dynamicReasons.value = reasons
            if (!form.value.reason_type || form.value.reason_type === 'PARTS_AWAITED') {
                form.value.reason_type = reasons[0].id
            }
        }
    } catch (err) {
        // Fallback to default reasons gracefully
    } finally {
        loadingReasons.value = false
    }
}

onMounted(() => {
    loadReasons()
})

const handleSubmit = async () => {
    if (!form.value.reason_type) {
        message.warning('Please select a reason for the hold')
        return
    }

    if (isDependentTicket.value && !form.value.linked_ticket?.trim()) {
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
        const defaultVal = dynamicReasons.value.length > 0 ? dynamicReasons.value[0].id : 'PARTS_AWAITED'
        form.value = {
            reason_type: defaultVal,
            notes: '',
            linked_ticket: undefined
        }
        etaDate.value = null
        searchedTickets.value = []
        lastSearchQuery.value = ''
        if (dynamicReasons.value.length === 0) {
            loadReasons()
        }
        if (isDependentTicket.value) {
            loadExcludeClosedTickets('')
        }
    }
})

watch(isDependentTicket, (val) => {
    if (val && searchedTickets.value.length === 0) {
        loadExcludeClosedTickets('')
    }
})
</script>

