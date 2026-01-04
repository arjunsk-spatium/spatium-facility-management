<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full">
        <template #title>
            <div class="flex items-center gap-2">
                <span class="text-red-500">⚠</span>
                <span>Urgent Action Required</span>
            </div>
        </template>
        <div class="space-y-4">
            <div v-for="ticket in urgentTickets" :key="ticket.id" class="border-l-4 border-red-500 pl-3 py-1">
                <div class="flex justify-between items-start">
                    <span class="font-semibold text-sm line-clamp-1">{{ ticket.subject }}</span>
                    <span class="text-xs font-mono bg-gray-100 dark:bg-gray-800 px-1 rounded">{{ ticket.id }}</span>
                </div>
                <div class="text-xs text-gray-500 mt-1">
                    {{ ticket.requester }} • {{ ticket.due }}
                </div>
                <div class="mt-2 flex gap-2">
                    <a-button size="small" type="primary" danger ghost>Resolve</a-button>
                    <a-button size="small">Assign</a-button>
                </div>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
const urgentTickets = [
    { id: '#TK-2049', subject: 'Server Room Overheating', requester: 'IT Dept', due: '1h overdue' },
    { id: '#TK-2102', subject: 'Main Entrance Door Stuck', requester: 'Security', due: 'Due in 30m' },
];
</script>
