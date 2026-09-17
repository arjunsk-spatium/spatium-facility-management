<template>
    <div class="space-y-3">
        <a-table
            :columns="columns"
            :data-source="dependencies"
            :loading="loading"
            row-key="id"
            size="small"
            :pagination="false"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'reason_type'">
                    <div>
                        <span class="font-medium dark:text-white">{{ formatReason(record.reason_type) }}</span>
                        <p v-if="record.notes" class="text-xs text-gray-500 mt-0.5">{{ record.notes }}</p>
                    </div>
                </template>

                <template v-else-if="column.key === 'status'">
                    <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
                </template>

                <template v-else-if="column.key === 'requester'">
                    <div class="text-xs">
                        <span class="block text-gray-900 dark:text-white">{{ record.requested_by_name || record.requested_by || 'Worker' }}</span>
                        <span class="text-gray-400">{{ record.requested_at ? new Date(record.requested_at).toLocaleString() : '—' }}</span>
                    </div>
                </template>

                <template v-else-if="column.key === 'decision'">
                    <div class="text-xs">
                        <span v-if="record.decided_by_name" class="block font-medium dark:text-white">By {{ record.decided_by_name }}</span>
                        <span v-if="record.decision_notes" class="text-gray-500 italic">"{{ record.decision_notes }}"</span>
                        <span v-if="!record.decided_by_name && !record.decision_notes" class="text-gray-400">—</span>
                    </div>
                </template>

                <template v-else-if="column.key === 'duration'">
                    <span v-if="record.cumulative_hold_minutes" class="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {{ record.cumulative_hold_minutes }} min
                    </span>
                    <span v-else-if="record.status === 'APPROVED'" class="text-xs text-orange-500 font-medium">
                        Active Hold
                    </span>
                    <span v-else class="text-xs text-gray-400">—</span>
                </template>

                <template v-else-if="column.key === 'action'">
                    <a-button
                        v-if="record.status === 'REQUESTED' && canDecide"
                        type="primary"
                        size="small"
                        ghost
                        @click="handleReview(record)"
                    >
                        Review
                    </a-button>
                </template>
            </template>
        </a-table>

        <TicketHoldDecisionModal
            v-model:open="decisionModalVisible"
            :ticket-id="ticketId"
            :dependency="activeDependency"
            @decided="handleDecisionDone"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TicketDependency } from '../../../composables/helpdeskService'
import TicketHoldDecisionModal from './TicketHoldDecisionModal.vue'

const props = defineProps<{
    ticketId: string
    dependencies: TicketDependency[]
    loading?: boolean
    canDecide?: boolean
}>()

const emit = defineEmits<{
    (e: 'refresh'): void
}>()

const decisionModalVisible = ref(false)
const activeDependency = ref<TicketDependency | null>(null)

const columns = [
    { title: 'Reason', key: 'reason_type' },
    { title: 'Status', key: 'status', width: 110 },
    { title: 'Requested', key: 'requester', width: 160 },
    { title: 'Decision', key: 'decision' },
    { title: 'Hold Time', key: 'duration', width: 100 },
    { title: 'Action', key: 'action', width: 80 }
]

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

const getStatusColor = (status: string) => {
    switch (status) {
        case 'REQUESTED': return 'orange'
        case 'APPROVED': return 'blue'
        case 'REJECTED': return 'red'
        case 'RESUMED': return 'green'
        default: return 'default'
    }
}

const handleReview = (dep: TicketDependency) => {
    activeDependency.value = dep
    decisionModalVisible.value = true
}

const handleDecisionDone = () => {
    emit('refresh')
}
</script>
