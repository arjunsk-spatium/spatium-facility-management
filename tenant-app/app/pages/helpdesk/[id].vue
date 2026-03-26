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
                        <h1 class="text-2xl font-bold dark:text-white">{{ currentTicket.ticket_number }}</h1>
                        <StatusBadge :status="currentTicket.state?.label || currentTicket.state?.key" />
                        <a-tag :color="getPriorityColor(currentTicket.priority)">{{ currentTicket.priority?.label
                        }}</a-tag>
                    </div>
                    <p class="text-gray-500 text-sm">
                        Created on {{ new Date(currentTicket.created_at).toLocaleString() }}
                    </p>
                </div>
            </div>

            <div class="flex gap-2">
                <a-dropdown>
                    <template #overlay>
                        <a-menu @click="handleMenuClick">
                            <a-menu-item v-if="currentTicket?.assignee_name" key="reassign">Reassign Ticket</a-menu-item>
                            <a-menu-item v-else key="assign">Assign Ticket</a-menu-item>
                            <a-menu-item key="changePriority">Change Priority</a-menu-item>
                        </a-menu>
                    </template>
                    <a-button>
                        Actions
                        <DownOutlined />
                    </a-button>
                </a-dropdown>

                <a-button 
                    type="primary" 
                    danger 
                    @click="handleCloseTicket"
                    :loading="closing"
                >
                    Close Ticket
                </a-button>
            </div>

            <!-- Assign Modal -->
            <a-modal v-model:open="showAssignModal" :title="isReassign ? 'Reassign Ticket' : 'Assign Ticket'" :confirm-loading="assigning"
                @ok="handleAssignTicket" @cancel="showAssignModal = false">
                <a-form layout="vertical" class="mt-4">
                    <a-form-item label="Assign To">
                        <a-select v-model:value="selectedAssignee" placeholder="Select assignee"
                            :options="assigneeOptions" :loading="loadingUsers" show-search option-filter-prop="label"
                            style="width: 100%" />
                    </a-form-item>
                    <a-form-item label="Notes">
                        <a-textarea v-model:value="assignNotes" placeholder="Add notes (optional)" :rows="3" />
                    </a-form-item>
                </a-form>
            </a-modal>

            <!-- Priority Modal -->
            <a-modal v-model:open="showPriorityModal" title="Change Priority" :confirm-loading="updatingPriority"
                @ok="handleUpdatePriority" @cancel="showPriorityModal = false">
                <a-form layout="vertical" class="mt-4">
                    <a-form-item label="Priority">
                        <a-select v-model:value="selectedPriority" placeholder="Select priority"
                            :options="priorityOptions" style="width: 100%" />
                    </a-form-item>
                </a-form>
            </a-modal>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6 flex flex-col gap-2">
                <!-- Title -->
                <a-card title="Issue">
                    <h2 class="text-lg font-semibold dark:text-white mb-2">{{ currentTicket.title }}</h2>
                    <div class="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {{ currentTicket.description }}
                    </div>
                </a-card>

                <!-- Remarks -->
                <a-card title="Remarks & History">
                    <a-timeline>
                        <a-timeline-item color="green">
                            <span class="font-medium">Ticket Created</span> - {{ new
                                Date(currentTicket.created_at).toLocaleString() }}
                        </a-timeline-item>
                    </a-timeline>

                    <div class="mt-6 flex gap-3">
                        <a-avatar style="background-color: #87d068">U</a-avatar>
                        <a-input-search placeholder="Add a remark..." enter-button="Send" size="large" />
                    </div>
                </a-card>

                <!-- Attachments -->
                <a-card title="Attachments">
                    <div v-if="ticketImages.length" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div v-for="(img, idx) in ticketImages" :key="idx"
                            class="relative aspect-video rounded-lg overflow-hidden border">
                            <img :src="img" :alt="`Attachment ${idx + 1}`" class="w-full h-full object-cover" />
                        </div>
                    </div>
                    <a-empty v-else description="No attachments" :image="false" />
                </a-card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6 flex flex-col gap-2">
                <!-- Basic Info Card -->
                <a-card title="Basic Info">
                    <div class="space-y-4">
                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Category</span>
                            <div class="flex items-center gap-2 mt-1">
                                <TagsOutlined class="text-gray-400" />
                                <span class="font-medium dark:text-white">{{ currentTicket.category_name }}</span>
                            </div>
                        </div>

                        <div v-if="currentTicket.subcategory_name">
                            <span class="block text-xs text-gray-500 uppercase">Subcategory</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.subcategory_name }}</div>
                        </div>

                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Priority</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.priority?.label }}</div>
                        </div>

                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Status</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.state?.label }}</div>
                        </div>
                    </div>
                </a-card>

                <!-- Location Card -->
                <a-card title="Location">
                    <div class="space-y-3">
                        <div v-if="currentTicket.facility">
                            <span class="block text-xs text-gray-500 uppercase">Facility</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.facility_name }}</div>
                        </div>

                        <div v-if="currentTicket.tower">
                            <span class="block text-xs text-gray-500 uppercase">Tower</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.tower_name }}</div>
                        </div>

                        <div v-if="currentTicket.floor">
                            <span class="block text-xs text-gray-500 uppercase">Floor</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.floor_name }}</div>
                        </div>

                        <div v-if="currentTicket.wing">
                            <span class="block text-xs text-gray-500 uppercase">Wing</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.wing }}</div>
                        </div>

                        <div v-if="currentTicket.location_text">
                            <span class="block text-xs text-gray-500 uppercase">Location Text</span>
                            <div class="flex items-start gap-2 mt-1">
                                <EnvironmentOutlined class="text-gray-400 mt-1" />
                                <div class="font-medium dark:text-white">{{ currentTicket.location_text }}</div>
                            </div>
                        </div>
                    </div>
                </a-card>

                <!-- Assignment Card -->
                <a-card title="Assignment">
                    <div class="space-y-4">
                        <div v-if="currentTicket.raiser_name">
                            <span class="block text-xs text-gray-500 uppercase">Raiser</span>
                            <div class="flex items-center gap-2 mt-1">
                                <UserOutlined class="text-gray-400" />
                                <span class="font-medium dark:text-white">{{ currentTicket.raiser_name }}</span>
                            </div>
                        </div>

                        <div v-if="currentTicket.assignee_name">
                            <span class="block text-xs text-gray-500 uppercase">Assigned To</span>
                            <div class="flex items-center gap-2 mt-1">
                                <UserOutlined class="text-gray-400" />
                                <span class="font-medium dark:text-white">{{ currentTicket.assignee_name }}</span>
                            </div>
                        </div>
                        <div v-else-if="!currentTicket.assignee_name" class="text-gray-500">Not assigned</div>
                    </div>
                </a-card>

                <!-- Additional Info Card -->
                <a-card title="Additional Info">
                    <div class="space-y-4">
                        <div v-if="currentTicket.company">
                            <span class="block text-xs text-gray-500 uppercase">Company</span>
                            <div class="font-medium dark:text-white mt-1">{{ currentTicket.company }}</div>
                        </div>

                        <div v-if="currentTicket.updated_at">
                            <span class="block text-xs text-gray-500 uppercase">Last Updated</span>
                            <div class="font-medium dark:text-white mt-1">{{ new
                                Date(currentTicket.updated_at).toLocaleString()
                            }}</div>
                        </div>

                        <div v-if="currentTicket.force_close_notes">
                            <span class="block text-xs text-gray-500 uppercase">Force Close Notes</span>
                            <div class="text-sm dark:text-gray-300 mt-1">{{ currentTicket.force_close_notes }}</div>
                        </div>

                        <div v-if="currentTicket.reopen_notes">
                            <span class="block text-xs text-gray-500 uppercase">Reopen Notes</span>
                            <div class="text-sm dark:text-gray-300 mt-1">{{ currentTicket.reopen_notes }}</div>
                        </div>
                    </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useHelpdeskStore } from '../../../stores/helpdesk';
