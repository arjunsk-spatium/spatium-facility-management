<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Facilities</h1>
                <p class="text-gray-500 dark:text-gray-400">Manage building and facility structures.</p>
            </div>
            <a-button type="primary" @click="navigateTo('/facilities/create')">
                <template #icon>
                    <PlusOutlined />
                </template>
                Add Facility
            </a-button>
        </div>

        <!-- Loading Handler -->
        <AppLoader v-if="facilityStore.loading" message="Loading Facilities..." />

        <!-- Empty State -->
        <div v-else-if="facilityStore.totalFacilities === 0"
            class="flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
            <HomeOutlined class="text-4xl text-gray-300 dark:text-gray-600 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-1">No Facilities Found</h3>
            <p class="text-gray-500 max-w-sm text-center mb-6">Get started by creating your first facility structure.
            </p>
            <a-button type="primary" @click="navigateTo('/facilities/create')">Create Facility</a-button>
        </div>

        <!-- Grid Layout -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <a-card v-for="facility in facilityStore.facilities" :key="facility.id" hoverable
                class="transition-all duration-300 hover:-translate-y-1">
                <!-- Card Content (Same as before) -->
                <template #cover>
                    <div class="h-32 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center overflow-hidden">
                        <img :src="buildingDrawing" alt="Facility Building"
                            class="h-full w-full object-cover opacity-90 hover:scale-105 transition-transform duration-500" />
                    </div>
                </template>

                <a-card-meta :title="facility.name">
                    <template #description>
                        <div class="space-y-2 mt-2">
                            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <EnvironmentOutlined class="mr-1.5" />
                                {{ facility.location.city }}, {{ facility.location.country }}
                            </div>

                            <div
                                class="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ facility.hasTowers ? facility.towers.length : 1 }}
                                    </div>
                                    <span class="text-xs text-gray-500">Buildings</span>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ countFloors(facility) }}
                                    </div>
                                    <span class="text-xs text-gray-500">Floors</span>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ facility.staff.length }}
                                    </div>
                                    <span class="text-xs text-gray-500">Staff</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </a-card-meta>

                <template #actions>
                    <div class="flex justify-center w-full" @click.stop="navigateTo(`/facilities/${facility.id}/edit`)">
                        <EditOutlined class="mr-2" /> Edit
                    </div>
                    <div class="flex justify-center w-full" @click.stop="navigateTo(`/facilities/${facility.id}`)">
                        <EyeOutlined class="mr-2" /> View
                    </div>
                </template>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useFacilityStore } from '../../../stores/facility';
import AppLoader from '../../../components/AppLoader.vue';
import {
    PlusOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    EditOutlined,
    EyeOutlined
} from '@ant-design/icons-vue';
import buildingDrawing from '../../../assets/images/building-drawing.png';

definePageMeta({
    middleware: 'auth'
});

const facilityStore = useFacilityStore();


// Helper to count total floors across all towers
const countFloors = (facility: any) => {
    return facility.towers.reduce((acc: number, tower: any) => acc + tower.floors.length, 0);
};

onMounted(() => {
    facilityStore.fetchFacilities();
});
</script>
