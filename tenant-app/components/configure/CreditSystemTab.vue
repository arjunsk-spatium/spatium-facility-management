<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Credit System Configuration</h2>
        </div>

        <!-- Module Configuration -->
        <a-card :loading="loadingModules" title="Module Configuration" v-if="canUpdate && hasMeetingRoomsModule">
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
import { ref, computed, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import { useTenantService } from '../../composables/tenantService'
import { useAuthStore } from '../../stores/auth'

defineProps<{
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
}>()

const { $api } = useNuxtApp()
const authStore = useAuthStore()
const hasMeetingRoomsModule = computed(() => authStore.hasModule('meeting_rooms'))

const loadingModules = ref(false)

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
    fetchModules()
})
</script>
