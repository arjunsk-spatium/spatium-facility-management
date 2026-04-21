<template>
  <div class="space-y-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
      <div class="flex items-center justify-between flex-wrap gap-2">
        <p class="text-gray-600 dark:text-gray-400">Overview of your facility management modules.</p>
        <span v-if="dateFilter" class="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
          {{ dateFilter.date_from }} to {{ dateFilter.date_to }}
        </span>
      </div>
    </div>

    <!-- Widgets Grid -->
    <div class="space-y-8">

      <!-- Company Section -->
      <section v-if="authStore.hasModule('companies')">
        <h2 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Companies</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CompanyWidget />
          <CompanyTableWidget />
        </div>
      </section>

      <!-- Visitor Section -->
      <section v-if="authStore.hasModule('visitors')">
        <h2 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Visitors</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <VisitorWidget />
          <VisitorTrendWidget />
        </div>
      </section>

      <!-- Facility Section -->
      <section v-if="authStore.hasModule('facilities')">
        <h2 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Facilities</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FacilityWidget />
          <FacilityAlertsWidget />
        </div>
      </section>

      <!-- Helpdesk Section -->
      <section v-if="authStore.hasModule('helpdesk')">
        <h2 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Helpdesk</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HelpdeskWidget />
          <HelpdeskUrgentWidget />
          <HelpdeskTrendWidget class="md:col-span-2" />
        </div>
      </section>

      <!-- Users Section -->
      <section v-if="authStore.hasModule('users')">
        <h2 class="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Users</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UsersWidget />
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import CompanyWidget from '../../../components/dashboard/CompanyWidget.vue';
import CompanyTableWidget from '../../../components/dashboard/CompanyTableWidget.vue';
import VisitorWidget from '../../../components/dashboard/VisitorWidget.vue';
import VisitorTrendWidget from '../../../components/dashboard/VisitorTrendWidget.vue';
import FacilityWidget from '../../../components/dashboard/FacilityWidget.vue';
import FacilityAlertsWidget from '../../../components/dashboard/FacilityAlertsWidget.vue';
import HelpdeskWidget from '../../../components/dashboard/HelpdeskWidget.vue';
import HelpdeskUrgentWidget from '../../../components/dashboard/HelpdeskUrgentWidget.vue';
import HelpdeskTrendWidget from '../../../components/dashboard/HelpdeskTrendWidget.vue';
import UsersWidget from '../../../components/dashboard/UsersWidget.vue';
import { useDashboardStore } from '../../../stores/dashboard';

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore();
const dashboardStore = useDashboardStore();

const dateFilter = computed(() => dashboardStore.summary?.date_filter);

onMounted(() => {
  dashboardStore.fetchSummary();
});
</script>
