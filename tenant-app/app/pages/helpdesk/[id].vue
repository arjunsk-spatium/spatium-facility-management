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
                <a-dropdown v-if="canAction">
                    <template #overlay>
                        <a-menu @click="handleMenuClick">
                            <a-menu-item v-if="canReassign" key="reassign">Reassign Ticket</a-menu-item>
                            <a-menu-item v-if="canAssign" key="assign">Assign Ticket</a-menu-item>
                            <a-menu-item key="changePriority">Change Priority</a-menu-item>
                            <a-menu-item v-if="canReopen" key="reopen">Reopen Ticket</a-menu-item>
                            <a-menu-item v-if="canForceClose" key="forceClose">Force Close</a-menu-item>
                        </a-menu>
                    </template>
                    <a-button>
                        Actions
                        <DownOutlined />
                    </a-button>
                </a-dropdown>

                <a-button 
                    v-if="canConfirmClose"
                    type="primary" 
                    danger 
                    @click="handleConfirmClose"
                    :loading="closing"
                >
                    Confirm Close
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

            <!-- Reopen Modal -->
            <a-modal v-model:open="showReopenModal" title="Reopen Ticket" :confirm-loading="reopening"
                @ok="handleReopenTicket" @cancel="showReopenModal = false">
                <a-form layout="vertical" class="mt-4">
                    <a-form-item label="Assign To">
                        <a-select v-model:value="reopenAssignee" placeholder="Select assignee"
                            :options="assigneeOptions" :loading="loadingUsers" show-search option-filter-prop="label"
                            style="width: 100%" />
                    </a-form-item>
                    <a-form-item label="Reason" required>
                        <a-textarea v-model:value="reopenNotes" placeholder="Enter reason for reopening" :rows="3" />
                    </a-form-item>
                </a-form>
            </a-modal>

            <!-- Force Close Modal -->
            <a-modal v-model:open="showForceCloseModal" title="Force Close Ticket" :confirm-loading="forceClosing"
                @ok="handleForceCloseTicket" @cancel="showForceCloseModal = false">
                <a-alert type="warning" message="This action will force close the ticket immediately. This cannot be undone." class="mb-4" />
                <a-form layout="vertical" class="mt-4">
                    <a-form-item label="Notes" required>
                        <a-textarea v-model:value="forceCloseNotes" placeholder="Enter notes" :rows="3" />
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

                <!-- Timeline -->
                <a-card title="Timeline">
                    <a-timeline v-if="currentTicket.timeline && currentTicket.timeline.length">
                        <a-timeline-item v-for="item in currentTicket.timeline" :key="item.id" :color="getTimelineColor(item.to_state)">
                            <div class="mb-1">
                                <span class="font-medium dark:text-white">{{ getStateLabel(item.to_state) }}</span>
                                <span v-if="item.reason" class="text-gray-500 text-sm ml-2">- {{ item.reason }}</span>
                            </div>
                            <div class="text-xs text-gray-400 mb-2">
                                {{ new Date(item.created_at).toLocaleString() }}
                            </div>
                            <div v-if="item.proofs && item.proofs.length" class="flex gap-2 flex-wrap">
                                <a-image-preview-group>
                                    <a-image 
                                        v-for="img in item.proofs.flatMap(p => p.images)" 
                                        :key="img.id"
                                        :src="img.image" 
                                        :alt="img.image_type"
                                        :width="60"
                                        :height="60"
                                        class="!inline-block rounded cursor-pointer object-cover"
                                        :preview="{ visible: false }"
                                    />
                                </a-image-preview-group>
                            </div>
                            <div v-if="item.proofs && item.proofs.length" class="text-xs text-gray-500 mt-1">
                                <span v-for="(proof, idx) in item.proofs" :key="proof.id">
                                    <span v-if="proof.geo_lat && proof.geo_lon">
                                        <a :href="`https://www.google.com/maps/search/?api=1&query=${proof.geo_lat},${proof.geo_lon}`" 
                                           target="_blank" 
                                           class="text-blue-600 hover:underline">
                                            📍 View on Map
                                        </a>
                                    </span>
                                </span>
                            </div>
                        </a-timeline-item>
                    </a-timeline>
                    <a-empty v-else description="No timeline available" :image="false" />
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

                        <div v-if="currentTicket.assigned_at">
                            <span class="block text-xs text-gray-500 uppercase">Assigned At</span>
                            <div class="font-medium dark:text-white mt-1">{{ new Date(currentTicket.assigned_at).toLocaleString() }}</div>
                        </div>
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
import { useAuthStore } from '../../../stores/auth';
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
const authStore = useAuthStore();
const { currentTicket, loading } = storeToRefs(store);

// Permission checks
const canUpdate = computed(() => authStore.hasPermission('helpdesk-tickets:update'))
const canAction = computed(() => authStore.hasPermission('helpdesk-tickets:action'))

const ticketId = route.params.id as string;

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
    priorities.value.map(p => ({ label: p.label, value: p.id }))
);

const canCloseTicket = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return state === 'RESOLVED' || state === 'PENDING_CONFIRMATION';
});

