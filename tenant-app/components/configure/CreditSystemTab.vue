<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Credit System Configuration</h2>
        </div>

        <!-- System Enable Toggle -->
        <a-card :loading="loading">
            <template #title>
                <div class="flex items-center justify-between w-full">
                    <span>General Settings</span>
                </div>
            </template>
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-base font-medium">Enable Credit System</h3>
                    <p class="text-gray-500 text-sm">Allow tenants to use credit for payments</p>
                </div>
                <a-switch :checked="creditSystemEnabled" @change="handleSystemToggle" :loading="saving" />
            </div>
        </a-card>

        <!-- Module Configuration -->
        <a-card :loading="loadingModules" title="Module Configuration" v-if="creditSystemEnabled">
            <p class="mb-4 text-gray-500">Configure payment modes for individual modules.</p>
            
            <a-table :dataSource="modules" :columns="moduleColumns" :pagination="false" rowKey="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'payment_mode'">
                         <a-select
                            v-model:value="record.payment_mode"
                            style="width: 200px"
                            @change="handleModulePaymentChange(record)"
                            :loading="record.saving"
                        >
                            <a-select-option value="free">Free</a-select-option>
                            <a-select-option value="credit_only">Credit Only</a-select-option>
                            <a-select-option value="money_only">Money Only</a-select-option>
                            <a-select-option value="hybrid">Credit + Money</a-select-option>
                        </a-select>
                    </template>
                </template>
            </a-table>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import { useTenantService, type TenantConfig } from '../../composables/tenantService'

const { $api } = useNuxtApp()
const { getCurrentTenantId, updateTenantConfig, getTenantConfig, updateModuleConfig } = useTenantService()

const loading = ref(false)
const saving = ref(false)
const loadingModules = ref(false)
const creditSystemEnabled = ref(false)

// Module Data
interface ModuleConfig {
    id: string;
    name: string;
    payment_mode: string;
    saving?: boolean;
}

const modules = ref<ModuleConfig[]>([])

const moduleColumns = [
    { title: 'Module Name', dataIndex: 'name', key: 'name' },
    { title: 'Payment Mode', key: 'payment_mode', width: 250 }
]

const fetchConfig = async () => {
    loading.value = true
    try {
        const tenantId = getCurrentTenantId()
        // Determine whether to use real API or mock
        // For now, let's use the mock services we added to tenantService
        const config = await getTenantConfig(tenantId)
        if (config) {
            creditSystemEnabled.value = config.credit_system_enabled
            // Fetch modules if credit system is already enabled
            if (config.credit_system_enabled) {
                fetchModules()
            }
        }
    } catch (error) {
        console.error('Failed to fetch config:', error)
        message.error('Failed to load configuration')
    } finally {
        loading.value = false
    }
}

const fetchModules = async () => {
    loadingModules.value = true
    try {
        // Use module-configs endpoint which returns module name + billing mode
        const result = await $api<any>('/api/portal/tenants/module-configs/')
        
        // Response: { success: true, data: [ { module, module_name, billing_mode, ... } ] }
        let configs: any[] = [];
        if (result.success && Array.isArray(result.data)) {
            configs = result.data;
        } else if (result.success && result.data?.results) {
            configs = result.data.results;
        }

        // Filter for Meeting Rooms and map to our format
        modules.value = configs
            .filter((c: any) => c.module_name === 'Meeting Rooms')
            .map((c: any) => ({
                id: c.module,
                name: c.module_name,
                payment_mode: c.billing_mode || 'free'
            }));
    } catch (error) {
        console.error('Failed to fetch modules:', error)
        message.error('Failed to load modules')
    } finally {
        loadingModules.value = false
    }
}

const handleSystemToggle = async (checked: boolean) => {
    saving.value = true
    try {
        const tenantId = getCurrentTenantId()
        const result = await updateTenantConfig(tenantId, { credit_system_enabled: checked })
        
        if (result) {
            creditSystemEnabled.value = result.credit_system_enabled
            message.success(`Credit system ${checked ? 'enabled' : 'disabled'} successfully`)
            
            if (checked) {
                fetchModules()
            }
        }
    } catch (error) {
        message.error('Failed to update configuration')
        // Revert UI state if failed
        // Note: Checkbox might need manual reset or re-fetch
    } finally {
        saving.value = false
    }
}

const handleModulePaymentChange = async (record: ModuleConfig) => {
    record.saving = true;
    try {
        const result = await useTenantService().updateModuleConfig(record.id, record.payment_mode);
        if (result) {
            message.success(`Updated ${record.name} to ${record.payment_mode}`)
        } else {
             message.error(`Failed to update ${record.name}`)
        }
    } catch (error) {
         message.error(`Failed to update ${record.name}`)
    } finally {
        record.saving = false;
    }
}

onMounted(() => {
    fetchConfig()
})
</script>
