<template>
    <div class="space-y-6">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Helpdesk</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage support tickets and maintenance requests.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button @click="navigateTo('/helpdesk/insights')">
                    <template #icon>
                        <BarChartOutlined />
                    </template>
                    Insights
                </a-button>
                <a-button v-if="canCreate" type="primary" @click="openCreateModal">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    New Ticket
                </a-button>
            </div>
        </div>

        <a-modal
            v-model:open="showCreateModal"
            title="Create New Ticket"
            :width="640"
            :confirm-loading="creating"
            @ok="handleCreateTicket"
            @cancel="closeCreateModal"
        >
            <a-form
                ref="formRef"
                :model="createForm"
                :rules="formRules"
                layout="vertical"
                class="mt-4"
            >
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Category" name="category">
                            <a-select
                                v-model:value="createForm.category"
                                placeholder="Select category"
                                :options="categoryOptions"
                                :loading="loadingCategories"
                                @change="handleCategoryChange"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Subcategory" name="subcategory">
                            <a-select
                                v-model:value="createForm.subcategory"
                                placeholder="Select subcategory"
                                :options="subCategoryOptions"
                                :loading="loadingSubCategories"
                                :disabled="!createForm.category"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="Title" name="title">
                    <a-input
                        v-model:value="createForm.title"
                        placeholder="Enter ticket title"
                    />
                </a-form-item>

                <a-form-item label="Description" name="description">
                    <a-textarea
                        v-model:value="createForm.description"
                        placeholder="Describe the issue..."
                        :rows="4"
                    />
                </a-form-item>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Priority" name="priority">
                            <a-select
                                v-model:value="createForm.priority"
                                placeholder="Select priority"
                                :options="priorityOptions"
                                :loading="loadingPriorities"
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Facility" name="facility">
                            <a-select
                                v-model:value="createForm.facility"
                                placeholder="Select facility"
                                :options="facilityOptions"
                                :loading="loadingFacilities"
                                @change="handleFacilityChange"
                            />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Tower" name="tower">
                            <a-select
                                v-model:value="createForm.tower"
                                placeholder="Select tower"
                                :options="towerOptions"
                                :loading="loadingFloors"
                                :disabled="!createForm.facility"
                                allow-clear
                            />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Floor" name="floor">
                            <a-select
                                v-model:value="createForm.floor"
                                placeholder="Select floor"
                                :options="floorOptions"
                                :loading="loadingFloors"
                                :disabled="!createForm.facility"
                                allow-clear
                            />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="Location" name="location_text">
                    <a-input
                        v-model:value="createForm.location_text"
                        placeholder="e.g., Building A, Room 101"
                    />
                </a-form-item>
            </a-form>
        </a-modal>


        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
            <a-tab-pane key="priority">
                <template #tab>
                    Priority <a-badge :count="ticketCounts.priority" :number-style="{ backgroundColor: '#ef4444' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
            <a-tab-pane key="open">
                <template #tab>
                    Open <a-badge :count="ticketCounts.open" :number-style="{ backgroundColor: '#3b82f6' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
            <a-tab-pane key="inprogress">
                <template #tab>
                    In Progress <a-badge :count="ticketCounts.inprogress" :number-style="{ backgroundColor: '#f59e0b' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
            <a-tab-pane key="pending">
                <template #tab>
                    Pending <a-badge :count="ticketCounts.pending" :number-style="{ backgroundColor: '#8b5cf6' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
            <a-tab-pane key="closed">
                <template #tab>
                    Closed <a-badge :count="ticketCounts.closed" :number-style="{ backgroundColor: '#10b981' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
            <a-tab-pane key="all">
                <template #tab>
                    All <a-badge :count="ticketCounts.all" :number-style="{ backgroundColor: '#6b7280' }"
                        :offset="[6, 0]" />
                </template>
            </a-tab-pane>
        </a-tabs>

        <div v-if="canView">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                    <a-input-search v-model:value="searchText" placeholder="Search tickets..." class="w-full md:w-64" />

                    <a-select v-model:value="facilityFilter" placeholder="Filter by Facility" class="w-full md:w-48"
                        allow-clear @change="handleFacilityFilterChange">
                        <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">{{ fac.name
                            }}</a-select-option>
                    </a-select>
                </div>

                <a-button v-if="canAction" class="w-full md:w-auto">
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    Export
                </a-button>
            </div>

            <ResponsiveDataView :columns="columns" :data="tickets" :loading="loading" row-key="id" :pagination="paginationConfig">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'ticket_number'">
                        <a @click="navigateTo(`/helpdesk/${record.id}`)" class="font-medium hover:underline">{{
                            record.ticket_number }}</a>
                    </template>

                    <template v-else-if="column.key === 'state'">
                        <StatusBadge :status="record.state?.label || record.state?.key" />
                    </template>

                    <template v-else-if="column.key === 'priority'">
                        <a-tag :color="getPriorityColor(record.priority)">{{ record.priority?.label || record.priority?.key }}</a-tag>
                    </template>

                    <template v-else-if="column.key === 'created_at'">
                        {{ new Date(record.created_at).toLocaleDateString() }}
                        <span class="text-xs text-gray-500 block">{{ new Date(record.created_at).toLocaleTimeString([],
                            { hour: '2-digit', minute: '2-digit' }) }}</span>
                    </template>

                    <template v-else-if="column.key === 'actions'">
                        <a-dropdown v-if="canAction">
                            <a-button type="text" size="small">
                                <template #icon>
                                    <MoreOutlined />
                                </template>
                            </a-button>
                            <template #overlay>
                                <a-menu>
                                    <a-menu-item key="view" @click="navigateTo(`/helpdesk/${record.id}`)">
                                        <EyeOutlined /> View Details
                                    </a-menu-item>
                                    <a-menu-item v-if="canUpdate && record.state?.key !== 'closed'" key="close"
                                        @click="handleCloseTicket(record)">
                                        <CheckCircleOutlined /> Close Ticket
                                    </a-menu-item>
                                </a-menu>
                            </template>
                        </a-dropdown>
                        <a-tooltip v-else title="View Details">
                            <a-button type="text" shape="circle" @click="navigateTo(`/helpdesk/${record.id}`)">
                                <template #icon>
                                    <EyeOutlined />
                                </template>
                            </a-button>
                        </a-tooltip>
                    </template>
                </template>

                <!-- Mobile Card View -->
                <template #mobileCard="{ record }">
                    <a-card
                        class="mb-4 shadow-sm !border-neutral-200 dark:!border-neutral-700 hover:shadow-md transition-shadow"
                        :bordered="true" :bodyStyle="{ padding: '16px' }">
                        <div class="flex justify-between items-start mb-3">
                            <StatusBadge :status="record.state?.label || record.state?.key" />
                            <span class="text-xs text-gray-500 font-mono">#{{ record.ticket_number }}</span>
                        </div>

                        <h4 class="font-bold text-base mb-1 dark:text-white cursor-pointer hover:text-primary-500"
                            @click="navigateTo(`/helpdesk/${record.id}`)">
                            {{ record.title }}
                        </h4>

                        <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 flex flex-wrap gap-2">
                            <span>{{ record.category_name }}</span>
                            <span class="text-gray-300">•</span>
                            <span>{{ record.subcategory_name }}</span>
                        </div>

                        <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                            <div class="flex items-center gap-2">
                                <a-tag :color="getPriorityColor(record.priority)" class="!mr-0">{{ record.priority?.label
                                    }}</a-tag>
                                <span class="text-xs text-gray-400">{{ new Date(record.created_at).toLocaleDateString()
                                    }}</span>
                            </div>
                            <a-button type="link" size="small" class="!px-0" @click="navigateTo(`/helpdesk/${record.id}`)">
                                View Details
                                <EyeOutlined />
                            </a-button>
                        </div>
                    </a-card>
                </template>
            </ResponsiveDataView>
        </div>

        <div v-else class="text-center py-12 text-gray-500">
            You don't have permission to view helpdesk tickets.
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHelpdeskStore } from '../../../stores/helpdesk';
import { useFacilityStore } from '../../../stores/facility';
import { useFacilityService } from '../../../composables/facilityService';
import { useAuthStore } from '../../../stores/auth';
import { storeToRefs } from 'pinia';
import { message } from 'ant-design-vue';
import type { TicketListParams } from '../../../composables/helpdeskService';
import {
    PlusOutlined,
    BarChartOutlined,
    ExportOutlined,
    EyeOutlined,
    MoreOutlined,
    CheckCircleOutlined
} from '@ant-design/icons-vue';
import StatusBadge from '../../../components/helpdesk/StatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';

