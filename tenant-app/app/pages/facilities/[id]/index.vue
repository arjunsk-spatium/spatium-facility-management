<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo('/facilities')">Facilities</span>
                <span>/</span>
                <span class="text-gray-900 dark:text-gray-200">{{ facility?.name || 'Loading...' }}</span>
            </div>
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold dark:text-white">{{ facility?.name }}</h1>
                <div v-if="facility" class="flex gap-2">
                    <a-button @click="handleGenerateQRCode" :loading="generatingQR">
                        <QrcodeOutlined /> QR Code
                    </a-button>
                    <a-button type="primary" @click="navigateTo(`/facilities/${facilityId}/edit`)">
                        <EditOutlined /> Edit Facility
                    </a-button>
                </div>
            </div>
        </div>

        <!-- Loading State -->
        <AppLoader v-if="loading" message="Loading Facility Details..." />

        <div v-else-if="!facility" class="text-center py-12">
            <p class="text-red-500">Facility not found</p>
            <a-button class="mt-4" @click="navigateTo('/facilities')">Back to Facilities</a-button>
        </div>

        <!-- Content -->
        <div v-else class="bg-white dark:bg-[#1a1a1a] p-4 rounded-lg shadow-sm">
            <a-tabs v-model:activeKey="activeTab">
                <!-- Tab 1: Structure -->
                <a-tab-pane key="structure" tab="Structure">
                    <div class="space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <!-- Basic Info -->
                            <a-card title="Location Details" >
                                <div class="space-y-2">
                                    <p><span class="text-gray-500">Address:</span> {{ facility.address }}</p>
                                    <p><span class="text-gray-500">City:</span> {{ facility.city_details?.name || 'N/A' }}</p>
                                    <p><span class="text-gray-500">State:</span> {{ facility.state_details?.name || 'N/A' }}</p>
                                    <p><span class="text-gray-500">Country:</span> {{ facility.country_details?.name || 'N/A' }}</p>
                                    <p><span class="text-gray-500">Zone:</span> {{ facility.zone_details?.name || 'N/A' }}</p>
                                </div>
                            </a-card>

                            <!-- Stats -->
                            <a-card title="Overview" >
                                <template #extra>
                                    <a-button v-if="facility?.has_towers" type="link" @click="openAddTowerModal">
                                        <PlusOutlined /> Add Tower
                                    </a-button>
                                </template>
                                <div class="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div class="text-2xl font-bold">{{ towers.length }}</div>
                                        <div class="text-xs text-gray-500">Towers</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold">{{ facility.has_towers ? 'Yes' : 'No' }}</div>
                                        <div class="text-xs text-gray-500">Multi-Building</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold">{{ totalFloorCount }}</div>
                                        <div class="text-xs text-gray-500">Total Floors</div>
                                    </div>
                                </div>
                            </a-card>
                        </div>


                        <!-- Towers List -->
                        <div v-if="facility?.has_towers">
                            <h3 class="text-lg font-medium mb-4">Towers</h3>
                            <div v-if="towers.length === 0" class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p class="text-gray-500">No towers added yet</p>
                                <a-button type="primary" class="mt-4" @click="openAddTowerModal">
                                    <PlusOutlined /> Add First Tower
                                </a-button>
                            </div>

                            <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <a-card v-for="tower in towers" :key="tower.id" size="small" hoverable @click="openTowerDrawer(tower)">
                                    <template #title>
                                        <div class="flex justify-between items-center">
                                            <span class="font-medium">{{ tower.name }}</span>
                                            <EditOutlined class="text-blue-500" />
                                        </div>
                                    </template>
                                    <div class="space-y-3">
                                        <div class="space-y-2">
                                            <p class="text-sm text-gray-500">
                                                <span class="font-medium">{{ tower.floor_count || 0 }}</span> Floors
                                            </p>
                                            <p class="text-xs text-gray-400">
                                                Created: {{ formatDate(tower.created_at) }}
                                            </p>
                                        </div>
                                        <a-button type="default" block @click.stop="openTowerDrawer(tower)">
                                            Manage Floors
                                        </a-button>
                                    </div>
                                </a-card>
                            </div>
                        </div>

                        <!-- Single Building - Floors View -->
                        <div v-else>
                            <div v-if="towers.length > 0">
                                <FacilitiesTowerStructureManager 
                                    :towerId="towers[0].id" 
                                    @refresh="fetchFacilityDetails" 
                                />
                            </div>
                            <div v-else class="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <p class="text-gray-500">Structure not initialized.</p>
                                <p class="text-xs mt-2 text-gray-400 mb-4">Please initialize the structure to manage floors.</p>
                                <a-button type="primary" @click="initializeDefaultTower" :loading="submitting">
                                    Initialize Structure
                                </a-button>
                            </div>
                        </div>
                    </div>
                </a-tab-pane>

                <!-- Tab 2: Details -->
                <a-tab-pane key="details" tab="Details">
                    <div class="space-y-4">
                        <a-descriptions bordered :column="{ xs: 1, sm: 2 }">
                            <a-descriptions-item label="Facility ID">{{ facility?.id }}</a-descriptions-item>
                            <a-descriptions-item label="Tenant ID">{{ facility?.tenant }}</a-descriptions-item>
                            <a-descriptions-item label="Postal Code">{{ facility?.postal_code || 'N/A' }}</a-descriptions-item>
                            <a-descriptions-item label="Created At">{{ formatDate(facility?.created_at) }}</a-descriptions-item>
                            <a-descriptions-item label="Updated At">{{ formatDate(facility?.updated_at) }}</a-descriptions-item>
                            <a-descriptions-item label="Archived">{{ facility?.is_archive ? 'Yes' : 'No' }}</a-descriptions-item>
                        </a-descriptions>
                    </div>
                </a-tab-pane>

                <!-- Tab 3: Staff -->
                <a-tab-pane key="staff" tab="Staff">
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium">Facility Staff</h3>
                            <a-button type="primary" @click="openAddStaffModal">
                                <PlusOutlined /> Add Staff
                            </a-button>
                        </div>

                        <a-table
                            :columns="staffColumns"
                            :data-source="staffList"
                            :loading="loadingStaff"
                            :pagination="{ pageSize: 10 }"
                            row-key="id"
                        >
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'full_name'">
                                    <div class="font-medium">{{ record.full_name }}</div>
                                </template>
                                <template v-else-if="column.key === 'email'">
                                    {{ record.email }}
                                </template>
                                <template v-else-if="column.key === 'phone_number'">
                                    {{ record.phone_number || 'N/A' }}
                                </template>
                                <template v-else-if="column.key === 'status'">
                                    <a-tag :color="record.status === 'active' ? 'green' : 'default'">
                                        {{ record.status }}
                                    </a-tag>
                                </template>
                                <template v-else-if="column.key === 'actions'">
                                    <a-popconfirm
                                        title="Are you sure you want to delete this staff?"
                                        ok-text="Yes"
                                        cancel-text="No"
                                        @confirm="handleDeleteStaff(record.id)"
                                    >
                                        <a-button type="text" danger size="small">
                                            <DeleteOutlined />
                                        </a-button>
                                    </a-popconfirm>
                                </template>
                            </template>
                        </a-table>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </div>

        <!-- Add Tower Modal -->
        <a-modal v-model:open="isAddTowerModalOpen" title="Add Tower" @ok="handleAddTower"
            :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Tower Name" required>
                    <a-input v-model:value="towerForm.name" placeholder="e.g. Tower A" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Tower Details Drawer -->
        <FacilitiesTowerDetailsDrawer 
            :open="isTowerDrawerOpen" 
            :tower="selectedTower" 
            @close="isTowerDrawerOpen = false" 
            @refresh="fetchFacilityDetails" 
        />

        <!-- Add Staff Modal -->
        <a-modal
            v-model:open="isAddStaffModalOpen"
            title="Add Staff"
            :confirm-loading="submittingStaff"
            @ok="handleAddStaff"
            @cancel="isAddStaffModalOpen = false"
        >
            <a-form layout="vertical" class="mt-4">
                <a-form-item label="Full Name" required>
                    <a-input v-model:value="staffForm.full_name" placeholder="Enter full name" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="staffForm.email" placeholder="Enter email" type="email" />
                </a-form-item>
                <a-form-item label="Phone Number">
                    <a-input v-model:value="staffForm.phone_number" placeholder="Enter phone number" />
                </a-form-item>
                <a-form-item label="Username" required>
                    <a-input v-model:value="staffForm.username" placeholder="Enter username" />
                </a-form-item>
                <a-form-item label="Password" required>
                    <a-input-password v-model:value="staffForm.password" placeholder="Enter password" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useFacilityStore } from '../../../../stores/facility';
