<template>
    <div class="space-y-6">
        <!-- Floors Header -->
        <div class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
            <div>
                <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Floors</h3>
                <p class="text-sm text-gray-500 dark:text-gray-400">{{ floors.length }} floors configured</p>
            </div>
            <a-button type="primary" @click="isAddFloorModalOpen = true">
                <template #icon><PlusOutlined /></template>
                Add Floor
            </a-button>
        </div>

        <div v-if="loading" class="flex justify-center py-8">
            <a-spin />
        </div>

        <!-- Floors List -->
        <div v-else-if="floors.length === 0" class="text-center text-gray-500 py-8 border-2 border-dashed rounded-lg bg-white dark:bg-transparent">
            <p class="text-lg mb-2">No floors found</p>
            <p class="text-sm mb-4">Add a floor to start configuring wings.</p>
            <a-button type="primary" @click="isAddFloorModalOpen = true">
                <template #icon><PlusOutlined /></template>
                Add First Floor
            </a-button>
        </div>

        <a-collapse v-else v-model:activeKey="activeFloorKeys" accordion>
            <a-collapse-panel v-for="floor in floors" :key="floor.id">
                <template #header>
                    <span class="font-medium">{{ floor.name }}</span>
                </template>
                <template #extra>
                    <a-space @click.stop>
                        <a-button type="text" size="small" @click.stop="openEditFloor(floor)">
                            <EditOutlined class="text-blue-500" />
                        </a-button>
                        <a-popconfirm
                            title="Are you sure you want to delete this floor?"
                            ok-text="Yes"
                            cancel-text="No"
                            @confirm="handleDeleteFloor(floor.id)"
                        >
                            <a-button type="text" size="small" @click.stop>
                                <DeleteOutlined class="text-red-500" />
                            </a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
                
                <!-- Wings Section -->
                <div class="space-y-4">
                    <div class="flex justify-between items-center border-b pb-2 mb-2">
                            <span class="text-sm font-medium text-gray-500">Wings</span>
                            <a-button type="dashed" size="small" @click="openAddWing(floor)">
                            <template #icon><PlusOutlined /></template>
                            Add Wing
                            </a-button>
                    </div>
                    
                    <div v-if="!floor.wings || floor.wings.length === 0" class="text-sm text-gray-400 italic py-2">
                        No wings configured for this floor.
                    </div>
                    <div v-else class="grid grid-cols-2 gap-2">
                            <div v-for="wing in floor.wings" :key="wing.id" 
                                class="flex justify-between items-center px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded border dark:border-gray-600 text-sm group">
                                <div class="flex items-center">
                                    <span class="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                                    {{ wing.name }}
                                </div>
                                <a-space class="opacity-0 group-hover:opacity-100">
                                    <a-button type="text" size="small" @click.stop="openEditWing(wing)">
                                        <EditOutlined class="text-blue-500" />
                                    </a-button>
                                    <a-popconfirm
                                        title="Are you sure you want to delete this wing?"
                                        ok-text="Yes"
                                        cancel-text="No"
                                        @confirm="handleDeleteWing(wing.id)"
                                    >
                                        <a-button type="text" size="small" @click.stop>
                                            <DeleteOutlined class="text-red-500" />
                                        </a-button>
                                    </a-popconfirm>
                                </a-space>
                            </div>
                    </div>
                </div>
            </a-collapse-panel>
        </a-collapse>

        <!-- Add Floor Modal -->
        <a-modal v-model:open="isAddFloorModalOpen" title="Add Floor" @ok="handleAddFloor" :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Floor Name" required>
                    <a-input v-model:value="floorForm.name" placeholder="e.g. Floor 1, Ground Floor" @pressEnter="handleAddFloor" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Edit Floor Modal -->
        <a-modal v-model:open="isEditFloorModalOpen" title="Edit Floor" @ok="handleUpdateFloor" :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Floor Name" required>
                    <a-input v-model:value="editFloorForm.name" placeholder="Floor Name" @pressEnter="handleUpdateFloor" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Add Wing Modal -->
        <a-modal v-model:open="isAddWingModalOpen" :title="`Add Wing to ${selectedFloor?.name}`" @ok="handleAddWing" :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Wing Name" required>
                    <a-input v-model:value="wingForm.name" placeholder="e.g. North Wing, Wing A" @pressEnter="handleAddWing" />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Edit Wing Modal -->
        <a-modal v-model:open="isEditWingModalOpen" title="Edit Wing" @ok="handleUpdateWing" :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Wing Name" required>
                    <a-input v-model:value="editWingForm.name" placeholder="Wing Name" @pressEnter="handleUpdateWing" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { useFacilityService } from '../../composables/facilityService';
