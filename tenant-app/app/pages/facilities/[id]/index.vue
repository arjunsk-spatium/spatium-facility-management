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
                <a-button v-if="facility" type="primary" @click="navigateTo(`/facilities/${facilityId}/edit`)">
                    <EditOutlined /> Edit Facility
                </a-button>
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
                                    <p><span class="text-gray-500">Address:</span> {{ facility.location.address }}</p>
                                    <p><span class="text-gray-500">City:</span> {{ facility.location.city }}, {{
                                        facility.location.state }}</p>
                                    <p><span class="text-gray-500">Country:</span> {{ facility.location.country }}</p>
                                </div>
                            </a-card>

                            <!-- Stats -->
                            <a-card title="Overview" >
                                <template #extra>
                                    <a-button type="link" @click="openManageStructureModal">
                                        <EditOutlined /> Edit
                                    </a-button>
                                </template>
                                <div class="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div class="text-2xl font-bold">{{ facility.towers.length }}</div>
                                        <div class="text-xs text-gray-500">Towers</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold">{{ totalFloors }}</div>
                                        <div class="text-xs text-gray-500">Floors</div>
                                    </div>
                                    <div>
                                        <div class="text-2xl font-bold">{{ facility.staff.length }}</div>
                                        <div class="text-xs text-gray-500">Staff</div>
                                    </div>
                                </div>
                            </a-card>
                        </div>

                        <!-- Towers List -->
                        <div v-if="facility.hasTowers">
                            <h3 class="text-lg font-medium mb-4">Towers & Floors</h3>
                            <a-collapse v-model:activeKey="activeKeys">
                                <a-collapse-panel v-for="(tower, index) in facility.towers" :key="index"
                                    :header="tower.name">
                                    <a-list size="small" :data-source="tower.floors">
                                        <template #renderItem="{ item }">
                                            <a-list-item>
                                                <div class="flex justify-between w-full">
                                                    <span>{{ item.name }}</span>
                                                    <span class="text-xs text-gray-500">{{ item.wings.length }}
                                                        Wings</span>
                                                </div>
                                            </a-list-item>
                                        </template>
                                    </a-list>
                                </a-collapse-panel>
                            </a-collapse>
                        </div>
                    </div>
                </a-tab-pane>

                <!-- Tab 2: Staff -->
                <a-tab-pane key="staff" tab="Staff">
                    <div class="space-y-4">
                        <div class="flex justify-between items-center">
                            <h3 class="text-lg font-medium dark:text-white">Staff Members</h3>
                            <a-button type="primary" @click="showAddStaffModal">
                                <template #icon>
                                    <PlusOutlined />
                                </template> Add Staff
                            </a-button>
                        </div>

                        <ResponsiveDataView :columns="staffColumns" :data="facility.staff" :pagination="{ pageSize: 5 }"
                            row-key="id">
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'role'">
                                    <a-tag color="green">{{ record.role }}</a-tag>
                                </template>
                            </template>

                            <template #mobileCard="{ record }">
                                <div
                                    class="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                                    <div class="flex items-start justify-between mb-3">
                                        <div>
                                            <h4 class="font-semibold text-gray-900 dark:text-white">{{ record.name }}
                                            </h4>
                                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.email }}</p>
                                        </div>
                                        <a-tag color="green" class="shrink-0">{{ record.role }}</a-tag>
                                    </div>
                                </div>
                            </template>
                        </ResponsiveDataView>
                    </div>
                </a-tab-pane>
            </a-tabs>
        </div>

        <!-- Add Staff Modal -->
        <a-modal v-model:open="isStaffModalOpen" title="Add Staff Member" @ok="handleAddStaff"
            :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Name" required>
                    <a-input v-model:value="staffForm.name" placeholder="John Doe" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="staffForm.email" placeholder="john@example.com" />
                </a-form-item>
                <a-form-item label="Role" required>
                    <a-select v-model:value="staffForm.role" placeholder="Select Role">
                        <a-select-option value="Manager">Manager</a-select-option>
                        <a-select-option value="Security">Security</a-select-option>
                        <a-select-option value="Maintenance">Maintenance</a-select-option>
                        <a-select-option value="Front Desk">Front Desk</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Manage Structure Modal -->
        <a-modal v-model:open="isManageStructureModalOpen" title="Manage Structure" width="800px" :footer="null">
            <div class="space-y-6">
                <!-- Add Tower -->
                <div class="flex justify-between items-center bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <span class="font-medium text-lg dark:text-gray-200">Towers</span>
                    <a-button type="primary" @click="addTower">
                        <PlusOutlined /> Add Tower
                    </a-button>
                </div>

                <div class="space-y-4 max-h-[60vh] overflow-y-auto">
                    <a-card v-for="(tower, tIndex) in tempStructure.towers" :key="tIndex" size="small">
                        <template #title>
                            <div class="flex items-center gap-2">
                                <span class="font-bold cursor-text dark:text-white" contenteditable="true"
                                    @blur="updateTowerName($event, tIndex)">
                                    {{ tower.name }}
                                </span>
                                <EditOutlined class="text-gray-400 text-xs" />
                            </div>
                        </template>
                        <template #extra>
                            <a-popconfirm title="Delete tower?" @confirm="removeTower(tIndex)">
                                <a-button type="text" danger size="small">
                                    <DeleteOutlined />
                                </a-button>
                            </a-popconfirm>
                        </template>

                        <!-- Floors -->
                        <div class="space-y-3">
                            <div class="flex justify-between items-center text-xs text-gray-500 mb-2 pb-1">
                                <span>FLOORS</span>
                                <a-button type="link" size="small" @click="addFloor(tIndex)">+ Add Floor</a-button>
                            </div>

                            <div v-for="(floor, fIndex) in tower.floors" :key="fIndex"
                                class="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm">
                                <div class="flex justify-between items-center mb-2">
                                    <div class="flex items-center gap-2">
                                        <span class="font-medium cursor-text dark:text-gray-200" contenteditable="true"
                                            @blur="updateFloorName($event, tIndex, fIndex)">
                                            {{ floor.name }}
                                        </span>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <a-button type="link" size="small" @click="addWing(tIndex, fIndex)">+
                                            Wing</a-button>
                                        <a-popconfirm title="Delete floor?" @confirm="removeFloor(tIndex, fIndex)">
                                            <CloseCircleOutlined
                                                class="text-red-500 cursor-pointer hover:text-red-400" />
                                        </a-popconfirm>
                                    </div>
                                </div>

                                <!-- Wings Chips -->
                                <div class="flex flex-wrap gap-2">
                                    <span v-if="floor.wings.length === 0" class="text-xs text-gray-400 italic">No wings
                                        added</span>
                                    <a-tag v-for="(wing, wIndex) in floor.wings" :key="wIndex" closable
                                        class="mr-0 mb-1" @close="removeWing(tIndex, fIndex, wIndex)">
                                        {{ wing.name }}
                                    </a-tag>
                                </div>
                            </div>
                        </div>
                    </a-card>
                </div>

                <div class="pt-4 flex justify-end gap-2">
                    <a-button @click="isManageStructureModalOpen = false">Cancel</a-button>
                    <a-button type="primary" :loading="savingStructure" @click="saveStructureChanges">Save
                        Changes</a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFacilityStore } from '../../../../stores/facility';
