<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <NuxtLink to="/tenants">
                <a-button type="text">
                    <ArrowLeftOutlined /> Back
                </a-button>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tenant Details</h1>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <template v-else-if="tenant">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <!-- Main Info Card -->
                <a-card :bordered="false" class="shadow-sm lg:col-span-2">
                    <template #title>
                        <div class="flex items-center justify-between">
                            <span>{{ tenant.name }}</span>
                            <a-tag :color="getStatusColor(tenant.status)">{{ tenant.status }}</a-tag>
                        </div>
                    </template>
                    <template #extra>
                        <NuxtLink :to="`/tenants/${tenant.id}/edit`">
                            <a-button type="primary">
                                <EditOutlined /> Edit
                            </a-button>
                        </NuxtLink>
                    </template>

                    <a-descriptions :column="{ xs: 1, sm: 2 }" bordered>
                        <a-descriptions-item label="Domain">{{ tenant.domain }}</a-descriptions-item>
                        <a-descriptions-item label="Admin Email">{{ tenant.adminEmail }}</a-descriptions-item>
                        <a-descriptions-item label="Plan">{{ tenant.planName }}</a-descriptions-item>
                        <a-descriptions-item label="Users">{{ tenant.userCount }}</a-descriptions-item>
                        <a-descriptions-item label="Created">{{ tenant.createdAt }}</a-descriptions-item>
                        <a-descriptions-item label="Status">
                            <a-tag :color="getStatusColor(tenant.status)">{{ tenant.status }}</a-tag>
                        </a-descriptions-item>
                    </a-descriptions>
                </a-card>

                <!-- Modules Card -->
                <a-card :bordered="false" class="shadow-sm">
                    <template #title>Enabled Modules</template>
                    <div class="space-y-2">
                        <div v-for="mod in tenant.modules" :key="mod"
                            class="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                            <CheckCircleOutlined class="text-green-500" />
                            <span>{{ mod }}</span>
                        </div>
                    </div>
                </a-card>
            </div>
        </template>

        <div v-else class="text-center p-12 text-gray-500">
            Tenant not found
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ArrowLeftOutlined, EditOutlined, CheckCircleOutlined } from '@ant-design/icons-vue'
import { useTenantStore } from '../../../../stores/tenant'

const route = useRoute()
const store = useTenantStore()

const tenant = computed(() => store.currentTenant)
const loading = computed(() => store.loading)

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'green'
        case 'trial': return 'orange'
        case 'suspended': return 'red'
        default: return 'default'
    }
}

onMounted(() => {
    const id = route.params.id as string
    store.fetchTenant(id)
})
</script>
