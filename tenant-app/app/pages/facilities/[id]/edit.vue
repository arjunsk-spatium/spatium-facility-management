<template>
    <div class="p-6">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo('/facilities')">Facilities</span>
                <span>/</span>
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo(`/facilities/${facilityId}`)">{{
                    facility?.name || 'Loading...' }}</span>
                <span>/</span>
                <span class="text-gray-900 dark:text-gray-200">Edit</span>
            </div>
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold dark:text-white">Edit Facility</h1>
            </div>
        </div>

        <!-- Loading State -->
        <AppLoader v-if="loading" message="Loading Facility..." />

        <div v-else-if="!facility" class="text-center py-12">
            <p class="text-red-500">Facility not found</p>
            <a-button class="mt-4" @click="navigateTo('/facilities')">Back to Facilities</a-button>
        </div>

        <!-- Edit Form -->
        <div v-else class="bg-white dark:bg-[#1a1a1a] p-6 rounded-lg shadow-sm max-w-4xl">
            <a-form layout="vertical">
                <!-- Basic Info Section -->
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 dark:text-white">Basic Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a-form-item label="Facility Name" required>
                            <a-input v-model:value="formData.name" placeholder="Enter facility name" />
                        </a-form-item>
                    </div>
                </div>

                <!-- Location Section -->
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 dark:text-white">Location Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a-form-item label="Address" required>
                            <a-input v-model:value="formData.location.address" placeholder="Street address" />
                        </a-form-item>
                        <a-form-item label="City" required>
                            <a-input v-model:value="formData.location.city" placeholder="City" />
                        </a-form-item>
                        <a-form-item label="State" required>
                            <a-input v-model:value="formData.location.state" placeholder="State/Province" />
                        </a-form-item>
                        <a-form-item label="Country" required>
                            <a-input v-model:value="formData.location.country" placeholder="Country" />
                        </a-form-item>
                    </div>
                </div>

                <!-- Structure Section -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold dark:text-white">Structure (Towers, Floors, Wings)</h2>
                        <a-button type="primary" @click="openManageStructureModal">
                            <EditOutlined /> Manage Structure
                        </a-button>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold dark:text-white">{{ formData.towers.length }}</div>
                                <div class="text-xs text-gray-500">Towers</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold dark:text-white">{{ totalFloors }}</div>
                                <div class="text-xs text-gray-500">Floors</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold dark:text-white">{{ totalWings }}</div>
                                <div class="text-xs text-gray-500">Wings</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Amenities Section -->
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 dark:text-white">Amenities</h2>
                    <a-select v-model:value="formData.amenities" mode="multiple" placeholder="Select amenities"
                        style="width: 100%">
                        <a-select-option value="Parking">Parking</a-select-option>
                        <a-select-option value="Gym">Gym</a-select-option>
                        <a-select-option value="Cafeteria">Cafeteria</a-select-option>
                        <a-select-option value="Conference Rooms">Conference Rooms</a-select-option>
                        <a-select-option value="Security">24/7 Security</a-select-option>
                        <a-select-option value="EV Charging">EV Charging</a-select-option>
                    </a-select>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-6 mt-4">
                    <a-button @click="navigateTo(`/facilities/${facilityId}`)">Cancel</a-button>
                    <a-button type="primary" :loading="saving" @click="handleSave">
                        Save Changes
                    </a-button>
                </div>
            </a-form>
        </div>

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
                    <a-card v-for="(tower, tIndex) in formData.towers" :key="tIndex" size="small" :bordered="false"
                        class="border-l-4 border-l-green-500 bg-gray-50 dark:bg-gray-800">
                        <template #title>
                            <div class="flex items-center gap-2">
                                <a-input v-model:value="tower.name" class="font-bold max-w-[200px]" :bordered="false" />
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
                                    <a-input v-model:value="floor.name" class="max-w-[150px]" size="small"
                                        :bordered="false" />
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
                    <a-button @click="isManageStructureModalOpen = false">Done</a-button>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFacilityService } from '../../../../composables/facilityService';
import AppLoader from '../../../../components/AppLoader.vue';
import { PlusOutlined, EditOutlined, DeleteOutlined, CloseCircleOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const facilityId = route.params.id as string;
const facilityService = useFacilityService();

const loading = ref(true);
const saving = ref(false);
const facility = ref<any>(null);
const isManageStructureModalOpen = ref(false);

const formData = reactive({
    name: '',
    location: {
        address: '',
        city: '',
        state: '',
        country: ''
    },
    amenities: [] as string[],
    hasTowers: false,
    towers: [] as any[],
    staff: [] as any[]
});

const totalFloors = computed(() => {
    return formData.towers.reduce((acc: number, tower: any) => acc + tower.floors.length, 0);
});

const totalWings = computed(() => {
    return formData.towers.reduce((acc: number, tower: any) => {
        return acc + tower.floors.reduce((floorAcc: number, floor: any) => floorAcc + floor.wings.length, 0);
    }, 0);
});

const fetchFacility = async () => {
    loading.value = true;
    try {
        const data = await facilityService.getFacilityById(facilityId);
        facility.value = data;

        // Populate form with facility data
        formData.name = data.name;
        formData.location = { ...data.location };
        formData.amenities = [...(data.amenities || [])];
        formData.hasTowers = data.hasTowers;
        formData.towers = JSON.parse(JSON.stringify(data.towers || []));
        formData.staff = [...(data.staff || [])];
    } catch (e) {
        console.error('Failed to load facility', e);
    } finally {
        loading.value = false;
    }
};

const openManageStructureModal = () => {
    isManageStructureModalOpen.value = true;
};

// Tower Operations
const addTower = () => {
    const nextNum = formData.towers.length + 1;
    formData.towers.push({
        id: Date.now().toString(),
        name: `Tower ${String.fromCharCode(64 + nextNum)}`,
        floors: []
    });
};

const removeTower = (index: number) => {
    formData.towers.splice(index, 1);
};

// Floor Operations
const addFloor = (tIndex: number) => {
    const tower = formData.towers[tIndex];
    const nextNum = tower.floors.length + 1;
    tower.floors.push({
        id: Date.now().toString(),
        name: `Floor ${nextNum}`,
        number: nextNum,
        wings: []
    });
};

const removeFloor = (tIndex: number, fIndex: number) => {
    formData.towers[tIndex].floors.splice(fIndex, 1);
};

// Wing Operations
const addWing = (tIndex: number, fIndex: number) => {
    const floor = formData.towers[tIndex].floors[fIndex];
    const nextNum = floor.wings.length + 1;
    floor.wings.push({
        id: Date.now().toString(),
        name: `Wing ${String.fromCharCode(64 + nextNum)}`
    });
};

const removeWing = (tIndex: number, fIndex: number, wIndex: number) => {
    formData.towers[tIndex].floors[fIndex].wings.splice(wIndex, 1);
};

// Save
const handleSave = async () => {
    if (!formData.name) {
        message.error('Please enter a facility name');
        return;
    }

    saving.value = true;
    try {
        await facilityService.updateFacility(facilityId, {
            name: formData.name,
            location: formData.location,
            amenities: formData.amenities,
            hasTowers: formData.hasTowers,
            towers: formData.towers,
            staff: formData.staff
        });

        message.success('Facility updated successfully');
        navigateTo(`/facilities/${facilityId}`);
    } catch (e) {
        console.error('Failed to update facility', e);
        message.error('Failed to update facility');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchFacility();
});
</script>