definePageMeta({
    middleware: 'auth'
});

// Stores
const helpdeskStore = useHelpdeskStore();
const facilityStore = useFacilityStore();
const authStore = useAuthStore();
const { tickets, loading, categories, subCategories, priorities, creating, priorityCount, openCount, inprogressCount, pendingCount, closedCount, allCount, count, page, pageSize } = storeToRefs(helpdeskStore);
const { facilities } = storeToRefs(facilityStore);

// Permission checks
const canView = computed(() => authStore.hasPermission('helpdesk-tickets:view'))
const canCreate = computed(() => authStore.hasPermission('helpdesk-tickets:create'))
const canUpdate = computed(() => authStore.hasPermission('helpdesk-tickets:update'))
const canAction = computed(() => authStore.hasPermission('helpdesk-tickets:action'))

// Form state
const showCreateModal = ref(false);
const formRef = ref();
const createForm = ref({
    category: undefined as string | undefined,
    subcategory: undefined as string | undefined,
    title: '',
    description: '',
    priority: undefined as string | undefined,
    facility: undefined as string | undefined,
    tower: undefined as string | undefined,
    floor: undefined as string | undefined,
    location_text: ''
});

const formRules = {
    category: [{ required: true, message: 'Please select a category', trigger: 'change' }],
    subcategory: [{ required: true, message: 'Please select a subcategory', trigger: 'change' }],
    title: [{ required: true, message: 'Please enter a title', trigger: 'blur' }],
    description: [{ required: true, message: 'Please enter a description', trigger: 'blur' }],
    priority: [{ required: true, message: 'Please select a priority', trigger: 'change' }],
    facility: [{ required: true, message: 'Please select a facility', trigger: 'change' }]
};

