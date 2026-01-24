<template>
    <div>
        <ResponsiveDataView :data="visitors" :columns="columns" :loading="loading" :mobilePageSize="5">
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
                                    <div class="text-sm text-gray-500">{{ record.company }}</div>
                                </div>
                                <a-tag :color="getStatusColor(record.status)" class="ml-2 flex-shrink-0">{{ record.status }}</a-tag>
                            </div>
                        </div>
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

        <VisitorDetailsModal v-model:open="showDetailsModal" :visitor="selectedVisitor" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ResponsiveDataView from '../ResponsiveDataView.vue'
import VisitorDetailsModal from './VisitorDetailsModal.vue'
import type { Visitor } from '../../composables/visitorService'

defineProps<{
    visitors: Visitor[],
    loading: boolean
}>()

defineEmits(['update-status'])

const columns = [
    { title: '', key: 'photo', width: 60 },
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Company', dataIndex: 'company', key: 'company' },
    { title: 'Host', dataIndex: 'hostName', key: 'hostName' },
    { title: 'Purpose', dataIndex: 'visitPurpose', key: 'visitPurpose' },
    { title: 'Status', key: 'status' },
    { title: 'Actions', key: 'actions' }
]

const showDetailsModal = ref(false)
const selectedVisitor = ref<Visitor | null>(null)

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