import type { Floor, Wing } from '../../composables/facilityService';

const props = defineProps<{
    towerId: string | undefined; // Undefined safe
}>();

const emit = defineEmits(['refresh']);

const facilityService = useFacilityService();

const loading = ref(false);
const floors = ref<Floor[]>([]);
const activeFloorKeys = ref<string[]>([]);
const submitting = ref(false);

// Modals State
const isAddFloorModalOpen = ref(false);
const isEditFloorModalOpen = ref(false);
const isAddWingModalOpen = ref(false);

const floorForm = ref({ name: '' });
const editFloorForm = ref({ id: '', name: '' });
const wingForm = ref({ name: '' });
const editWingForm = ref({ id: '', name: '' });
const selectedFloor = ref<Floor | null>(null);
const isEditWingModalOpen = ref(false);

const fetchFloors = async () => {
    if (!props.towerId) return;
    loading.value = true;
    try {
        const results = await facilityService.getFloors(props.towerId);
        
        // Fetch wings for all floors in parallel
        const floorsWithWings = await Promise.all(results.map(async (f: Floor) => {
             if (!f.wings) {
                 try {
                    const wings = await facilityService.getWings(f.id);
                    return { ...f, wings };
                 } catch (e) {
                     return { ...f, wings: [] };
                 }
             }
             return f;
        }));
        
        floors.value = floorsWithWings;
    } catch (e) {
        console.error('Failed to fetch floors', e);
        message.error('Failed to load local floors');
    } finally {
        loading.value = false;
    }
}

watch(() => props.towerId, (newId) => {
    if (newId) {
        fetchFloors();
    } else {
        floors.value = [];
    }
}, { immediate: true });

const handleAddFloor = async () => {
    if (!floorForm.value.name || !props.towerId) return;
    submitting.value = true;
    try {
        await facilityService.createFloor({
            tower: props.towerId,
            name: floorForm.value.name
        });
        message.success('Floor added');
        isAddFloorModalOpen.value = false;
        floorForm.value.name = '';
        fetchFloors(); // Refresh
        emit('refresh'); // Tell parent to refresh tower stats
    } catch (e) {
        message.error('Failed to create floor');
    } finally {
        submitting.value = false;
    }
};

const openEditFloor = (floor: Floor) => {
    editFloorForm.value = { id: floor.id, name: floor.name };
    isEditFloorModalOpen.value = true;
};

const handleUpdateFloor = async () => {
    if (!editFloorForm.value.name || !props.towerId) return;
    submitting.value = true;
    try {
        await facilityService.updateFloor(editFloorForm.value.id, {
            tower: props.towerId,
            name: editFloorForm.value.name
        });
        message.success('Floor updated');
        isEditFloorModalOpen.value = false;
        fetchFloors();
    } catch (e) {
        message.error('Failed to update floor');
    } finally {
        submitting.value = false;
    }
};

const handleDeleteFloor = async (id: string) => {
    try {
        await facilityService.deleteFloor(id);
        message.success('Floor deleted');
        fetchFloors();
        emit('refresh');
    } catch (e) {
        message.error('Failed to delete floor');
    }
};

const openAddWing = (floor: Floor) => {
    selectedFloor.value = floor;
    wingForm.value.name = '';
    isAddWingModalOpen.value = true;
};

const handleAddWing = async () => {
    if (!wingForm.value.name || !selectedFloor.value) return;
    submitting.value = true;
    try {
        await facilityService.createWing({
            floor: selectedFloor.value.id,
            name: wingForm.value.name
        });
        message.success('Wing added');
        isAddWingModalOpen.value = false;
        fetchFloors();
    } catch (e) {
         message.error('Failed to create wing');
    } finally {
        submitting.value = false;
    }
};

const openEditWing = (wing: Wing) => {
    selectedFloor.value = floors.value.find(f => f.wings.some(w => w.id === wing.id)) || null;
    editWingForm.value = { id: wing.id, name: wing.name };
    isEditWingModalOpen.value = true;
};

const handleUpdateWing = async () => {
    if (!editWingForm.value.name || !selectedFloor.value) return;
    submitting.value = true;
    try {
        await facilityService.updateWing(editWingForm.value.id, {
            floor: selectedFloor.value.id,
            name: editWingForm.value.name
        });
        message.success('Wing updated');
        isEditWingModalOpen.value = false;
        fetchFloors();
    } catch (e) {
        message.error('Failed to update wing');
    } finally {
        submitting.value = false;
    }
};

const handleDeleteWing = async (id: string) => {
    try {
        await facilityService.deleteWing(id);
        message.success('Wing deleted');
        fetchFloors();
    } catch (e) {
        message.error('Failed to delete wing');
    }
};
</script>
