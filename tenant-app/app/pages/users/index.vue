<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">User Module Management</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage user access and module assignments</p>
            </div>
            <a-button type="primary" @click="openAddUserModal">
                <template #icon>
                    <PlusOutlined />
                </template>
                Add <span class="hidden sm:inline">User</span>
            </a-button>
        </div>

        <!-- Search -->
        <a-input-search v-model:value="searchQuery" placeholder="Search users by name or email..." allow-clear
            class="max-w-md" />

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <!-- User List -->
        <div v-else class="space-y-4">
            <div v-if="filteredUsers.length === 0" class="text-center py-12 text-gray-500">
                No users found.
            </div>

            <!-- User Cards -->
            <div v-for="user in filteredUsers" :key="user.id" class="user-card">
                <a-card>
                    <!-- User Header -->
                    <div class="flex flex-col sm:flex-row sm:items-center gap-4">
                        <!-- User Info -->
                        <div class="flex items-center gap-3 flex-1" @click="toggleUserExpand(user.id)">
                            <a-avatar :size="48" class="bg-primary-100 text-primary-600">
                                {{ user.name.charAt(0).toUpperCase() }}
                            </a-avatar>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-semibold text-gray-900 dark:text-white truncate">{{ user.name }}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                                <span
                                    class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    {{ user.role }}
                                </span>
                            </div>
                            <!-- Expand Toggle (Mobile) -->
                            <div class="sm:hidden">
                                <DownOutlined v-if="!expandedUsers.includes(user.id)" class="text-gray-400" />
                                <UpOutlined v-else class="text-gray-400" />
                            </div>
                        </div>

                        <!-- Actions (Desktop) -->
                        <div class="hidden sm:flex items-center gap-2">
                            <a-button type="text" @click="openEditUserModal(user)">
                                <EditOutlined />
                            </a-button>
                            <a-popconfirm title="Are you sure you want to delete this user?" ok-text="Yes"
                                cancel-text="No" @confirm="handleDeleteUser(user.id)">
                                <a-button type="text" danger>
                                    <DeleteOutlined />
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </div>

                    <!-- Module Assignment Area (Expanded or Always visible on desktop) -->
                    <div :class="[
                        'mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
                        { 'hidden': !expandedUsers.includes(user.id) && isMobile }
                    ]">
                        <p class="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">Module Access:</p>

                        <!-- Desktop: Two-column drag zones -->
                        <div class="hidden md:grid md:grid-cols-2 gap-4">
                            <!-- Available Modules -->
                            <div class="module-zone available-zone p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 min-h-[120px]"
                                @dragover.prevent @drop="handleDrop($event, user.id, 'available')">
                                <p class="text-xs font-medium text-gray-500 mb-2">Available Modules</p>
                                <div class="flex flex-wrap gap-2">
                                    <div v-for="mod in getAvailableModules(user)" :key="mod.key"
                                        class="module-chip available" draggable="true"
                                        @dragstart="handleDragStart($event, mod.key, user.id)">
                                        {{ mod.label }}
                                    </div>
                                    <span v-if="getAvailableModules(user).length === 0" class="text-xs text-gray-400">
                                        All modules assigned
                                    </span>
                                </div>
                            </div>

                            <!-- Assigned Modules -->
                            <div class="module-zone assigned-zone p-3 rounded-lg border-2 border-dashed border-primary-300 dark:border-primary-600 bg-primary-50/50 dark:bg-primary-900/10 min-h-[120px]"
                                @dragover.prevent @drop="handleDrop($event, user.id, 'assigned')">
                                <p class="text-xs font-medium text-primary-600 dark:text-primary-400 mb-2">Assigned
                                    Modules <span class="text-xs font-normal">(drag to reorder)</span></p>
                                <div class="flex flex-wrap gap-2">
                                    <div v-for="(mod, index) in getAssignedModules(user)" :key="mod.key"
                                        class="module-chip assigned" draggable="true"
                                        @dragstart="handleDragStart($event, mod.key, user.id, index)"
                                        @dragover.prevent="handleDragOver($event, user.id, index)"
                                        @drop.stop="handleReorder($event, user.id, index)">
                                        {{ mod.label }}
                                    </div>
                                    <span v-if="getAssignedModules(user).length === 0" class="text-xs text-gray-400">
                                        No modules assigned
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Mobile: Tap to toggle chips -->
                        <div class="md:hidden space-y-3">
                            <div class="flex flex-wrap gap-2">
                                <div v-for="mod in tenantModules" :key="mod.key" :class="[
                                    'module-chip-mobile cursor-pointer',
                                    user.modules.includes(mod.key) ? 'assigned' : 'available'
                                ]" @click="toggleModule(user, mod.key)">
                                    <CheckOutlined v-if="user.modules.includes(mod.key)" class="text-xs mr-1" />
                                    {{ mod.label }}
                                </div>
                            </div>
                        </div>

                        <!-- Save Button -->
                        <div class="mt-3 flex justify-between items-center">
                            <!-- Mobile Actions -->
                            <div class="flex gap-2 sm:hidden">
                                <a-button size="small" @click="openEditUserModal(user)">
                                    <EditOutlined /> Edit
                                </a-button>
                                <a-popconfirm title="Delete this user?" ok-text="Yes" cancel-text="No"
                                    @confirm="handleDeleteUser(user.id)">
                                    <a-button size="small" danger>
                                        <DeleteOutlined /> Delete
                                    </a-button>
                                </a-popconfirm>
                            </div>
                            <div class="flex-1"></div>
                            <a-button v-if="hasModuleChanges(user)" type="primary" size="small"
                                :loading="savingUserId === user.id" @click="saveUserModules(user)">
                                Save Changes
                            </a-button>
                        </div>
                    </div>
                </a-card>
            </div>
        </div>

        <!-- Add/Edit User Modal -->
        <a-modal v-model:open="userModalVisible" :title="editingUser ? 'Edit User' : 'Add User'"
            :confirm-loading="userModalLoading" @ok="handleUserSubmit" @cancel="closeUserModal">
            <a-form :model="userForm" layout="vertical" class="mt-4">
                <a-form-item label="Name" required>
                    <a-input v-model:value="userForm.name" placeholder="Enter full name" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="userForm.email" placeholder="Enter email address" type="email" />
                </a-form-item>
                <a-form-item label="Phone">
                    <a-input v-model:value="userForm.phone" placeholder="Enter phone number" />
                </a-form-item>
                <a-form-item label="Role">
                    <a-select v-model:value="userForm.role" placeholder="Select role">
                        <a-select-option value="Admin">Admin</a-select-option>
                        <a-select-option value="Manager">Manager</a-select-option>
                        <a-select-option value="Staff">Staff</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined,
    DownOutlined,
    UpOutlined,
    CheckOutlined
} from '@ant-design/icons-vue'
import { useUserService, type User, type Module } from '../../../composables/userService'
import { useSidebar } from '../../../composables/useSidebar'

