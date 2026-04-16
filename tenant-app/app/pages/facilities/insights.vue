<template>
    <div class="space-y-6">
        <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-2 dark:text-white">Facilities Insights</h1>
                <p class="text-gray-600 dark:text-gray-400">Real-time analytics and performance metrics.</p>
            </div>
            <a-range-picker v-model:value="dateRange" />
        </div>

        <!-- Widgets Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Occupancy -->
            <div>
                <OccupancyWidget />
            </div>

            <!-- Maintenance -->
            <div>
                <MaintenanceWidget />
            </div>

            <!-- Energy -->
            <div>
                <EnergyWidget />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import OccupancyWidget from '../../../components/facilities/widgets/OccupancyWidget.vue';
import MaintenanceWidget from '../../../components/facilities/widgets/MaintenanceWidget.vue';
import EnergyWidget from '../../../components/facilities/widgets/EnergyWidget.vue';
import { Dayjs } from 'dayjs';

definePageMeta({
    middleware: 'auth'
});

const authStore = useAuthStore();
const canView = computed(() => authStore.hasPermission('facilities-insights:view') || authStore.hasPermission('facilities-list:view'))

if (!canView.value) {
    navigateTo('/facilities');
}

const dateRange = ref<[Dayjs, Dayjs]>();
</script>
