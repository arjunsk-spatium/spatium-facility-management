<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Helpdesk Roles</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage helpdesk roles and operational hierarchy.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button v-if="canCreate" type="primary" @click="openAddModal">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Add Role
                </a-button>
            </div>
        </div>

        <!-- Filters & Search -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a-input-search
                v-model:value="searchQuery"
                placeholder="Search roles by name, key, or description..."
                allow-clear
                class="max-w-md"
            />
        </div>

        <!-- Table View with ResponsiveDataView -->
        <div v-if="canView">
            <ResponsiveDataView
                :columns="columns"
                :data="filteredRoles"
                :loading="loading"
                row-key="id"
                :pagination="paginationConfig"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <span class="font-medium text-gray-900 dark:text-white">{{ record.name }}</span>
                    </template>

                    <template v-else-if="column.key === 'key'">
                        <a-tag color="blue">{{ record.key }}</a-tag>
                    </template>

                    <template v-else-if="column.key === 'description'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.description || '-' }}</span>
                    </template>

                    <template v-else-if="column.key === 'display_order'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.display_order }}</span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <div class="flex items-center gap-2">
                            <a-button
                                v-if="canUpdate"
                                type="text"
                                size="small"
                                @click="openEditModal(record)"
                            >
                                <template #icon>
                                    <EditOutlined class="text-blue-600" />
                                </template>
                            </a-button>

                            <a-popconfirm
                                v-if="canDelete"
                                title="Are you sure you want to delete this role?"
                                ok-text="Yes"
                                cancel-text="No"
                                @confirm="handleDelete(record)"
                            >
                                <a-button type="text" size="small" danger>
                                    <template #icon>
                                        <DeleteOutlined />
                                    </template>
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </template>
                </template>

                <!-- Mobile Card View -->
                <template #mobileCard="{ record }">
                    <a-card class="mb-3" :bordered="true">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="text-base font-semibold dark:text-white">{{ record.name }}</h4>
                                <a-tag color="blue" class="mt-1">{{ record.key }}</a-tag>
                            </div>
                            <div class="flex items-center gap-1">
                                <a-button
                                    v-if="canUpdate"
                                    type="text"
                                    size="small"
                                    @click="openEditModal(record)"
                                >
                                    <EditOutlined class="text-blue-600" />
                                </a-button>
                                <a-popconfirm
                                    v-if="canDelete"
                                    title="Delete role?"
                                    @confirm="handleDelete(record)"
                                >
                                    <a-button type="text" size="small" danger>
                                        <DeleteOutlined />
                                    </a-button>
                                </a-popconfirm>
                            </div>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
                            {{ record.description || 'No description' }}
                        </p>
                        <div class="text-xs text-gray-400">
                            Display Order: {{ record.display_order }}
                        </div>
                    </a-card>
                </template>
            </ResponsiveDataView>
        </div>
        <div v-else class="text-center py-12 text-gray-500">
            You do not have permission to view Helpdesk Roles.
        </div>

        <!-- Add / Edit Modal -->
        <a-modal
            v-model:open="modalVisible"
            :title="editingRole ? 'Edit Helpdesk Role' : 'Add Helpdesk Role'"
            :confirm-loading="saving"
            @ok="handleSave"
            @cancel="closeModal"
        >
            <a-form
                ref="formRef"
                :model="formData"
                :rules="rules"
                layout="vertical"
                class="mt-4"
            >
                <a-form-item label="Role Name" name="name">
                    <a-input
                        v-model:value="formData.name"
                        placeholder="e.g. Technician, Facility Lead"
                        @change="handleNameChange"
                    />
                </a-form-item>

                <a-form-item label="Role Key" name="key">
                    <a-input
                        v-model:value="formData.key"
                        placeholder="e.g. technician, facility_lead"
                        :disabled="!!editingRole"
                    />
                </a-form-item>

                <a-form-item label="Description" name="description">
                    <a-textarea
                        v-model:value="formData.description"
                        placeholder="Describe the responsibilities for this role..."
                        :rows="3"
                    />
                </a-form-item>

                <a-form-item label="Display Order" name="display_order">
                    <a-input-number
                        v-model:value="formData.display_order"
                        :min="1"
                        class="w-full"
                    />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue'
import { useHelpdeskService, type HelpdeskRole } from '../../../composables/helpdeskService'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()
const helpdeskService = useHelpdeskService()