// Loading states
const loadingCategories = ref(false);
const loadingSubCategories = ref(false);
const loadingPriorities = ref(false);
const loadingFacilities = ref(false);
const loadingFloors = ref(false);

// Options for selects
const categoryOptions = computed(() => 
    categories.value.map(c => ({ label: c.name, value: c.id }))
);

const subCategoryOptions = computed(() => 
    subCategories.value.map(s => ({ label: s.name, value: s.id }))
);

const priorityOptions = computed(() => 
    priorities.value.map(p => ({ label: p.label, value: p.id }))
);

const facilityOptions = computed(() => 
    facilities.value.map(f => ({ label: f.name, value: f.id }))
);

const floorOptions = ref<{ label: string; value: string }[]>([]);
const towerOptions = ref<{ label: string; value: string }[]>([]);

// Handlers
const openCreateModal = async () => {
    showCreateModal.value = true;
    await Promise.all([
        loadCategories(),
        loadPriorities(),
        facilityStore.fetchFacilities()
    ]);
};

const closeCreateModal = () => {
    showCreateModal.value = false;
    createForm.value = {
        category: undefined,
        subcategory: undefined,
        title: '',
        description: '',
        priority: undefined,
        facility: undefined,
        tower: undefined,
        floor: undefined,
        location_text: ''
    };
    towerOptions.value = [];
    floorOptions.value = [];
    formRef.value?.resetFields();
};

const loadCategories = async () => {
    loadingCategories.value = true;
    try {
        await helpdeskStore.fetchCategories();
    } finally {
        loadingCategories.value = false;
    }
};

const loadPriorities = async () => {
    loadingPriorities.value = true;
    try {
        await helpdeskStore.fetchPriorities();
    } finally {
        loadingPriorities.value = false;
    }
};

const handleCategoryChange = async () => {
    createForm.value.subcategory = undefined;
    if (createForm.value.category) {
        loadingSubCategories.value = true;
        try {
            await helpdeskStore.fetchSubCategories(createForm.value.category);
        } finally {
            loadingSubCategories.value = false;
        }
    }
};

const handleFacilityChange = async () => {
    createForm.value.floor = undefined;
    towerOptions.value = [];
    floorOptions.value = [];
    if (createForm.value.facility) {
        loadingFloors.value = true;
        try {
            const facilityService = useFacilityService();
            const towers = await facilityService.getTowers(createForm.value.facility);
            
            towerOptions.value = towers.map(t => ({ label: t.name, value: t.id }));
            
            const allFloors: { label: string; value: string }[] = [];
            for (const tower of towers) {
                const floors = await facilityService.getFloors(tower.id);
                floors.forEach(floor => {
                    allFloors.push({ label: `${tower.name} - ${floor.name}`, value: floor.id });
                });
            }
            floorOptions.value = allFloors;
        } catch (error) {
            console.error('Error fetching towers/floors:', error);
        } finally {
            loadingFloors.value = false;
        }
    }
};

