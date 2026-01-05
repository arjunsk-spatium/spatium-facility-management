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
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    New Ticket
                </a-button>
            </div>
        </div>


        <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
            <a-tab-pane key="all" tab="All Tickets" />
            <a-tab-pane key="open" tab="Open" />
            <a-tab-pane key="active" tab="Active" />
            <a-tab-pane key="closed" tab="Closed" />
        </a-tabs>

        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                <a-input-search v-model:value="searchText" placeholder="Search tickets..." class="w-full md:w-64" />

                <a-select v-model:value="facilityFilter" placeholder="Filter by Facility" class="w-full md:w-48"
                    allow-clear>
                    <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">{{ fac.name
                        }}</a-select-option>
                </a-select>
            </div>

            <a-button class="w-full md:w-auto">
                <template #icon>
                    <ExportOutlined />
                </template>
                Export
            </a-button>
        </div>

        <ResponsiveDataView :columns="columns" :data="filteredTickets" :loading="loading" row-key="id">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'id'">
                    <a @click="navigateTo(`/helpdesk/${record.id}`)" class="font-medium hover:underline">{{
                        record.id }}</a>
                </template>

                <template v-if="column.key === 'status'">
                    <StatusBadge :status="record.status" />
                </template>

                <template v-if="column.key === 'priority'">
                    <a-tag :color="getPriorityColor(record.priority)">{{ record.priority }}</a-tag>
                </template>

                <template v-if="column.key === 'createdAt'">
                    {{ new Date(record.createdAt).toLocaleDateString() }}
                    <span class="text-xs text-gray-500 block">{{ new Date(record.createdAt).toLocaleTimeString([],
                        { hour: '2-digit', minute: '2-digit' }) }}</span>
                </template>

                <template v-if="column.key === 'actions'">
                    <a-tooltip title="View Details">
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
                        <StatusBadge :status="record.status" />
                        <span class="text-xs text-gray-500 font-mono">#{{ record.id }}</span>
                    </div>

                    <h4 class="font-bold text-base mb-1 dark:text-white cursor-pointer hover:text-primary-500"
                        @click="navigateTo(`/helpdesk/${record.id}`)">
                        {{ record.subCategory }}
                    </h4>

                    <div class="text-sm text-gray-600 dark:text-gray-400 mb-3 flex flex-wrap gap-2">
                        <span>{{ record.category }}</span>
                        <span class="text-gray-300">•</span>
                        <span>{{ record.facilityName }}</span>
                    </div>

                    <div class="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div class="flex items-center gap-2">
                            <a-tag :color="getPriorityColor(record.priority)" class="!mr-0">{{ record.priority
                                }}</a-tag>
                            <span class="text-xs text-gray-400">{{ new Date(record.createdAt).toLocaleDateString()
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
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHelpdeskStore } from '../../../stores/helpdesk';
import { useFacilityStore } from '../../../stores/facility';
import { storeToRefs } from 'pinia';
import {
    PlusOutlined,
    BarChartOutlined,
    ExportOutlined,
    EyeOutlined
} from '@ant-design/icons-vue';
import StatusBadge from '../../../components/helpdesk/StatusBadge.vue';
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue';

definePageMeta({
    middleware: 'auth'
});

// Stores
const helpdeskStore = useHelpdeskStore();
const facilityStore = useFacilityStore(); // To get facility list for filter
const { tickets, loading } = storeToRefs(helpdeskStore);
const { facilities } = storeToRefs(facilityStore);

// State
const activeTab = ref('all');
const searchText = ref('');
const facilityFilter = ref<string | undefined>(undefined);

// Columns
const columns = [
    { title: 'Ticket ID', dataIndex: 'id', key: 'id', width: 140 },
    { title: 'Category', dataIndex: 'category', key: 'category' },
    { title: 'Subject', dataIndex: 'subCategory', key: 'subCategory' }, // Using subCategory as subject/issue summary
    { title: 'Facility', dataIndex: 'facilityName', key: 'facility' },
    { title: 'Priority', dataIndex: 'priority', key: 'priority', width: 100 },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 120 },
    { title: 'Assigned To', dataIndex: 'assignedTo', key: 'assignedTo' },
    { title: 'Created', dataIndex: 'createdAt', key: 'createdAt', width: 150 },
    { title: '', key: 'actions', width: 50 }
];

// Methods
const handleTabChange = () => {
    // Logic if we were fetching from API based on tab, but we'll filter client side for now with mock data
};

const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
        case 'urgent': return 'red';
        case 'high': return 'orange';
        case 'medium': return 'blue';
        case 'low': return 'green';
        default: return 'default';
    }
};

// Computed Filtered Data
const filteredTickets = computed(() => {
    let result = [...tickets.value];

    // Tab Filter
    if (activeTab.value === 'open') {
        result = result.filter(t => t.status === 'Open');
    } else if (activeTab.value === 'active') {
        result = result.filter(t => ['In Progress'].includes(t.status));
    } else if (activeTab.value === 'closed') {
        result = result.filter(t => ['Resolved', 'Closed'].includes(t.status));
    }

    // Facility Filter
    if (facilityFilter.value) {
        result = result.filter(t => t.facilityId === facilityFilter.value);
    }

    // Search
    if (searchText.value) {
        const query = searchText.value.toLowerCase();
        result = result.filter(t =>
            t.id.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query)
        );
    }

    return result;
});

// Initialization
onMounted(async () => {
    await Promise.all([
        helpdeskStore.fetchTickets(),
        facilityStore.fetchFacilities()
    ]);
});
</script>
