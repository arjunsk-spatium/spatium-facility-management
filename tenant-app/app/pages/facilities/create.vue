<template>
    <div class="space-y-6">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Create Facility</h1>
            <a-button @click="navigateTo('/facilities')">Cancel</a-button>
        </div>
        <div class="flex justify-center">
        <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
            <a-steps :current="currentStep" class="mb-8">
                <a-step title="Basic Info" description="Location & Details" />
                <a-step title="Structure" description="Towers & Floors" />
            </a-steps>

            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 0" class="max-w-3xl mx-auto space-y-8 py-8">
                <a-form layout="vertical" :model="formData">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <a-form-item label="Facility Name" required>
                            <a-input v-model:value="formData.name" placeholder="e.g. Headquarters" size="large" />
                        </a-form-item>
                        <a-form-item label="Address" required>
                            <a-input v-model:value="formData.location.address" placeholder="Street Address"
                                size="large" />
                        </a-form-item>
                        <a-form-item label="City" required>
                            <a-input v-model:value="formData.location.city" placeholder="City" size="large" />
                        </a-form-item>
                        <a-form-item label="State/Province">
                            <a-input v-model:value="formData.location.state" placeholder="State" size="large" />
                        </a-form-item>
                        <a-form-item label="Country" required>
                            <a-input v-model:value="formData.location.country" placeholder="Country" size="large" />
                        </a-form-item>
                    </div>
                </a-form>

                <div class="pt-4 border-t dark:border-gray-700">
                    <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <a-switch v-model:checked="formData.hasTowers" />
                        <div>
                            <div class="font-medium">Multi-Building Complex</div>
                            <div class="text-sm text-gray-500">Enable if this facility has multiple towers/buildings.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 2: Structure -->
            <div v-show="currentStep === 1" class="max-w-4xl mx-auto">
                <div v-if="formData.towers.length === 0" class="text-center py-8">
                    <a-button type="dashed" size="large" @click="addTower">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Add {{ formData.hasTowers ? 'Tower' : 'Main Building' }}
                    </a-button>
                </div>

                <div v-else class="space-y-6">
                    <a-collapse v-model:activeKey="activeTowers" :bordered="false">
                        <a-collapse-panel v-for="(tower, tIndex) in formData.towers" :key="tower.id">
                            <template #header>
                                <div class="flex items-center justify-between w-full pr-4">
                                    <span class="font-medium text-lg">{{ tower.name }}</span>
                                    <DeleteOutlined class="text-red-500 hover:text-red-700"
                                        @click.stop="removeTower(tIndex)" />
                                </div>
                            </template>

                            <div class="space-y-4">
                                <a-input v-model:value="tower.name" addon-before="Name" />

                                <!-- Floors -->
                                <div class="pl-4 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
                                    <div class="flex justify-between items-center">
                                        <h4 class="font-medium text-gray-600 dark:text-gray-400">Floors</h4>
                                        <a-button size="small" type="dashed" @click="addFloor(tIndex)">+ Add
                                            Floor</a-button>
                                    </div>

                                    <div v-if="tower.floors.length === 0" class="text-sm text-gray-400 italic">No floors
                                        added.</div>

                                    <div v-for="(floor, fIndex) in tower.floors" :key="floor.id"
                                        class="p-3 bg-gray-50 dark:bg-gray-800 rounded flex flex-col gap-3">
                                        <div class="flex items-center gap-3">
                                            <a-input v-model:value="floor.name" placeholder="Floor Name (e.g. 1st)"
                                                class="flex-1" />
                                            <DeleteOutlined class="text-gray-400 hover:text-red-500"
                                                @click="removeFloor(tIndex, fIndex)" />
                                        </div>

                                        <!-- Wings (Optional) -->
                                        <div class="ml-4">
                                            <div class="flex flex-wrap gap-2 items-center">
                                                <span class="text-xs text-gray-400">Wings:</span>
                                                <a-tag v-for="(wing, wIndex) in floor.wings" :key="wing.id" closable
                                                    @close="removeWing(tIndex, fIndex, wIndex)">
                                                    {{ wing.name }}
                                                </a-tag>
                                                <a-input v-if="inputVisible[floor.id]" ref="wingInputRef"
                                                    v-model:value="wingInputValue[floor.id]" type="text" size="small"
                                                    :style="{ width: '78px' }"
                                                    @blur="handleWingInputConfirm(tIndex, fIndex)"
                                                    @keyup.enter="handleWingInputConfirm(tIndex, fIndex)" />
                                                <a-tag v-else class="border-dashed bg-white dark:bg-transparent"
                                                    @click="showWingInput(floor.id)">
                                                    <PlusOutlined /> New Wing
                                                </a-tag>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a-collapse-panel>
                    </a-collapse>

                    <div v-if="formData.hasTowers" class="text-center pt-4">
                        <a-button type="dashed" @click="addTower">
                            <template #icon>
                                <PlusOutlined />
                            </template> Add Another Tower
                        </a-button>
                    </div>
                </div>
            </div>




            <!-- Actions -->
            <div class="mt-8 flex justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                <a-button v-if="currentStep > 0" @click="currentStep--">Previous</a-button>
                <div v-else></div> <!-- Spacer -->

                <a-button v-if="currentStep < 1" type="primary" @click="currentStep++">Next</a-button>
                <a-button v-else type="primary" @click="handleSubmit">Submit Facility</a-button>
            </div>
        </a-card>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick, watch, computed } from 'vue';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useFacilityStore } from '../../../stores/facility';

