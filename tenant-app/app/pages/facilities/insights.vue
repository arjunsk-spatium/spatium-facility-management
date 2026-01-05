<template>
    <div class="p-6">
        <div class="mb-8 flex justify-between items-center">
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
import { ref } from 'vue';
import OccupancyWidget from '../../../components/facilities/widgets/OccupancyWidget.vue';
import MaintenanceWidget from '../../../components/facilities/widgets/MaintenanceWidget.vue';
import EnergyWidget from '../../../components/facilities/widgets/EnergyWidget.vue';
import { Dayjs } from 'dayjs';

definePageMeta({
    middleware: 'auth'
});

const dateRange = ref<[Dayjs, Dayjs]>();
</script>
