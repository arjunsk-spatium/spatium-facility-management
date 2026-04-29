<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">SPOC Configuration</h2>
        </div>
        <a-tabs v-model:activeKey="activeTab" type="card">
            <a-tab-pane key="departments" tab="Departments">
                <div class="py-4">
                    <ConfigTable title="Departments" :columns="departmentColumns" :data="departments"
                        :loading="loading" :fields="departmentFields" :canCreate="true" :canUpdate="true"
                        :canDelete="true" @add="handleAddDepartment" @edit="handleEditDepartment"
                        @delete="handleDeleteDepartment" />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ConfigTable from '../../../../components/configure/ConfigTable.vue'
import { useDepartmentService, type Department } from '../../../../composables/departmentService'

definePageMeta({
    middleware: 'auth'
})

const { fetchDepartments, createDepartment, updateDepartment, deleteDepartment } = useDepartmentService()

const activeTab = ref('departments')
const loading = ref(false)
const departments = ref<Department[]>([])

const departmentColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', copyable: true },
    { title: 'Action', key: 'action', width: 150 }
]

const departmentFields = [
    { name: 'name', label: 'Name', type: 'text' as const },
    { name: 'description', label: 'Description', type: 'text' as const }
]

const loadDepartments = async () => {
    loading.value = true
    try {
        departments.value = await fetchDepartments()
    } catch (e) {
        message.error('Failed to load departments')
    } finally {
        loading.value = false
    }
}

const handleAddDepartment = async (data: { name: string; description?: string }) => {
    try {
        const result = await createDepartment(data)
        if (result) {
            message.success('Department created successfully')
            await loadDepartments()
        } else {
            message.error('Failed to create department')
        }
    } catch {
        message.error('Failed to create department')
    }
}

const handleEditDepartment = async (record: Department, data: { name?: string; description?: string }) => {
    try {
        const result = await updateDepartment(record.id, data)
        if (result) {
            message.success('Department updated successfully')
            await loadDepartments()
        } else {
            message.error('Failed to update department')
        }
    } catch {
        message.error('Failed to update department')
    }
}

const handleDeleteDepartment = async (record: Department) => {
    try {
        const success = await deleteDepartment(record.id)
        if (success) {
            message.success('Department deleted successfully')
            await loadDepartments()
        } else {
            message.error('Failed to delete department')
        }
    } catch {
        message.error('Failed to delete department')
    }
}

onMounted(() => {
    loadDepartments()
})
</script>
