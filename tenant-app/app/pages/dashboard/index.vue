<template>
  <div class="space-y-6">
    <div class="mb-8">
      <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400">Overview of your facility management modules.</p>
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
        </div>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import CompanyWidget from '../../../components/dashboard/CompanyWidget.vue';
import CompanyTableWidget from '../../../components/dashboard/CompanyTableWidget.vue';
import VisitorWidget from '../../../components/dashboard/VisitorWidget.vue';
import VisitorTrendWidget from '../../../components/dashboard/VisitorTrendWidget.vue';
import FacilityWidget from '../../../components/dashboard/FacilityWidget.vue';
import FacilityAlertsWidget from '../../../components/dashboard/FacilityAlertsWidget.vue';
import HelpdeskWidget from '../../../components/dashboard/HelpdeskWidget.vue';
import HelpdeskUrgentWidget from '../../../components/dashboard/HelpdeskUrgentWidget.vue';

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore();
</script>