definePageMeta({
    middleware: 'auth'
})

const { getUsers, getTenantModules, updateUserModules, createUser, updateUser, deleteUser } = useUserService()
const { isMobile } = useSidebar()

// State
const loading = ref(true)
const users = ref<User[]>([])
const tenantModules = ref<Module[]>([])
const searchQuery = ref('')
const expandedUsers = ref<number[]>([])
const originalUserModules = ref<Record<number, string[]>>({})
const savingUserId = ref<number | null>(null)

// User Modal
const userModalVisible = ref(false)
const userModalLoading = ref(false)
const editingUser = ref<User | null>(null)
const userForm = ref({
    name: '',
    email: '',
    phone: '',
    role: 'Staff'
})

// Computed
const filteredUsers = computed(() => {
    if (!searchQuery.value) return users.value
    const query = searchQuery.value.toLowerCase()
    return users.value.filter(u =>
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query)
    )
})

// Methods
const fetchData = async () => {
    loading.value = true
    try {
        const [usersData, modulesData] = await Promise.all([
            getUsers(),
            getTenantModules()
        ])
        users.value = usersData
        tenantModules.value = modulesData
        // Store original modules for change detection
        usersData.forEach(u => {
            originalUserModules.value[u.id] = [...u.modules]
        })
    } catch (error) {
        message.error('Failed to load data')
    } finally {
        loading.value = false
    }
}