import { useHelpdeskService } from '../../../../composables/helpdeskService';
import type { Tower } from '../../../../composables/facilityService';
import AppLoader from '../../../../components/AppLoader.vue';
import FacilitiesTowerStructureManager from '../../../../components/facilities/TowerStructureManager.vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const facilityId = route.params.id as string;
const facilityStore = useFacilityStore();

const loading = ref(true);
const towers = ref<Tower[]>([]);

// Add Tower Modal
const isAddTowerModalOpen = ref(false);
const submitting = ref(false);
const towerForm = ref({
    name: ''
});

// Tower Drawer
const isTowerDrawerOpen = ref(false);
const selectedTower = ref<Tower | null>(null);

const openTowerDrawer = (tower: Tower) => {
    selectedTower.value = tower;
    isTowerDrawerOpen.value = true;
};


const facility = computed(() => facilityStore.currentFacility);

const generatingQR = ref(false);
const handleGenerateQRCode = async () => {
    if (!facility.value) return;
    generatingQR.value = true;
    try {
        await facilityStore.generateFacilityQRCode(facility.value.id, facility.value.name);
        message.success('QR Code generated successfully');
    } catch (error) {
        message.error('Failed to generate QR Code');
    } finally {
        generatingQR.value = false;
    }
};

const totalFloorCount = computed(() => {
    return towers.value.reduce((acc, tower) => acc + (tower.floor_count || 0), 0);
});

