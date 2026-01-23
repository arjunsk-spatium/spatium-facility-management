<template>
    <div class="space-y-6 max-w-5xl mx-auto" v-if="currentTicket">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex items-center gap-4">
                <a-button type="text" shape="circle" @click="navigateTo('/helpdesk')">
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                </a-button>
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h1 class="text-2xl font-bold dark:text-white">{{ currentTicket.id }}</h1>
                        <StatusBadge :status="currentTicket.status" />
                        <a-tag :color="getPriorityColor(currentTicket.priority)">{{ currentTicket.priority }}</a-tag>
                    </div>
                    <p class="text-gray-500 text-sm">
                        Created on {{ new Date(currentTicket.createdAt).toLocaleString() }} by {{
                            currentTicket.createdBy }}
                    </p>
                </div>
            </div>

            <div class="flex gap-2">
                <a-dropdown>
                    <template #overlay>
                        <a-menu>
                            <a-menu-item key="1">Assign to Me</a-menu-item>
                            <a-menu-item key="2">Change Priority</a-menu-item>
                        </a-menu>
                    </template>
                    <a-button>
                        Actions
                        <DownOutlined />
                    </a-button>
                </a-dropdown>

                <a-button type="primary">Update Status</a-button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Description -->
                <a-card title="Issue Description" >
                    <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line text-base">
                        {{ currentTicket.description }}
                    </div>
                </a-card>

                <!-- Remarks -->
                <a-card title="Remarks & History" >
                    <a-timeline>
                        <!-- Most recent logs would typically be mapped here -->
                        <a-timeline-item v-for="remark in currentTicket.remarks" :key="remark.id">
                            <template #dot>
                                <MessageOutlined v-if="!remark.isInternal" />
                                <LockOutlined v-else class="text-xs" />
                            </template>
                            <div class="flex justify-between items-start">
                                <span class="font-medium text-gray-900 dark:text-white">{{ remark.by }}</span>
                                <span class="text-xs text-gray-400">{{ new Date(remark.at).toLocaleString() }}</span>
                            </div>
                            <p class="text-gray-600 dark:text-gray-400 mb-0">{{ remark.text }}</p>
                        </a-timeline-item>

                        <a-timeline-item color="green">
                            <span class="font-medium">Ticket Created</span> - {{ new
                                Date(currentTicket.createdAt).toLocaleString() }}
                        </a-timeline-item>
                    </a-timeline>

                    <div class="mt-6 flex gap-3">
                        <a-avatar style="background-color: #87d068">U</a-avatar>
                        <a-input-search placeholder="Add a remark..." enter-button="Send" size="large" />
                    </div>
                </a-card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Details Card -->
                <a-card title="Details" >
                    <div class="space-y-4">
                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Category</span>
                            <div class="flex items-center gap-2 mt-1">
                                <TagsOutlined class="text-gray-400" />
                                <span class="font-medium dark:text-white">{{ currentTicket.category }}</span>
                            </div>
                        </div>

                        <div v-if="currentTicket.subCategory">
                            <span class="block text-xs text-gray-500 uppercase">Subject</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.subCategory }}</div>
                        </div>

                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Location</span>
                            <div class="flex items-start gap-2 mt-1">
                                <EnvironmentOutlined class="text-gray-400 mt-1" />
                                <div>
                                    <div class="font-medium dark:text-white">{{ currentTicket.facilityName }}</div>
                                    <div class="text-sm text-gray-500">{{ currentTicket.locationDetails }}</div>
                                </div>
                            </div>
                        </div>

                        <div v-if="currentTicket.assignedTo">
                            <span class="block text-xs text-gray-500 uppercase">Assigned To</span>
                            <div class="flex items-center gap-2 mt-1">
                                <UserOutlined class="text-gray-400" />
                                <span class="font-medium dark:text-white">{{ currentTicket.assignedTo }}</span>
                            </div>
                        </div>
                    </div>
                </a-card>

                <!-- Attachments (Placeholder) -->
                <a-card title="Attachments" >
                    <a-empty description="No attachments" :image="false" />
                </a-card>
            </div>
        </div>
    </div>

    <div v-else-if="loading" class="flex items-center justify-center h-screen">
        <a-spin size="large" />
    </div>

    <div v-else class="flex flex-col items-center justify-center h-96">
        <WarningOutlined class="text-4xl text-yellow-500 mb-4" />
        <h2 class="text-xl font-bold">Ticket Not Found</h2>
        <a-button type="link" @click="navigateTo('/helpdesk')">Back to Helpdesk</a-button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHelpdeskStore } from '../../../stores/helpdesk';
import { storeToRefs } from 'pinia';
import StatusBadge from '../../../components/helpdesk/StatusBadge.vue';
import {
    ArrowLeftOutlined,
    DownOutlined,
    MessageOutlined,
    LockOutlined,
    TagsOutlined,
    EnvironmentOutlined,
    UserOutlined,
    WarningOutlined
} from '@ant-design/icons-vue';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const store = useHelpdeskStore();
const { currentTicket, loading } = storeToRefs(store);

const ticketId = route.params.id as string;

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'urgent': return 'red';
        case 'high': return 'orange';
        case 'medium': return 'blue';
        case 'low': return 'green';
        default: return 'default';
    }
};

onMounted(() => {
    if (ticketId) {
        store.fetchTicketById(ticketId);
    }
});
</script>
