<template>
    <a-card class="shadow-sm hover:shadow-md transition-shadow h-full" title="Recent Companies">
        <template #extra>
            <NuxtLink to="/companies" class="text-xs text-primary-600">View All</NuxtLink>
        </template>
        <div class="overflow-x-auto">
            <table class="w-full text-sm">
                <thead>
                    <tr class="text-left text-gray-500 border-b dark:border-gray-700">
                        <th class="pb-2 font-medium">Name</th>
                        <th class="pb-2 font-medium">Status</th>
                        <th class="pb-2 font-medium">Added</th>
                    </tr>
                </thead>
                <tbody class="divide-y dark:divide-gray-700">
                    <tr v-for="company in companies" :key="company.id">
                        <td class="py-2.5">{{ company.name }}</td>
                        <td class="py-2.5">
                            <span class="px-2 py-0.5 rounded-full text-xs font-medium"
                                :class="company.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-600'">
                                {{ company.status }}
                            </span>
                        </td>
                        <td class="py-2.5 text-gray-500">{{ company.date }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </a-card>
</template>

<script setup lang="ts">
const companies = [
    { id: 1, name: 'Acme Corp', status: 'Active', date: 'Oct 24' },
    { id: 2, name: 'Globex Inc', status: 'Active', date: 'Oct 23' },
    { id: 3, name: 'Soylent Corp', status: 'Pending', date: 'Oct 22' },
    { id: 4, name: 'Initech', status: 'Active', date: 'Oct 20' },
    { id: 5, name: 'Umbrella Corp', status: 'Inactive', date: 'Oct 18' },
];
</script>