import { useFacilityService } from '../../../../composables/facilityService';
import AppLoader from '../../../../components/AppLoader.vue';
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const facilityId = route.params.id as string;
const facilityService = useFacilityService();
const facilityStore = useFacilityStore(); // To trigger global updates if needed

const loading = ref(true);
const facility = ref<any>(null);
const activeTab = ref('structure');
const activeKeys = ref([]);

// Manage Structure Logic
const isManageStructureModalOpen = ref(false);
const savingStructure = ref(false);
const tempStructure = ref<any>({ towers: [] });

const openManageStructureModal = () => {
    // Deep clone to avoid mutating reactive state directly before save
    tempStructure.value = JSON.parse(JSON.stringify(facility.value));
    isManageStructureModalOpen.value = true;
};

// Tower Operations
const addTower = () => {
    const nextNum = tempStructure.value.towers.length + 1;
    tempStructure.value.towers.push({
        id: Date.now().toString(),
        name: `Tower ${String.fromCharCode(64 + nextNum)}`, // Tower A, B, etc.
        floors: []
    });
};

const removeTower = (index: number) => {
    tempStructure.value.towers.splice(index, 1);
};

const updateTowerName = (event: Event, index: number) => {
    const el = event.target as HTMLElement;
    tempStructure.value.towers[index].name = el.innerText;
};