// Permissions
const canView = computed(() => authStore.hasPermission('helpdesk-roles:view'))
const canCreate = computed(() => authStore.hasPermission('helpdesk-roles:create'))
const canUpdate = computed(() => authStore.hasPermission('helpdesk-roles:update'))
const canDelete = computed(() => authStore.hasPermission('helpdesk-roles:delete'))

// Data State
const loading = ref(false)
const roles = ref<HelpdeskRole[]>([])
const searchQuery = ref('')

// Modal & Form State
const modalVisible = ref(false)
const saving = ref(false)
const editingRole = ref<HelpdeskRole | null>(null)
const formRef = ref()
const formData = ref<{
    name: string
    key: string
    description: string
    display_order: number
}>({
    name: '',
    key: '',
    description: '',
    display_order: 1
})

const rules = {
    name: [{ required: true, message: 'Please enter role name', trigger: 'blur' }],
    key: [{ required: true, message: 'Please enter role key', trigger: 'blur' }],
    display_order: [{ required: true, message: 'Please enter display order', trigger: 'change' }]
}

// Columns
const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a: HelpdeskRole, b: HelpdeskRole) => a.name.localeCompare(b.name) },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Display Order', dataIndex: 'display_order', key: 'display_order', sorter: (a: HelpdeskRole, b: HelpdeskRole) => a.display_order - b.display_order },
    { title: 'Action', key: 'action', width: 120 }
]

// Pagination
const paginationConfig = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} roles`
}))

// Filtered roles based on search
const filteredRoles = computed(() => {
    if (!searchQuery.value.trim()) return roles.value
    const q = searchQuery.value.toLowerCase().trim()
    return roles.value.filter(role =>
        role.name.toLowerCase().includes(q) ||
        role.key.toLowerCase().includes(q) ||
        (role.description && role.description.toLowerCase().includes(q))
    )
})

// Auto-generate key while creating
const handleNameChange = () => {
    if (!editingRole.value) {
        formData.value.key = formData.value.name.toLowerCase().trim().replace(/\s+/g, '_')
    }
}

// Methods
const fetchRoles = async () => {
    loading.value = true
    try {
        const data = await helpdeskService.getRoles()
        roles.value = data || []
    } catch (error: any) {
        message.error(error.message || 'Failed to fetch helpdesk roles')
    } finally {
        loading.value = false
    }
}

const openAddModal = () => {
    editingRole.value = null
    formData.value = {
        name: '',
        key: '',
        description: '',
        display_order: roles.value.length + 1
    }
    modalVisible.value = true
}

const openEditModal = (record: HelpdeskRole) => {
    editingRole.value = record
    formData.value = {
        name: record.name,
        key: record.key,
        description: record.description || '',
        display_order: record.display_order || 1
    }
    modalVisible.value = true
}

const closeModal = () => {
    modalVisible.value = false
    if (formRef.value) {
        formRef.value.resetFields()
    }
}

const handleSave = async () => {
    try {
        await formRef.value?.validate()
    } catch (validationErr) {
        return
    }

    saving.value = true
    try {
        if (editingRole.value) {
            const updated = await helpdeskService.updateRole(editingRole.value.id, {
                name: formData.value.name,
                key: formData.value.key,
                description: formData.value.description,
                display_order: formData.value.display_order
            })
            const index = roles.value.findIndex(r => r.id === editingRole.value?.id)
            if (index > -1) {
                roles.value[index] = updated
            }
            message.success('Role updated successfully')
        } else {
            const newRole = await helpdeskService.createRole({
                name: formData.value.name,
                key: formData.value.key,
                description: formData.value.description,
                display_order: formData.value.display_order
            })
            roles.value.push(newRole)
            message.success('Role created successfully')
        }
        closeModal()
    } catch (error: any) {
        message.error(error.message || 'Failed to save role')
    } finally {
        saving.value = false
    }
}

const handleDelete = async (record: HelpdeskRole) => {
    try {
        await helpdeskService.deleteRole(record.id)
        roles.value = roles.value.filter(r => r.id !== record.id)
        message.success('Role deleted successfully')
    } catch (error: any) {
        message.error(error.message || 'Failed to delete role')
    }
}

onMounted(() => {
    fetchRoles()
})
</script>