definePageMeta({
    middleware: 'auth'
});

const facilityStore = useFacilityStore();
const currentStep = ref(0);
const activeTowers = ref<string[]>([]);
const inputVisible = reactive<Record<string, boolean>>({});
const wingInputValue = reactive<Record<string, string>>({});
const wingInputRef = ref();

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

// Watch 'hasTowers' to reset or adjust towers
watch(() => formData.hasTowers, (newVal) => {
    // If turning OFF towers, ensure only one exists and rename it
    if (!newVal && formData.towers.length > 0) {
        // Keep the first one, remove others
        formData.towers = [formData.towers[0]];
        formData.towers[0].name = 'Main Building';
    }
    // If turning ON towers, rename 'Main Building' if it's the only one
    else if (newVal && formData.towers.length === 1 && formData.towers[0].name === 'Main Building') {
        formData.towers[0].name = 'Tower 1';
    }
});

// Structure Management
const addTower = () => {
    const id = Date.now().toString();
    formData.towers.push({
        id,
        name: formData.hasTowers ? `Tower ${formData.towers.length + 1}` : 'Main Building',
        floors: []
    });
    activeTowers.value.push(id);
};

const removeTower = (index: number) => {
    formData.towers.splice(index, 1);
};

const addFloor = (towerIndex: number) => {
    const floorNum = formData.towers[towerIndex].floors.length;
    formData.towers[towerIndex].floors.push({
        id: Date.now().toString() + Math.random(),
        name: floorNum === 0 ? 'Ground Floor' : `${floorNum}th Floor`,
        number: floorNum,
        wings: []
    });
};

const removeFloor = (towerIndex: number, floorIndex: number) => {
    formData.towers[towerIndex].floors.splice(floorIndex, 1);
};

// Wing Management
const showWingInput = (floorId: string) => {
    inputVisible[floorId] = true;
    nextTick(() => {
        wingInputRef.value?.focus();
    });
};

const handleWingInputConfirm = (tIndex: number, fIndex: number) => {
    const floor = formData.towers[tIndex].floors[fIndex];
    const val = wingInputValue[floor.id];

    if (val) {
        floor.wings.push({
            id: Date.now().toString(),
            name: val
        });
    }

    inputVisible[floor.id] = false;
    wingInputValue[floor.id] = '';
};

const removeWing = (tIndex: number, fIndex: number, wIndex: number) => {
    formData.towers[tIndex].floors[fIndex].wings.splice(wIndex, 1);
};

const handleSubmit = async () => {
    try {
        await facilityStore.createFacility(formData);
        navigateTo('/facilities');
    } catch (e) {
        console.error(e);
    }
};



// Initialize with one tower if not multiple
if (!formData.hasTowers && formData.towers.length === 0) {
    addTower();
}
</script>
