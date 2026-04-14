<template>
    <div class="space-y-6">
        <div v-if="!canView" class="text-center py-12">
            <p class="text-gray-500">You don't have permission to view facilities.</p>
        </div>
        <template v-else>
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Facilities</h1>
                <p class="text-gray-500 dark:text-gray-400">Manage building and facility structures.</p>
            </div>
            <a-button v-if="canCreate" type="primary" @click="navigateTo('/facilities/create')">
                <template #icon>
                    <PlusOutlined />
                </template>
                Add <hide class="hidden sm:inline">Facility</hide>
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
            <a-button v-if="canCreate" type="primary" @click="navigateTo('/facilities/create')">Create Facility</a-button>
        </div>

        <!-- Grid Layout -->
        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
            <a-card v-for="facility in facilityStore.facilities" :key="facility.id">
                <!-- Card Content -->
                <template #cover>
                    <div class="h-32 bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center overflow-hidden">
                        <img :src="facility.image_url || buildingDrawing" :alt="facility.name"
                            class="h-full w-full object-cover opacity-90 scale-130 hover:scale-135 transition-transform duration-500" />
                    </div>
                </template>

                <a-card-meta :title="facility.name">
                    <template #description>
                        <div class="space-y-2 mt-2">
                            <div class="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <EnvironmentOutlined class="mr-1.5" />
                                {{ facility.city_details?.name || facility.location?.city || 'N/A' }},
                                {{ facility.country_details?.name || facility.location?.country || 'N/A' }}
                            </div>

                            <div
                                class="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-gray-700">
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ facility.tower_count || (facility.towers?.length || 0) }}
                                    </div>
                                    <span class="text-xs text-gray-500">Towers</span>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ facility.has_towers ? 'Yes' : 'No' }}
                                    </div>
                                    <span class="text-xs text-gray-500">Multi-Building</span>
                                </div>
                                <div class="text-center">
                                    <div class="text-lg font-bold text-gray-700 dark:text-gray-200">
                                        {{ facility.zone_details?.name?.substring(0, 8) || 'N/A' }}
                                    </div>
                                    <span class="text-xs text-gray-500">Zone</span>
                                </div>
                            </div>
                        </div>
                    </template>
                </a-card-meta>

                <template #actions>
                    <div v-if="canUpdate" class="flex justify-center w-full" @click.stop="navigateTo(`/facilities/${facility.id}/edit`)">
                        <EditOutlined class="mr-2" /> Edit
                    </div>
                    <div class="flex justify-center w-full" @click.stop="navigateTo(`/facilities/${facility.id}`)">
                        <EyeOutlined class="mr-2" /> View
                    </div>
                    <a-popconfirm
                        v-if="canDelete"
                        title="Are you sure you want to delete this facility?"
                        ok-text="Yes"
                        cancel-text="No"
                        @confirm="handleDeleteFacility(facility.id)"
                    >
                        <div class="flex justify-center w-full text-red-500" @click.stop>
                            <DeleteOutlined class="mr-2" /> Delete
                        </div>
                    </a-popconfirm>
                </template>
            </a-card>
        </div>

        <!-- Pagination -->
        <div v-if="facilityStore.totalFacilities > 0" class="flex justify-center mt-6">
            <a-pagination :current="facilityStore.page" :total="facilityStore.count" :page-size="facilityStore.pageSize"
                :show-size-changer="false" @change="handlePageChange" />
        </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useFacilityStore } from '../../../stores/facility';
import { useAuthStore } from '../../../stores/auth';
import AppLoader from '../../../components/AppLoader.vue';
import {
    PlusOutlined,
    HomeOutlined,
    EnvironmentOutlined,
    EditOutlined,
    EyeOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import buildingDrawing from '../../../assets/images/building-drawing.png';

definePageMeta({
    middleware: 'auth'
});

const facilityStore = useFacilityStore();
const authStore = useAuthStore();

const canView = computed(() => authStore.hasPermission('facilities-list:view'))
const canCreate = computed(() => authStore.hasPermission('facilities-list:create'))
const canUpdate = computed(() => authStore.hasPermission('facilities-list:update'))
const canDelete = computed(() => authStore.hasPermission('facilities-list:delete'))

const handlePageChange = (page: number) => {
    facilityStore.goToPage(page);
};


const handleDeleteFacility = async (id: string) => {
    try {
        await facilityStore.deleteFacility(id);
        message.success('Facility deleted successfully');
    } catch (error) {
        message.error('Failed to delete facility');
    }
};

onMounted(() => {
    facilityStore.fetchFacilities({}, true);
});
</script>