const toggleUserExpand = (userId: number) => {
    if (isMobile.value) {
        const index = expandedUsers.value.indexOf(userId)
        if (index > -1) {
            expandedUsers.value.splice(index, 1)
        } else {
            expandedUsers.value.push(userId)
        }
    }
}

const getAvailableModules = (user: User) => {
    return tenantModules.value.filter(m => !user.modules.includes(m.key))
}

const getAssignedModules = (user: User) => {
    // Preserve the order from user.modules
    return user.modules
        .map(key => tenantModules.value.find(m => m.key === key))
        .filter((m): m is Module => m !== undefined)
}

// Drag and Drop
const draggedModuleIndex = ref<number | null>(null)

const handleDragStart = (event: DragEvent, moduleKey: string, userId: number, index?: number) => {
    const target = event.target as HTMLElement

    // Set the drag image to the actual element for pill shape
    if (event.dataTransfer && target) {
        event.dataTransfer.effectAllowed = 'move'
        // Create a clone for the drag image
        const clone = target.cloneNode(true) as HTMLElement
        clone.style.position = 'absolute'
        clone.style.top = '-1000px'
        clone.style.opacity = '0.9'
        document.body.appendChild(clone)
        event.dataTransfer.setDragImage(clone, target.offsetWidth / 2, target.offsetHeight / 2)
        // Remove the clone after drag starts
        setTimeout(() => document.body.removeChild(clone), 0)
    }

    event.dataTransfer?.setData('moduleKey', moduleKey)
    event.dataTransfer?.setData('userId', userId.toString())
    if (index !== undefined) {
        event.dataTransfer?.setData('sourceIndex', index.toString())
        draggedModuleIndex.value = index
    }
}

const handleDragOver = (event: DragEvent, userId: number, targetIndex: number) => {
    event.preventDefault()
}

const handleReorder = (event: DragEvent, userId: number, targetIndex: number) => {
    const moduleKey = event.dataTransfer?.getData('moduleKey')
    const sourceUserId = parseInt(event.dataTransfer?.getData('userId') || '0')
    const sourceIndex = parseInt(event.dataTransfer?.getData('sourceIndex') || '-1')

    if (!moduleKey || sourceUserId !== userId || sourceIndex === -1) return
    if (sourceIndex === targetIndex) return

    const user = users.value.find((u: User) => u.id === userId)
    if (!user) return

    // Reorder: remove from source and insert at target
    const modules = [...user.modules]
    const [removed] = modules.splice(sourceIndex, 1)
    modules.splice(targetIndex, 0, removed)
    user.modules = modules
    draggedModuleIndex.value = null
}

const handleDrop = (event: DragEvent, userId: number, zone: 'available' | 'assigned') => {
    const moduleKey = event.dataTransfer?.getData('moduleKey')
    const sourceUserId = parseInt(event.dataTransfer?.getData('userId') || '0')

    if (!moduleKey || sourceUserId !== userId) return

    const user = users.value.find((u: User) => u.id === userId)
    if (!user) return

    if (zone === 'assigned' && !user.modules.includes(moduleKey)) {
        user.modules.push(moduleKey)
    } else if (zone === 'available' && user.modules.includes(moduleKey)) {
        user.modules = user.modules.filter((m: string) => m !== moduleKey)
    }
    draggedModuleIndex.value = null
}

// Mobile: Tap to toggle
const toggleModule = (user: User, moduleKey: string) => {
    if (user.modules.includes(moduleKey)) {
        user.modules = user.modules.filter(m => m !== moduleKey)
    } else {
        user.modules.push(moduleKey)
    }
}