const handleCreateTicket = async () => {
    try {
        await formRef.value?.validate();
        await helpdeskStore.createTicket({
            category: createForm.value.category!,
            subcategory: createForm.value.subcategory!,
            title: createForm.value.title,
            description: createForm.value.description,
            priority: createForm.value.priority!,
            facility: createForm.value.facility!,
            tower: createForm.value.tower,
            floor: createForm.value.floor,
            location_text: createForm.value.location_text,
            company: null
        });
        message.success('Ticket created successfully');
        closeCreateModal();
    } catch (err: any) {
        if (err.errorFields) {
            return;
        }
        message.error(err.message || 'Failed to create ticket');
    }
};

// State
const activeTab = ref('all');
const searchText = ref('');
const facilityFilter = ref<string | undefined>(undefined);

const columns = [
    { title: 'Ticket ID', dataIndex: 'ticket_number', key: 'ticket_number', width: 140 },
    { title: 'Title', dataIndex: 'title', key: 'title' },
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Subcategory', dataIndex: 'subcategory_name', key: 'subcategory_name' },
    { title: 'Priority', dataIndex: ['priority', 'label'], key: 'priority', width: 100 },
    { title: 'Status', dataIndex: ['state', 'label'], key: 'state', width: 120 },
    { title: 'Created', dataIndex: 'created_at', key: 'created_at', width: 150 },
    { title: '', key: 'actions', width: 50 }
];

// Ticket counts per status for tab badges
const ticketCounts = computed(() => {
    return { 
        priority: priorityCount.value, 
        open: openCount.value, 
        inprogress: inprogressCount.value, 
        pending: pendingCount.value, 
        closed: closedCount.value,
        all: allCount.value
    };
});

// Methods
const handleTabChange = async () => {
    await fetchTicketsByFilter();
};

const handleFacilityFilterChange = async () => {
    await fetchTicketsByFilter();
};

const fetchTicketsByFilter = async () => {
    const params: TicketListParams = { page: 1 };
    
    if (activeTab.value === 'priority') {
        await helpdeskStore.fetchPriorityTickets(1, pageSize.value, facilityFilter.value);
        return;
    } else if (activeTab.value === 'open') {
        params.states = 'open';
    } else if (activeTab.value === 'inprogress') {
        params.states = 'inprogress';
    } else if (activeTab.value === 'pending') {
        params.states = 'pending_confirmation';
    } else if (activeTab.value === 'closed') {
        params.states = 'closed';
    } else if (activeTab.value === 'all') {
        // Fetch all tickets without state filter
    }
    
    if (facilityFilter.value) {
        params.facility_id = facilityFilter.value;
    }
    
    await helpdeskStore.fetchTickets(params);
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

// Pagination config
const paginationConfig = computed(() => ({
    total: count.value,
    current: page.value,
    pageSize: pageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: handlePageChange,
}));

const handlePageChange = async (pageNum: number, newPageSize: number) => {
    const params: TicketListParams = { page: pageNum };
    if (activeTab.value === 'open') {
        params.states = 'open';
    } else if (activeTab.value === 'inprogress') {
        params.states = 'inprogress';
    } else if (activeTab.value === 'pending') {
        params.states = 'pending_confirmation';
    } else if (activeTab.value === 'closed') {
        params.states = 'closed';
    } else if (activeTab.value === 'priority') {
        await helpdeskStore.fetchPriorityTickets(pageNum, newPageSize, facilityFilter.value);
        return;
    }
    if (facilityFilter.value) {
        params.facility_id = facilityFilter.value;
    }
    if (newPageSize !== pageSize.value) {
        params.page_size = newPageSize;
    }
    await helpdeskStore.fetchTickets(params);
};

const handleCloseTicket = async (record: any) => {
    try {
        await helpdeskStore.confirmCloseTicket(record.id)
        message.success('Ticket closed successfully')
        await fetchTicketsByFilter()
    } catch (error) {
        message.error('Failed to close ticket')
    }
}

// Initialization
onMounted(async () => {
    await Promise.all([
        fetchTicketsByFilter(),
        helpdeskStore.fetchTicketCounts(),
        facilityStore.fetchFacilities()
    ]);
});
</script>