// Floor Operations
const addFloor = (tIndex: number) => {
    const tower = tempStructure.value.towers[tIndex];
    const nextNum = tower.floors.length + 1;
    tower.floors.push({
        id: Date.now().toString(),
        name: `Floor ${nextNum}`,
        number: nextNum,
        wings: []
    });
};

const removeFloor = (tIndex: number, fIndex: number) => {
    tempStructure.value.towers[tIndex].floors.splice(fIndex, 1);
};

const updateFloorName = (event: Event, tIndex: number, fIndex: number) => {
    const el = event.target as HTMLElement;
    tempStructure.value.towers[tIndex].floors[fIndex].name = el.innerText;
};

// Wing Operations
const addWing = (tIndex: number, fIndex: number) => {
    const floor = tempStructure.value.towers[tIndex].floors[fIndex];
    const nextNum = floor.wings.length + 1;
    floor.wings.push({
        id: Date.now().toString(),
        name: `Wing ${String.fromCharCode(64 + nextNum)}`
    });
};

const removeWing = (tIndex: number, fIndex: number, wIndex: number) => {
    tempStructure.value.towers[tIndex].floors[fIndex].wings.splice(wIndex, 1);
};

// Save
const saveStructureChanges = async () => {
    savingStructure.value = true;
    try {
        await facilityService.updateFacility(facilityId, tempStructure.value);
        await fetchFacilityDetails(); // Refresh
        isManageStructureModalOpen.value = false;
    } catch (e) {
        console.error('Failed to update structure', e);
    } finally {
        savingStructure.value = false;
    }
};

// Staff Logic
const isStaffModalOpen = ref(false);
const submitting = ref(false);
const staffForm = reactive({
    name: '',
    email: '',
    role: undefined as string | undefined
});

const staffColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Email', dataIndex: 'email', key: 'email' }
];

const totalFloors = computed(() => {
    if (!facility.value) return 0;
    return facility.value.towers.reduce((acc: number, tower: any) => acc + tower.floors.length, 0);
});

const fetchFacilityDetails = async () => {
    loading.value = true;
    try {
        const data = await facilityService.getFacilityById(facilityId);
        facility.value = data;
    } catch (e) {
        console.error('Failed to load facility', e);
    } finally {
        loading.value = false;
    }
};

const showAddStaffModal = () => {
    staffForm.name = '';
    staffForm.email = '';
    staffForm.role = undefined;
    isStaffModalOpen.value = true;
};

const handleAddStaff = async () => {
    if (!staffForm.name || !staffForm.email || !staffForm.role) return;

    submitting.value = true;
    try {
        await facilityService.addStaff(facilityId, {
            name: staffForm.name,
            email: staffForm.email,
            role: staffForm.role
        });

        // Refresh details
        await fetchFacilityDetails();

        isStaffModalOpen.value = false;
    } catch (e) {
        console.error('Failed to add staff', e);
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    fetchFacilityDetails();
});
</script>
