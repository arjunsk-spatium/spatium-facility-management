<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Visitor Management Settings</h2>
        </div>

        <!-- Sub-tabs -->
        <a-tabs v-model:activeKey="activeSubTab" type="card">
            <a-tab-pane key="purposesOfVisit" tab="Purpose of Visit">
                <div class="py-4">
                    <ConfigTable title="Purposes of Visit" :columns="purposeColumns" :data="purposesOfVisit"
                        :loading="loading" :fields="purposeFields" :canCreate="canCreate" :canUpdate="canUpdate"
                        :canDelete="canDelete" @add="handleAddPurpose" @edit="handleEditPurpose"
                        @delete="handleDeletePurpose" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="form" tab="Form">
                <div class="py-4">
                    <a-card :loading="configLoading">
                        <template #title>
                            <div class="flex items-center justify-between w-full">
                                <span>Visitor Form Fields</span>
                            </div>
                        </template>
                        <div class="space-y-6">
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-base font-medium">Company Required</h3>
                                    <p class="text-gray-500 text-sm">Make company field mandatory for visitors</p>
                                </div>
                                <a-switch v-if="canUpdate" :checked="visitorCompanyRequired"
                                    @change="handleCompanyToggle" :loading="savingConfig" />
                                <span v-else class="text-sm font-medium"
                                    :class="visitorCompanyRequired ? 'text-green-600' : 'text-gray-500'">
                                    {{ visitorCompanyRequired ? 'Required' : 'Optional' }}
                                </span>
                            </div>
                            <a-divider />
                            <div class="flex items-center justify-between">
                                <div>
                                    <h3 class="text-base font-medium">Email Required</h3>
                                    <p class="text-gray-500 text-sm">Make email field mandatory for visitors</p>
                                </div>
                                <a-switch v-if="canUpdate" :checked="visitorEmailRequired"
                                    @change="handleEmailToggle" :loading="savingConfig" />
                                <span v-else class="text-sm font-medium"
                                    :class="visitorEmailRequired ? 'text-green-600' : 'text-gray-500'">
                                    {{ visitorEmailRequired ? 'Required' : 'Optional' }}
                                </span>
                            </div>
                        </div>
                    </a-card>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'
import { useTenantService } from '../../composables/tenantService'

defineProps<{
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
}>()

const { $api } = useNuxtApp()
const { getCurrentTenantId, getTenantConfig, updateTenantConfig } = useTenantService()

const API_BASE = '/api/portal/masters/purposes-of-visit'

const activeSubTab = ref('purposesOfVisit')
const loading = ref(false)
const configLoading = ref(false)
const savingConfig = ref(false)
const visitorCompanyRequired = ref(false)
const visitorEmailRequired = ref(false)

// Purposes of visit data
const purposesOfVisit = ref<any[]>([])

// Columns
const purposeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Action', key: 'action', width: 150 }
]

// Fields for add/edit modal
const purposeFields = [
    { name: 'name', label: 'Name', type: 'text' as const },
    { name: 'code', label: 'Code', type: 'text' as const }
]

// API Functions
const fetchPurposesOfVisit = async () => {
    loading.value = true
    try {
        const result = await $api<any>(API_BASE + '/')
        if (result.success) {
            purposesOfVisit.value = result.data.results || []
        }
    } catch (error) {
        console.error('Failed to fetch purposes of visit:', error)
        message.error('Failed to load purposes of visit')
    } finally {
        loading.value = false
    }
}

const createPurpose = async (data: { name: string; code: string }) => {
    try {
        const result = await $api<any>(API_BASE + '/', {
            method: 'POST',
            body: { name: data.name, code: data.code }
        })
        if (result.success) {
            message.success('Purpose of visit added successfully')
            await fetchPurposesOfVisit()
        } else {
            message.error(result.message || 'Failed to add purpose of visit')
        }
    } catch (error) {
        message.error('Failed to add purpose of visit')
    }
}

const updatePurpose = async (record: any, data: { name: string; code: string }) => {
    try {
        const result = await $api<any>(API_BASE + '/' + record.id + '/', {
            method: 'PATCH',
            body: { name: data.name, code: data.code }
        })
        if (result.success) {
            message.success('Purpose of visit updated successfully')
            await fetchPurposesOfVisit()
        } else {
            message.error(result.message || 'Failed to update purpose of visit')
        }
    } catch (error) {
        message.error('Failed to update purpose of visit')
    }
}

const deletePurpose = async (record: any) => {
    try {
        await $api<any>(API_BASE + '/' + record.id + '/', {
            method: 'DELETE'
        })
        message.success('Purpose of visit deleted successfully')
        await fetchPurposesOfVisit()
    } catch (error) {
        message.error('Failed to delete purpose of visit')
    }
}

const fetchVisitorConfig = async () => {
    configLoading.value = true
    try {
        const tenantId = getCurrentTenantId()
        const config = await getTenantConfig(tenantId)
        if (config) {
            visitorCompanyRequired.value = config.visitor_company_required
            visitorEmailRequired.value = config.visitor_email_required
        }
    } catch (error) {
        console.error('Failed to fetch visitor config:', error)
        message.error('Failed to load visitor form configuration')
    } finally {
        configLoading.value = false
    }
}

const handleCompanyToggle = async (checked: boolean) => {
    savingConfig.value = true
    try {
        const tenantId = getCurrentTenantId()
        const result = await updateTenantConfig(tenantId, { visitor_company_required: checked })
        if (result) {
            visitorCompanyRequired.value = result.visitor_company_required
            message.success(`Company field set to ${checked ? 'required' : 'optional'}`)
        }
    } catch (error) {
        message.error('Failed to update company requirement')
    } finally {
        savingConfig.value = false
    }
}

const handleEmailToggle = async (checked: boolean) => {
    savingConfig.value = true
    try {
        const tenantId = getCurrentTenantId()
        const result = await updateTenantConfig(tenantId, { visitor_email_required: checked })
        if (result) {
            visitorEmailRequired.value = result.visitor_email_required
            message.success(`Email field set to ${checked ? 'required' : 'optional'}`)
        }
    } catch (error) {
        message.error('Failed to update email requirement')
    } finally {
        savingConfig.value = false
    }
}

onMounted(async () => {
    await fetchPurposesOfVisit()
    await fetchVisitorConfig()
})

// Handlers
const handleAddPurpose = async (data: any) => {
    await createPurpose(data)
}

const handleEditPurpose = async (record: any, data: any) => {
    await updatePurpose(record, data)
}

const handleDeletePurpose = async (record: any) => {
    await deletePurpose(record)
}
</script>