const hasModuleChanges = (user: User) => {
    const original = originalUserModules.value[user.id] || []
    if (original.length !== user.modules.length) return true
    return !original.every(m => user.modules.includes(m))
}

const saveUserModules = async (user: User) => {
    savingUserId.value = user.id
    try {
        await updateUserModules(user.id, user.modules)
        originalUserModules.value[user.id] = [...user.modules]
        message.success('Modules updated successfully')
    } catch (error) {
        message.error('Failed to update modules')
    } finally {
        savingUserId.value = null
    }
}

// User Modal Methods
const openAddUserModal = () => {
    editingUser.value = null
    userForm.value = { name: '', email: '', phone: '', role: 'Staff' }
    userModalVisible.value = true
}

const openEditUserModal = (user: User) => {
    editingUser.value = user
    userForm.value = {
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        role: user.role
    }
    userModalVisible.value = true
}

const closeUserModal = () => {
    userModalVisible.value = false
    userForm.value = { name: '', email: '', phone: '', role: 'Staff' }
    editingUser.value = null
}

const handleUserSubmit = async () => {
    if (!userForm.value.name || !userForm.value.email) {
        message.warning('Please fill in required fields')
        return
    }

    userModalLoading.value = true
    try {
        if (editingUser.value) {
            await updateUser(editingUser.value.id, userForm.value)
            const index = users.value.findIndex(u => u.id === editingUser.value!.id)
            if (index > -1) {
                users.value[index] = { ...users.value[index], ...userForm.value }
            }
            message.success('User updated successfully')
        } else {
            const newUser = await createUser({
                ...userForm.value,
                modules: ['dashboard']
            })
            users.value.push(newUser)
            originalUserModules.value[newUser.id] = ['dashboard']
            message.success('User created successfully')
        }
        closeUserModal()
    } catch (error) {
        message.error('Failed to save user')
    } finally {
        userModalLoading.value = false
    }
}

const handleDeleteUser = async (userId: number) => {
    try {
        await deleteUser(userId)
        users.value = users.value.filter(u => u.id !== userId)
        message.success('User deleted successfully')
    } catch (error) {
        message.error('Failed to delete user')
    }
}

onMounted(fetchData)
</script>

<style scoped>
.module-chip {
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: grab;
    user-select: none;
    transition: all 0.15s ease;
}

.module-chip.available {
    background-color: #f3f4f6;
    color: #374151;
}

.module-chip.available:hover {
    background-color: #e5e7eb;
}

.module-chip.assigned {
    background-color: var(--color-primary-100, #dbeafe);
    color: var(--color-primary-700, #1d4ed8);
}

:global(.dark) .module-chip.available {
    background-color: #374151;
    color: #e5e7eb;
}

:global(.dark) .module-chip.available:hover {
    background-color: #4b5563;
}

:global(.dark) .module-chip.assigned {
    background-color: rgba(var(--color-primary-900-rgb, 30, 58, 138), 0.5);
    color: var(--color-primary-300, #93c5fd);
}

.module-chip-mobile {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
    border: 1px solid;
}

.module-chip-mobile.available {
    background-color: #f3f4f6;
    color: #4b5563;
    border-color: #e5e7eb;
}

.module-chip-mobile.assigned {
    background-color: var(--color-primary-100, #dbeafe);
    color: var(--color-primary-700, #1d4ed8);
    border-color: var(--color-primary-300, #93c5fd);
}

:global(.dark) .module-chip-mobile.available {
    background-color: #1f2937;
    color: #d1d5db;
    border-color: #374151;
}

:global(.dark) .module-chip-mobile.assigned {
    background-color: rgba(var(--color-primary-900-rgb, 30, 58, 138), 0.5);
    color: var(--color-primary-300, #93c5fd);
    border-color: var(--color-primary-700, #1d4ed8);
}
</style>
