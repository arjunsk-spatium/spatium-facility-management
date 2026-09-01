<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Helpdesk Roles</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage helpdesk roles, authorized persons, and user assignments.</p>
            </div>
            <div class="flex items-center gap-3">
                <a-button v-if="canCreate && activeTab === 'operational'" type="primary" @click="openAddModal">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Add Role
                </a-button>
            </div>
        </div>

        <!-- Role Tabs & Search -->
        <div v-if="canView" class="space-y-4">
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                <a-tabs v-model:activeKey="activeTab" class="w-full sm:w-auto">
                    <a-tab-pane key="operational" tab="Operational Roles" />
                    <a-tab-pane key="system" tab="Authorized Person" />
                </a-tabs>

                <a-input-search
                    v-model:value="searchQuery"
                    placeholder="Search roles by name, key, or description..."
                    allow-clear
                    class="w-full sm:max-w-xs"
                />
            </div>

            <!-- Table View with ResponsiveDataView -->
            <ResponsiveDataView
                :columns="columns"
                :data="filteredCurrentRoles"
                :loading="loading"
                row-key="id"
                :pagination="paginationConfig"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'name'">
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-gray-900 dark:text-white">{{ record.name }}</span>
                            <a-tag v-if="isSystemRole(record)" color="purple">System Role</a-tag>
                        </div>
                    </template>

                    <template v-else-if="column.key === 'key'">
                        <a-tag :color="isSystemRole(record) ? 'purple' : 'blue'">{{ record.key }}</a-tag>
                    </template>

                    <template v-else-if="column.key === 'description'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.description || '-' }}</span>
                    </template>

                    <template v-else-if="column.key === 'display_order'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.display_order }}</span>
                    </template>

                    <template v-else-if="column.key === 'action'">
                        <div class="flex items-center gap-2">
                            <!-- Assign Users Button -->
                            <a-tooltip title="Assign Users">
                                <a-button
                                    type="text"
                                    size="small"
                                    class="text-indigo-600 hover:text-indigo-800"
                                    @click="openAssignUsersModal(record)"
                                >
                                    <template #icon>
                                        <UsergroupAddOutlined />
                                    </template>
                                </a-button>
                            </a-tooltip>

                            <!-- Edit button (not available for system role) -->
                            <a-button
                                v-if="canUpdate && !isSystemRole(record)"
                                type="text"
                                size="small"
                                @click="openEditModal(record)"
                            >
                                <template #icon>
                                    <EditOutlined class="text-blue-600" />
                                </template>
                            </a-button>

                            <!-- Delete button (not available for system role) -->
                            <a-popconfirm
                                v-if="canDelete && !isSystemRole(record)"
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
                                <div class="flex items-center gap-2">
                                    <h4 class="text-base font-semibold dark:text-white">{{ record.name }}</h4>
                                    <a-tag v-if="isSystemRole(record)" color="purple" class="text-xs">System Role</a-tag>
                                </div>
                                <a-tag :color="isSystemRole(record) ? 'purple' : 'blue'" class="mt-1">{{ record.key }}</a-tag>
                            </div>
                            <div class="flex items-center gap-1">
                                <a-button
                                    type="text"
                                    size="small"
                                    class="text-indigo-600"
                                    @click="openAssignUsersModal(record)"
                                >
                                    <UsergroupAddOutlined />
                                </a-button>
                                <a-button
                                    v-if="canUpdate && !isSystemRole(record)"
                                    type="text"
                                    size="small"
                                    @click="openEditModal(record)"
                                >
                                    <EditOutlined class="text-blue-600" />
                                </a-button>
                                <a-popconfirm
                                    v-if="canDelete && !isSystemRole(record)"
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

        <!-- Assign Users Modal -->
        <a-modal
            v-model:open="assignModalVisible"
            :title="`Assign Users - ${activeAssignRole?.name || ''}`"
            :confirm-loading="assigningUsers"
            width="560px"
            @ok="handleSaveAssignUsers"
            @cancel="closeAssignModal"
        >
            <div class="mt-4 space-y-4">
                <a-alert
                    v-if="activeAssignRole && isSystemRole(activeAssignRole)"
                    type="info"
                    show-icon
                    message="System Role Assignment"
                    description="Assign management staff members authorized to handle system-level escalation."
                />
                <a-alert
                    v-else
                    type="info"
                    show-icon
                    message="Operational Role Assignment"
                    description="Assign operational staff members who will execute tickets under this role."
                />

                <div v-if="loadingAssignableUsers" class="flex justify-center py-8">
                    <a-spin />
                </div>
                <div v-else class="space-y-2">
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Select Users ({{ selectedUserIds.length }} selected)
                    </label>
                    <a-select
                        v-model:value="selectedUserIds"
                        mode="multiple"
                        placeholder="Search and select users..."
                        class="w-full"
                        :filter-option="filterUserOption"
                        allow-clear
                        show-search
                    >
                        <a-select-option
                            v-for="user in assignableUsers"
                            :key="user.id"
                            :value="user.id"
                            :label="`${user.name} (${user.email})`"
                        >
                            <div class="flex flex-col">
                                <span class="font-medium text-gray-900 dark:text-white">{{ user.name }}</span>
                                <span class="text-xs text-gray-500">{{ user.email }}</span>
                            </div>
                        </a-select-option>
                    </a-select>
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue'
import { useHelpdeskService, type HelpdeskRole } from '../../../composables/helpdeskService'
import { useUserService } from '../../../composables/userService'
import { useAuthStore } from '../../../stores/auth'

