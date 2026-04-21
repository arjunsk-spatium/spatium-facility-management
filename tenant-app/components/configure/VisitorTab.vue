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
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'

defineProps<{
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
}>()

const { $api } = useNuxtApp()

const API_BASE = '/api/portal/masters/purposes-of-visit'

const activeSubTab = ref('purposesOfVisit')
const loading = ref(false)

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

onMounted(async () => {
    await fetchPurposesOfVisit()
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