import { useHelpdeskService } from '../../../composables/helpdeskService';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
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

const ticketImages = computed(() => {
    if (!currentTicket.value) return [];
    return [
        currentTicket.value.image_1,
        currentTicket.value.image_2,
        currentTicket.value.image_3
    ].filter(Boolean) as string[];
});

// Assign modal state
const showAssignModal = ref(false);
const isReassign = ref(false);
const selectedAssignee = ref<string | undefined>(undefined);
const assignNotes = ref('');
const assigning = ref(false);
const loadingUsers = ref(false);
const assignableUsers = ref<any[]>([]);
const closing = ref(false);
const showPriorityModal = ref(false);
const selectedPriority = ref<string | undefined>(undefined);
const updatingPriority = ref(false);
const priorities = ref<any[]>([]);

const priorityOptions = computed(() => 
    priorities.value.map(p => ({ label: p.label, value: p.key }))
);

const canCloseTicket = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return state === 'RESOLVED' || state === 'PENDING_CONFIRMATION';
});

const assigneeOptions = computed(() =>
    assignableUsers.value.map(u => ({ label: u.full_name || u.email, value: u.id }))
);

const openAssignModal = async (reassign = false) => {
    isReassign.value = reassign;
    showAssignModal.value = true;
    loadingUsers.value = true;
    try {
        const service = useHelpdeskService();
        assignableUsers.value = await service.getAssignableUsers();
    } catch (error) {
        message.error('Failed to load users');
    } finally {
        loadingUsers.value = false;
    }
};

