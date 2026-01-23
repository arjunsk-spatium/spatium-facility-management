<template>
    <ResponsiveDataView :data="visitors" :columns="columns" :loading="loading" :mobilePageSize="5">
        <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'status'">
                <a-tag :color="getStatusColor(record.status)">
                    {{ record.status.toUpperCase() }}
                </a-tag>
            </template>
            <template v-else-if="column.key === 'actions'">
                <div class="flex gap-2">
                    <a-button v-if="record.status === 'pending'" size="small" type="primary"
                        @click="$emit('update-status', record.id, 'approved')">
                        Approve
                    </a-button>
                    <a-button v-if="record.status === 'pending'" size="small" danger
                        @click="$emit('update-status', record.id, 'rejected')">
                        Reject
                    </a-button>
                    <a-button v-if="record.status === 'approved'" size="small"
                        class="!bg-green-500 !text-white !border-green-500"
                        @click="$emit('update-status', record.id, 'checked-in')">
                        Check In
                    </a-button>
                    <a-button v-if="record.status === 'checked-in'" size="small"
                        @click="$emit('update-status', record.id, 'checked-out')">
                        Check Out
                    </a-button>
                </div>
            </template>
        </template>

        <!-- Mobile Card View -->
        <template #mobileCard="{ record }">
            <a-card :bodyStyle="{ padding: '16px' }">
                <div class="flex justify-between items-start mb-3">
                    <div>
                        <div class="font-bold text-base">{{ record.name }}</div>
                        <div class="text-sm text-gray-500">{{ record.company }}</div>
                    </div>
                    <a-tag :color="getStatusColor(record.status)">{{ record.status }}</a-tag>
                </div>

                <div class="space-y-2 text-sm text-gray-600 mb-4">
                    <div class="flex gap-2">
                        <span class="font-medium w-20">Host:</span>
                        <span>{{ record.hostName }}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-medium w-20">Purpose:</span>
                        <span>{{ record.visitPurpose }}</span>
                    </div>
                    <div class="flex gap-2">
                        <span class="font-medium w-20">Date:</span>
                        <span>{{ new Date(record.visitDate).toLocaleDateString() }}</span>
                    </div>
                </div>

                <div class="flex gap-2 border-t pt-3">
                    <a-button v-if="record.status === 'pending'" size="small" type="primary" block
                        @click="$emit('update-status', record.id, 'approved')">
                        Approve
                    </a-button>
                    <a-button v-if="record.status === 'pending'" size="small" danger block
                        @click="$emit('update-status', record.id, 'rejected')">
                        Reject
                    </a-button>
                    <a-button v-if="record.status === 'approved'" size="small"
                        class="!bg-green-500 !text-white !border-green-500" block
                        @click="$emit('update-status', record.id, 'checked-in')">
                        Check In
                    </a-button>
                    <a-button v-if="record.status === 'checked-in'" size="small" block
                        @click="$emit('update-status', record.id, 'checked-out')">
                        Check Out
                    </a-button>
                </div>
            </a-card>
        </template>
    </ResponsiveDataView>
</template>

<script setup lang="ts">
import ResponsiveDataView from '../ResponsiveDataView.vue'
import type { Visitor } from '../../composables/visitorService'

defineProps<{
    visitors: Visitor[],
    loading: boolean
}>()

defineEmits(['update-status'])

const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Host', dataIndex: 'hostName', key: 'hostName' },
    { title: 'Purpose', dataIndex: 'visitPurpose', key: 'visitPurpose' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions' }
]

const getStatusColor = (status: string) => {
    switch (status) {
        case 'approved': return 'green'
        case 'pending': return 'orange'
        case 'rejected': return 'red'
        case 'checked-in': return 'blue'
        case 'checked-out': return 'gray'
        default: return 'default'
    }
}
</script>
