<template>
    <div class="p-6">
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

        <a-card :bordered="false" class="shadow-sm">
            <a-tabs v-model:activeKey="activeTab" @change="handleTabChange">
                <a-tab-pane key="all" tab="All Tickets" />
                <a-tab-pane key="open" tab="Open" />
                <a-tab-pane key="active" tab="Active" />
                <a-tab-pane key="closed" tab="Closed" />
            </a-tabs>

            <div class="flex justify-between items-center mb-4 mt-2">
                <div class="flex gap-4 items-center">
                    <a-input-search v-model:value="searchText" placeholder="Search tickets..." style="width: 250px" />

                    <a-select v-model:value="facilityFilter" placeholder="Filter by Facility" style="width: 200px"
                        allow-clear>
                        <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">{{ fac.name
                            }}</a-select-option>
                    </a-select>
                </div>

                <a-button>
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    Export
                </a-button>
            </div>

            <a-table :columns="columns" :data-source="filteredTickets" :loading="loading"
                :pagination="{ pageSize: 10, showSizeChanger: true }" row-key="id">
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
            </a-table>
        </a-card>
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