const canReopen = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return state === 'PENDING_CONFIRMATION' || state === 'DISPUTED';
});

const canReassign = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return canAction.value && ['ASSIGNED', 'ACKNOWLEDGED', 'REOPENED'].includes(state);
});

const canAssign = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return canAction.value && state === 'OPEN';
});

const canForceClose = computed(() => {
    if (!currentTicket.value) return false;
    return canAction.value;
});

const canConfirmClose = computed(() => {
    if (!currentTicket.value) return false;
    const state = currentTicket.value.state?.key;
    return canUpdate.value && (state === 'PENDING_CONFIRMATION' || state === 'RESOLVED');
});

const ticketLocationUrl = computed(() => {
    if (!currentTicket.value?.proofs?.length) return null;
    const proofWithGeo = currentTicket.value.proofs.find(p => p.geo_lat && p.geo_lon);
    if (proofWithGeo) {
        return `https://www.google.com/maps/search/?api=1&query=${proofWithGeo.geo_lat},${proofWithGeo.geo_lon}`;
    }
    return null;
});

// Reopen & Force Close state
const showReopenModal = ref(false);
const showForceCloseModal = ref(false);
const reopenNotes = ref('');
const reopenAssignee = ref<string | undefined>(undefined);
const forceCloseNotes = ref('');
const reopening = ref(false);
const forceClosing = ref(false);

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
    } else if (key === 'reopen') {
        await openReopenModal();
    } else if (key === 'forceClose') {
        showForceCloseModal.value = true;
    }
};

const openReopenModal = async () => {
    showReopenModal.value = true;
    loadingUsers.value = true;
    try {
        const service = useHelpdeskService();
        assignableUsers.value = await service.getAssignableUsers();
        reopenAssignee.value = currentTicket.value?.assignee || undefined;
    } catch (error) {
        message.error('Failed to load users');
    } finally {
        loadingUsers.value = false;
    }
};

const openPriorityModal = async () => {
    showPriorityModal.value = true;
    if (priorities.value.length === 0) {
        const service = useHelpdeskService();
        priorities.value = await service.getPriorities();
    }
    selectedPriority.value = priorities.value.find(p => p.key === currentTicket.value?.priority?.key)?.id;
};

const handleUpdatePriority = async () => {
    if (!selectedPriority.value) {
        message.error('Please select a priority');
        return;
    }
    
    updatingPriority.value = true;
    try {
        await store.updateTicket(ticketId, { priority: selectedPriority.value });
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

const handleConfirmClose = async () => {
    closing.value = true;
    try {
        await store.confirmCloseTicket(ticketId);
        message.success('Ticket closed successfully');
        await store.fetchTicketById(ticketId);
    } catch (error) {
        message.error('Failed to close ticket');
    } finally {
        closing.value = false;
    }
};

const handleReopenTicket = async () => {
    if (!reopenAssignee.value) {
        message.error('Please select an assignee');
        return;
    }
    if (!reopenNotes.value?.trim()) {
        message.error('Please enter a reason for reopening');
        return;
    }
    reopening.value = true;
    try {
        await store.reopenTicket(ticketId, reopenAssignee.value, reopenNotes.value);
        message.success('Ticket reopened successfully');
        showReopenModal.value = false;
        reopenNotes.value = '';
        reopenAssignee.value = undefined;
        await store.fetchTicketById(ticketId);
    } catch (error) {
        message.error('Failed to reopen ticket');
    } finally {
        reopening.value = false;
    }
};

const handleForceCloseTicket = async () => {
    if (!forceCloseNotes.value?.trim()) {
        message.error('Please enter notes for force close');
        return;
    }
    forceClosing.value = true;
    try {
        await store.forceCloseTicket(ticketId, forceCloseNotes.value);
        message.success('Ticket force closed successfully');
        showForceCloseModal.value = false;
        forceCloseNotes.value = '';
        await store.fetchTicketById(ticketId);
    } catch (error) {
        message.error('Failed to force close ticket');
    } finally {
        forceClosing.value = false;
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

const getTimelineColor = (state: string) => {
    if (!state) return 'gray';
    const s = state.toUpperCase();
    if (['OPEN', 'ASSIGNED', 'ACKNOWLEDGED', 'IN_PROGRESS'].includes(s)) return 'blue';
    if (['PENDING_CONFIRMATION'].includes(s)) return 'orange';
    if (['RESOLVED', 'CLOSED'].includes(s)) return 'green';
    return 'gray';
};

const getStateLabel = (state: string) => {
    if (!state) return 'Unknown';
    const labels: Record<string, string> = {
        'OPEN': 'Ticket Created',
        'ASSIGNED': 'Assigned',
        'ACKNOWLEDGED': 'Acknowledged',
        'IN_PROGRESS': 'Work Started',
        'PENDING_CONFIRMATION': 'Pending Confirmation',
        'RESOLVED': 'Resolved',
        'CLOSED': 'Closed'
    };
    return labels[state.toUpperCase()] || state;
};

onMounted(() => {
    if (ticketId) {
        store.fetchTicketById(ticketId);
    }
});
</script>
