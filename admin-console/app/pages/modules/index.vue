<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex justify-between items-center p-4 rounded-lg shadow-sm transition-colors duration-300 page-header">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Modules</h1>
                <p class="text-gray-500 text-sm">Manage available system modules</p>
            </div>
        </div>

        <!-- Modules Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a-card v-for="mod in modules" :key="mod.id">
                <div class="text-center">
                    <div
                        class="w-16 h-16 mx-auto mb-4 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                        <component :is="getIcon(mod.icon)" class="text-2xl text-primary-600" />
                    </div>
                    <h3 class="font-semibold text-lg">{{ mod.name }}</h3>
                    <p class="text-gray-500 text-sm mt-1">{{ mod.id }}</p>

                    <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <a-switch :checked="enabledModules.includes(mod.id)"
                            @change="(checked: boolean) => toggleModule(mod.id, checked)" checked-children="Enabled"
                            un-checked-children="Disabled" />
                    </div>
                </div>
            </a-card>
        </div>

        <!-- Module Stats -->
        <a-card>
            <template #title>Module Usage</template>
            <a-table :columns="statsColumns" :data-source="moduleStats" :pagination="false" />
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    UserOutlined,
    CustomerServiceOutlined,
    CalendarOutlined,
    BankOutlined,
    HomeOutlined,
    TeamOutlined,
    ToolOutlined,
    BarChartOutlined
} from '@ant-design/icons-vue'
import { availableModules } from '../../composables/planService'

const modules = availableModules
const enabledModules = ref(['visitors', 'helpdesk', 'meeting-rooms', 'companies', 'facilities', 'employees'])

const iconMap: Record<string, any> = {
    UserOutlined,
    CustomerServiceOutlined,
    CalendarOutlined,
    BankOutlined,
    HomeOutlined,
    TeamOutlined,
    ToolOutlined,
    BarChartOutlined
}

const getIcon = (iconName: string) => {
    return iconMap[iconName] || UserOutlined
}

const toggleModule = (moduleId: string, enabled: boolean) => {
    if (enabled) {
        enabledModules.value.push(moduleId)
    } else {
        enabledModules.value = enabledModules.value.filter(m => m !== moduleId)
    }
}

const statsColumns = [
    { title: 'Module', dataIndex: 'name', key: 'name' },
    { title: 'Tenants Using', dataIndex: 'tenantsCount', key: 'tenantsCount' },
    { title: 'Active Users', dataIndex: 'activeUsers', key: 'activeUsers' },
    { title: 'Status', dataIndex: 'status', key: 'status' }
]

const moduleStats = computed(() => [
    { key: '1', name: 'Visitor Management', tenantsCount: 45, activeUsers: 320, status: 'Active' },
    { key: '2', name: 'Helpdesk', tenantsCount: 38, activeUsers: 215, status: 'Active' },
    { key: '3', name: 'Meeting Rooms', tenantsCount: 32, activeUsers: 180, status: 'Active' },
    { key: '4', name: 'Companies', tenantsCount: 28, activeUsers: 145, status: 'Active' },
    { key: '5', name: 'Facilities', tenantsCount: 20, activeUsers: 95, status: 'Active' },
    { key: '6', name: 'Employees', tenantsCount: 15, activeUsers: 78, status: 'Active' }
])
</script>

<style scoped>
.page-header {
    background: #ffffff;
    border: 1px solid #e5e5e5;
}

.dark .page-header {
    background: #1f1f1f;
    border-color: #333333;
}
</style>