const handleMenuClick = async ({ key }: { key: string }) => {
    if (key === 'assign') {
        isReassign.value = false;
        await openAssignModal(false);
    } else if (key === 'reassign') {
        isReassign.value = true;
        await openAssignModal(true);
    } else if (key === 'changePriority') {
        await openPriorityModal();
    }
};

const openPriorityModal = async () => {
    showPriorityModal.value = true;
    selectedPriority.value = currentTicket.value?.priority?.key;
    if (priorities.value.length === 0) {
        const service = useHelpdeskService();
        priorities.value = await service.getPriorities();
    }
};

const handleUpdatePriority = async () => {
    if (!selectedPriority.value) {
        message.error('Please select a priority');
        return;
    }
    
    updatingPriority.value = true;
    try {
        await store.updateTicket(ticketId, { priority_id: selectedPriority.value });
        message.success('Priority updated successfully');
        showPriorityModal.value = false;
    } catch (error) {
        message.error('Failed to update priority');
    } finally {
        updatingPriority.value = false;
    }
};

const handleAssignTicket = async () => {
    if (!selectedAssignee.value) {
        message.error('Please select an assignee');
        return;
    }

    assigning.value = true;
    try {
        if (isReassign.value) {
            await store.reassignTicket(ticketId, selectedAssignee.value, assignNotes.value);
            message.success('Ticket reassigned successfully');
        } else {
            await store.assignTicket(ticketId, selectedAssignee.value, assignNotes.value);
            message.success('Ticket assigned successfully');
        }
        showAssignModal.value = false;
        selectedAssignee.value = undefined;
        assignNotes.value = '';
    } catch (error) {
        message.error(isReassign.value ? 'Failed to reassign ticket' : 'Failed to assign ticket');
    } finally {
        assigning.value = false;
    }
};

const handleCloseTicket = async () => {
    closing.value = true;
    try {
        await store.confirmCloseTicket(ticketId);
        message.success('Ticket closed successfully');
    } catch (error) {
        message.error('Failed to close ticket');
    } finally {
        closing.value = false;
    }
};

const getPriorityColor = (priority: any) => {
    const key = priority?.key || priority;
    switch (key?.toUpperCase()) {
        case 'P1': return 'red';
        case 'P2': return 'orange';
        case 'P3': return 'blue';
        case 'P4': return 'green';
        default: return 'default';
    }
};

onMounted(() => {
    if (ticketId) {
        store.fetchTicketById(ticketId);
    }
});
</script>
