<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Configure</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage system settings and configurations</p>
            </div>
        </div>

        <!-- Mobile Tab Selector (visible on small screens) -->
        <div class="md:hidden">
            <a-select v-model:value="activeTab" class="w-full" size="large">
                <a-select-option v-for="tab in tabs" :key="tab.key" :value="tab.key">
                    <div class="flex items-center gap-2">
                        <component :is="tab.icon" />
                        {{ tab.label }}
                    </div>
                </a-select-option>
            </a-select>
        </div>

        <!-- Main Content with Collapsible Sidebar -->
        <div class="flex flex-col md:flex-row gap-4">
            <!-- Collapsible Vertical Tabs Sidebar (hidden on mobile) -->
            <a-card :class="[
                'hidden md:flex flex-col transition-all duration-300',
                sidebarCollapsed ? 'w-15' : 'w-56'
            ]" :bodyStyle="{ padding: '0px', display: 'flex', flexDirection: 'column', height: '100%' }">
                <!-- Tab Items -->
                <nav class="flex-1 p-2">
                    <button 
                        v-for="tab in tabs" 
                        :key="tab.key" 
                        @click="activeTab = tab.key" 
                        :class="[
                            'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors duration-200 mb-1 cursor-pointer',
                            activeTab === tab.key
                                ? ''
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        ]"
                        :style="activeTab === tab.key ? activeTabStyle : {}"
                    >
                        <component :is="tab.icon" class="text-lg flex-shrink-0" />
                        <span v-if="!sidebarCollapsed" class="font-medium truncate">{{ tab.label }}</span>
                    </button>
                </nav>

                <!-- Collapse Toggle Button -->
                <div class="p-2 border-t border-gray-200 dark:border-gray-800">
                    <button @click="sidebarCollapsed = !sidebarCollapsed"
                        class="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <LeftOutlined v-if="!sidebarCollapsed" class="text-sm" />
                        <RightOutlined v-else class="text-sm" />
                        <span v-if="!sidebarCollapsed" class="text-sm">Collapse</span>
                    </button>
                </div>
            </a-card>

            <!-- Content Area -->
            <a-card class="flex-1" :bodyStyle="{ padding: '16px 24px' }">
                <LocationTab v-if="activeTab === 'location'" />
                <HelpdeskTab v-if="activeTab === 'helpdesk'" />
                <RoomMetaTab v-if="activeTab === 'roomMeta'" />
                <CreditSystemTab v-if="activeTab === 'creditSystem'" />
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
    EnvironmentOutlined,
    CustomerServiceOutlined,
    AppstoreOutlined,
    LeftOutlined,
    RightOutlined,
    CreditCardOutlined
} from '@ant-design/icons-vue'

import LocationTab from '../../../components/configure/LocationTab.vue'
import HelpdeskTab from '../../../components/configure/HelpdeskTab.vue'
import RoomMetaTab from '../../../components/configure/RoomMetaTab.vue'
import CreditSystemTab from '../../../components/configure/CreditSystemTab.vue'

definePageMeta({
    middleware: 'auth'
})

const tenantStore = useTenantStore()
const { isDark } = useTheme()
const sidebarCollapsed = ref(false)
const activeTab = ref('location')

const tabs = [
    { key: 'location', label: 'Location', icon: EnvironmentOutlined },
    { key: 'helpdesk', label: 'Helpdesk', icon: CustomerServiceOutlined },
    { key: 'roomMeta', label: 'Room Meta', icon: AppstoreOutlined },
    { key: 'creditSystem', label: 'Credit System', icon: CreditCardOutlined }
]

// Whitelabeled active tab style using tenant's primary color
const activeTabStyle = computed(() => {
    const primaryColor = tenantStore.primaryColor || '#3378ff'
    return {
        backgroundColor: isDark.value 
            ? `color-mix(in srgb, ${primaryColor} 20%, transparent)`
            : `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
        color: isDark.value 
            ? `color-mix(in srgb, ${primaryColor} 60%, white)`
            : primaryColor
    }
})
</script>
