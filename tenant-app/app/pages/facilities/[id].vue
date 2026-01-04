<template>
    <div class="p-6">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo('/facilities')">Facilities</span>
                <span>/</span>
                <span class="text-gray-900 dark:text-gray-200">{{ facility?.name || 'Loading...' }}</span>
            </div>
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold dark:text-white">{{ facility?.name }}</h1>
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
                            <a-card title="Location Details" :bordered="false" class="bg-gray-50 dark:bg-gray-800">
                                <div class="space-y-2">
                                    <p><span class="text-gray-500">Address:</span> {{ facility.location.address }}</p>
                                    <p><span class="text-gray-500">City:</span> {{ facility.location.city }}, {{
                                        facility.location.state }}</p>
                                    <p><span class="text-gray-500">Country:</span> {{ facility.location.country }}</p>
                                </div>
                            </a-card>

                            <!-- Stats -->
                            <a-card title="Overview" :bordered="false" class="bg-gray-50 dark:bg-gray-800">
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
                            <h3 class="text-lg font-medium">Staff Members</h3>
                            <a-button type="primary" @click="showAddStaffModal">
                                <template #icon>
                                    <PlusOutlined />
                                </template> Add Staff
                            </a-button>
                        </div>

                        <a-table :dataSource="facility.staff" :columns="staffColumns" :pagination="{ pageSize: 5 }">
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'role'">
                                    <a-tag color="blue">{{ record.role }}</a-tag>
                                </template>
                            </template>
                        </a-table>
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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFacilityStore } from '../../../stores/facility';
import { useFacilityService } from '../../../composables/facilityService';
import AppLoader from '../../../components/AppLoader.vue';
import { PlusOutlined } from '@ant-design/icons-vue';

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