definePageMeta({
    middleware: 'auth'
})

const authStore = useAuthStore()
const helpdeskService = useHelpdeskService()
const userService = useUserService()

// Permissions
const canView = computed(() => authStore.hasPermission('helpdesk-roles:view'))
const canCreate = computed(() => authStore.hasPermission('helpdesk-roles:create'))
const canUpdate = computed(() => authStore.hasPermission('helpdesk-roles:update'))
const canDelete = computed(() => authStore.hasPermission('helpdesk-roles:delete'))

// Data State
const loading = ref(false)
const roles = ref<HelpdeskRole[]>([])
const searchQuery = ref('')
const activeTab = ref<'operational' | 'system'>('operational')

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

// Assign Users Modal State
const assignModalVisible = ref(false)
const assigningUsers = ref(false)
const loadingAssignableUsers = ref(false)
const activeAssignRole = ref<HelpdeskRole | null>(null)
const selectedUserIds = ref<string[]>([])
const assignableUsers = ref<{ id: string; name: string; email: string }[]>([])

// Columns
const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name', sorter: (a: HelpdeskRole, b: HelpdeskRole) => a.name.localeCompare(b.name) },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Display Order', dataIndex: 'display_order', key: 'display_order', sorter: (a: HelpdeskRole, b: HelpdeskRole) => a.display_order - b.display_order },
    { title: 'Action', key: 'action', width: 140 }
]

// Pagination
const paginationConfig = computed(() => ({
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} roles`
}))

// Helper to determine if a role is the system-managed Authorized Person role
const isSystemRole = (role: HelpdeskRole | any): boolean => {
    if (!role) return false
    const key = (role.key || '').toUpperCase()
    const name = (role.name || '').toUpperCase()
    return key === 'ROLE_HELPDESK_AUTHORIZED_PERSON' || name === 'ROLE_HELPDESK_AUTHORIZED_PERSON'
}

// Split roles by type
const operationalRoles = computed(() => roles.value.filter(role => !isSystemRole(role)))
const systemRoles = computed(() => roles.value.filter(role => isSystemRole(role)))

// Filtered roles based on active tab and search query
const filteredCurrentRoles = computed(() => {
    const list = activeTab.value === 'system' ? systemRoles.value : operationalRoles.value
    if (!searchQuery.value.trim()) return list

    const q = searchQuery.value.toLowerCase().trim()
    return list.filter(role =>
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

// User Assignment Workflow
const openAssignUsersModal = async (role: HelpdeskRole) => {
    activeAssignRole.value = role
    selectedUserIds.value = []
    assignModalVisible.value = true
    loadingAssignableUsers.value = true

    try {
        const [assignedUsersResponse, usersResponse] = await Promise.allSettled([
            helpdeskService.getRoleUsers(role.id),
            isSystemRole(role)
                ? userService.getUsers()
                : userService.getOperationalStaff({ page_size: 9999 })
        ])

        if (usersResponse.status === 'fulfilled') {
            if (isSystemRole(role)) {
                const users = (usersResponse.value as any[]) || []
                assignableUsers.value = users.map(u => ({
                    id: u.id,
                    name: u.name || u.email,
                    email: u.email
                }))
            } else {
                const staffList = (usersResponse.value as any)?.results || (usersResponse.value as any) || []
                assignableUsers.value = staffList.map((s: any) => ({
                    id: s.id,
                    name: s.full_name || s.username || s.email,
                    email: s.email
                }))
            }
        }

        if (assignedUsersResponse.status === 'fulfilled') {
            const roleData = assignedUsersResponse.value as any
            if (Array.isArray(roleData?.user_ids)) {
                selectedUserIds.value = roleData.user_ids
            } else if (Array.isArray(roleData?.users)) {
                selectedUserIds.value = roleData.users.map((u: any) => u.user_id || u.id).filter(Boolean)
            } else if (Array.isArray(roleData)) {
                selectedUserIds.value = roleData.map((item: any) => {
                    if (typeof item === 'string') return item
                    return item.user_id || item.id || item.user?.id || item.user
                }).filter(Boolean)
            }
        }
    } catch (err) {
        console.error('Failed to load users for role assignment:', err)
        message.error('Failed to load assignable users')
    } finally {
        loadingAssignableUsers.value = false
    }
}

const closeAssignModal = () => {
    assignModalVisible.value = false
    activeAssignRole.value = null
    selectedUserIds.value = []
    assignableUsers.value = []
}

const filterUserOption = (input: string, option: any) => {
    const label = option?.label || ''
    return label.toLowerCase().includes(input.toLowerCase())
}

const handleSaveAssignUsers = async () => {
    if (!activeAssignRole.value) return

    assigningUsers.value = true
    const roleId = activeAssignRole.value.id
    const userIds = selectedUserIds.value

    try {
        if (isSystemRole(activeAssignRole.value)) {
            await helpdeskService.assignUsersToSystemRole({
                role_id: roleId,
                user_ids: userIds
            })
        } else {
            await helpdeskService.bulkAssignRoleUsers({
                role_id: roleId,
                user_ids: userIds
            })
        }

        message.success('Users assigned successfully')
        closeAssignModal()
    } catch (err: any) {
        console.error('Failed to assign users to role:', err)
        message.error(err.message || 'Failed to assign users to role')
    } finally {
        assigningUsers.value = false
    }
}

onMounted(() => {
    fetchRoles()
})
</script>