const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    return dayjs(dateStr).format('DD MMM YYYY, HH:mm');
};

const fetchFacilityDetails = async () => {
    loading.value = true;
    try {
        await facilityStore.fetchFacilityById(facilityId);
        towers.value = facilityStore.towers;
    } catch (e) {
        console.error('Failed to load facility', e);
        message.error('Failed to load facility details');
    } finally {
        loading.value = false;
    }
};

const openAddTowerModal = () => {
    towerForm.value.name = '';
    isAddTowerModalOpen.value = true;
};

const handleAddTower = async () => {
    if (!towerForm.value.name) {
        message.error('Please enter a tower name');
        return;
    }

    submitting.value = true;
    try {
        await facilityStore.createTower({
            facility: facilityId,
            name: towerForm.value.name
        });

        // Refresh towers
        await facilityStore.fetchTowers(facilityId);
        towers.value = facilityStore.towers;

        isAddTowerModalOpen.value = false;
        message.success('Tower added successfully');
    } catch (e) {
        console.error('Failed to add tower', e);
        message.error('Failed to add tower');
    } finally {
        submitting.value = false;
    }
};

const initializeDefaultTower = async () => {
    submitting.value = true;
    try {
        await facilityStore.createTower({
            facility: facilityId,
            name: 'Main Building'
        });

        // Refresh towers
        await facilityStore.fetchTowers(facilityId);
        towers.value = facilityStore.towers;
        message.success('Structure initialized');
    } catch (e) {
        console.error('Failed to initialize structure', e);
        message.error('Failed to initialize structure');
    } finally {
        submitting.value = false;
    }
};

// Staff management
const staffList = ref<any[]>([]);
const loadingStaff = ref(false);
const isAddStaffModalOpen = ref(false);
const submittingStaff = ref(false);

const staffForm = ref({
    full_name: '',
    email: '',
    phone_number: '',
    username: '',
    password: ''
});

const staffColumns = [
    { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Actions', key: 'actions', width: 80 }
];

const fetchStaff = async () => {
    loadingStaff.value = true;
    try {
        const service = useHelpdeskService();
        staffList.value = await service.getStaffByFacility(facilityId);
    } catch (e) {
        console.error('Failed to load staff', e);
    } finally {
        loadingStaff.value = false;
    }
};

const openAddStaffModal = () => {
    staffForm.value = {
        full_name: '',
        email: '',
        phone_number: '',
        username: '',
        password: ''
    };
    isAddStaffModalOpen.value = true;
};

const handleAddStaff = async () => {
    if (!staffForm.value.full_name || !staffForm.value.email || !staffForm.value.username || !staffForm.value.password) {
        message.error('Please fill in all required fields');
        return;
    }

    submittingStaff.value = true;
    try {
        const service = useHelpdeskService();
        await service.createStaff({
            ...staffForm.value,
            facility_id: facilityId
        });
        message.success('Staff added successfully');
        isAddStaffModalOpen.value = false;
        await fetchStaff();
    } catch (e) {
        console.error('Failed to add staff', e);
        message.error('Failed to add staff');
    } finally {
        submittingStaff.value = false;
    }
};

const handleDeleteStaff = async (id: string) => {
    try {
        const service = useHelpdeskService();
        await service.deleteStaff(id);
        message.success('Staff deleted successfully');
        await fetchStaff();
    } catch (e) {
        console.error('Failed to delete staff', e);
        message.error('Failed to delete staff');
    }
};

const activeTab = ref('structure');

watch(activeTab, (newTab) => {
    if (newTab === 'staff') {
        fetchStaff();
    }
});

onMounted(() => {
    fetchFacilityDetails();
});
</script>
