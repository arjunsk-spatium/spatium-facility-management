<template>
    <div class="space-y-6">
        <div class="mb-8">
            <h1 class="text-2xl font-bold mb-2">Dashboard</h1>
            <p class="text-gray-600 dark:text-gray-400">Overview of your admin console.</p>
        </div>

        <!-- Stats Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Tenants Card -->
            <a-card>
                <a-statistic title="Total Tenants" :value="dashboardData.stats.total_tenants.count" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <TeamOutlined />
                    </template>
                </a-statistic>
                <div class="mt-2 text-xs text-gray-500">
                    <span class="text-green-500">{{ dashboardData.stats.total_tenants.active }} active</span> ·
                    <span class="text-orange-500">{{ dashboardData.stats.total_tenants.trial }} trial</span>
                </div>
            </a-card>

            <!-- Active Plans Card -->
            <a-card>
                <a-statistic title="Active Plans" :value="dashboardData.stats.active_plans.count" :value-style="{ color: '#52c41a' }">
                    <template #prefix>
                        <CreditCardOutlined />
                    </template>
                </a-statistic>
                <div class="mt-2 text-xs text-gray-500">
                    {{ dashboardData.stats.active_plans.subscriptions }} subscriptions
                </div>
            </a-card>

            <!-- Total Modules Card -->
            <a-card>
                <a-statistic title="Available Modules" :value="dashboardData.stats.available_modules.count" :value-style="{ color: '#722ed1' }">
                    <template #prefix>
                        <AppstoreOutlined />
                    </template>
                </a-statistic>
                <div class="mt-2 text-xs text-gray-500">
                    {{ dashboardData.stats.available_modules.enabled }} enabled
                </div>
            </a-card>

            <!-- Total Users Card -->
            <a-card>
                <a-statistic title="Total Users" :value="dashboardData.stats.total_users"
                    :value-style="{ color: '#eb2f96' }">
                    <template #prefix>
                        <UserOutlined />
                    </template>
                </a-statistic>
                <div class="mt-2 text-xs text-gray-500">
                    Active across platform
                </div>
            </a-card>
        </div>

        <!-- Recent Activity Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Recent Tenants -->
            <a-card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <TeamOutlined class="text-blue-500" />
                        <span>Recent Tenants</span>
                    </div>
                </template>
                <template #extra>
                    <NuxtLink to="/tenants" class="text-xs text-primary-600">View All</NuxtLink>
                </template>

                <a-list :data-source="recentTenants" :loading="loading">
                    <template #renderItem="{ item }">
                        <a-list-item>
                            <a-list-item-meta :description="item.domain">
                                <template #title>
                                    <NuxtLink :to="`/tenants/${item.id}`"
                                        class="text-primary-600 hover:text-primary-700">
                                        {{ item.name }}
                                    </NuxtLink>
                                </template>
                                <template #avatar>
                                    <a-avatar :style="{ backgroundColor: getAvatarColor(item.status) }">
                                        {{ item.name.charAt(0) }}
                                    </a-avatar>
                                </template>
                            </a-list-item-meta>
                            <template #actions>
                                <a-tag :color="getStatusColor(item.status)">{{ item.status }}</a-tag>
                            </template>
                        </a-list-item>
                    </template>
                </a-list>
            </a-card>

            <!-- Quick Actions -->
            <a-card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <ThunderboltOutlined class="text-yellow-500" />
                        <span>Quick Actions</span>
                    </div>
                </template>

                <div class="grid grid-cols-2 gap-3">
                    <NuxtLink to="/tenants/create">
                        <a-button type="primary" block size="large">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            New Tenant
                        </a-button>
                    </NuxtLink>
                    <NuxtLink to="/plans/create">
                        <a-button block size="large">
                            <template #icon>
                                <CreditCardOutlined />
                            </template>
                            New Plan
                        </a-button>
                    </NuxtLink>
                    <NuxtLink to="/modules">
                        <a-button block size="large">
                            <template #icon>
                                <AppstoreOutlined />
                            </template>
                            Modules
                        </a-button>
                    </NuxtLink>
                    <NuxtLink to="/settings">
                        <a-button block size="large">
                            <template #icon>
                                <SettingOutlined />
                            </template>
                            Settings
                        </a-button>
                    </NuxtLink>
                </div>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    TeamOutlined,
    CreditCardOutlined,
    AppstoreOutlined,
    UserOutlined,
    ThunderboltOutlined,
    PlusOutlined,
    SettingOutlined
} from '@ant-design/icons-vue'
import { useTenantStore } from '../../../stores/tenant'

const tenantStore = useTenantStore()
const loading = computed(() => tenantStore.loading)

const dashboardData = computed(() => tenantStore.dashboardData)
const recentTenants = computed(() => tenantStore.dashboardData.recent_tenants)

const getStatusColor = (status: string) => {
    switch (status) {
        case 'active': return 'green'
        case 'trial': return 'orange'
        case 'suspended': return 'red'
        default: return 'default'
    }
}

const getAvatarColor = (status: string) => {
    switch (status) {
        case 'active': return '#52c41a'
        case 'trial': return '#faad14'
        case 'suspended': return '#ff4d4f'
        default: return '#1677ff'
    }
}

onMounted(() => {
    tenantStore.fetchTenants()
    tenantStore.fetchDashboardData()
})
</script>
