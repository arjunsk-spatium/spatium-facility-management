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
                        <div class="flex items-center gap-3 flex-1">
                            <a-avatar :size="48" class="bg-primary-100 text-primary-600 flex-shrink-0">
                                {{ user.name.charAt(0).toUpperCase() }}
                            </a-avatar>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <span class="font-semibold text-gray-900 dark:text-white truncate">{{ user.name }}</span>
                                    <span v-if="user.status"
                                        :class="[
                                            'w-2 h-2 rounded-full flex-shrink-0',
                                            user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                                        ]"
                                        :title="user.status">
                                    </span>
                                </div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 truncate">{{ user.email }}</p>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <span v-for="app in user.apps" :key="app"
                                        class="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                        {{ app }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Actions (Desktop) -->
                        <div class="hidden sm:flex items-center gap-2">
                            <a-button type="primary" ghost @click="openModuleModal(user)">
                                Manage Access
                            </a-button>
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

                    <!-- Mobile Actions -->
                    <div class="mt-4 flex gap-2 sm:hidden">
                        <a-button size="small" type="primary" ghost @click="openModuleModal(user)">
                            Access
                        </a-button>
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
                </a-card>
            </div>
        </div>

        <!-- Module Management Modal -->
        <a-modal v-model:open="moduleModalVisible" 
            :title="`Manage Access - ${activeModuleUser?.name}`"
            width="900px"
            style="top: 20px;"
            :destroyOnClose="true"
            @cancel="closeModuleModal">
            <template #footer>
                <a-button @click="closeModuleModal">Cancel</a-button>
                <a-button v-if="activeModuleUser && hasModuleChanges(activeModuleUser)" type="primary" :loading="savingUserId === activeModuleUser.id" @click="saveUserModules(activeModuleUser)">
                    Save Changes
                </a-button>
            </template>
            
            <div v-if="activeModuleUser" class="mt-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="mod in systemModules" :key="mod.id" 
                        class="module-card p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between mb-2">
                            <span class="font-medium text-gray-900 dark:text-white">{{ mod.module }}</span>
                            <a-checkbox 
                                :checked="isModuleFullyAssigned(activeModuleUser, mod)" 
                                :indeterminate="isModulePartiallyAssigned(activeModuleUser, mod)"
                                @change="toggleModuleAll(activeModuleUser, mod)"
                            >
                                All
                            </a-checkbox>
                        </div>
                        <div class="space-y-2">
                            <div v-for="submod in mod.submodules" :key="submod.id" class="submodule-item">
                                <div class="flex items-center gap-2 text-sm">
                                    <a-checkbox 
                                        :checked="isSubmoduleFullyAssigned(activeModuleUser, submod)"
                                        :indeterminate="isSubmodulePartiallyAssigned(activeModuleUser, submod)"
                                        @change="toggleSubmoduleAll(activeModuleUser, submod, mod)"
                                    >
                                        {{ submod.name }}
                                    </a-checkbox>
                                </div>
                                <div class="ml-6 mt-1 flex flex-wrap gap-1">
                                    <span v-for="perm in submod.permissions" :key="perm.id"
                                        :class="[
                                            'text-xs px-1.5 py-0.5 rounded cursor-pointer',
                                            isPermissionAssigned(activeModuleUser, perm.id) 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                        ]"
                                        @click="togglePermission(activeModuleUser, perm.id)">
                                        {{ perm.name }}
                                    </span>
                                </div>
                                <div v-if="submod.features && submod.features.length" class="ml-6 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <div class="text-xs font-medium text-gray-500 mb-1">Features</div>
                                    <div class="flex flex-col gap-1.5">
                                        <div v-for="feat in submod.features" :key="feat.id" class="flex items-center gap-2 flex-wrap">
                                            <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">{{ feat.name }}:</span>
                                            <span v-for="perm in feat.permissions" :key="perm.id"
                                                :class="[
                                                    'text-xs px-1.5 py-0.5 rounded cursor-pointer',
                                                    isFeaturePermissionAssigned(activeModuleUser, perm.id) 
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                        : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                                ]"
                                                @click="toggleFeaturePermission(activeModuleUser, perm.id)">
                                                {{ perm.name }}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </a-modal>

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
            </a-form>
        </a-modal>

        <!-- Existing User Confirmation Modal -->
        <a-modal v-model:open="existingUserConfirmVisible" title="User Already Exists" :confirm-loading="existingUserSaving" @ok="handleConfirmExistingUser">
            <p>User ID <strong>{{ existingUserId }}</strong> already exists.</p>
            <p class="mt-2">{{ existingUserMessage }}</p>
            <p class="mt-2 text-gray-600">Do you want to add this user to the org_portal app?</p>
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
    UpOutlined
} from '@ant-design/icons-vue'
import { useUserService, type User, type SystemModule } from '../../../composables/userService'
import { useSidebar } from '../../../composables/useSidebar'

definePageMeta({
    middleware: 'auth'
})

const { getUsers, getAllSystemModules, getUserAssignedModules, assignModulesToUser, createUser, updateUser, deleteUser } = useUserService()
const { isMobile } = useSidebar()

// State
const loading = ref(true)
const users = ref<User[]>([])
const systemModules = ref<SystemModule[]>([])
const userAssignedPermissions = ref<Record<string, Set<string>>>({})
const originalUserPermissions = ref<Record<string, Set<string>>>({})
const userAssignedFeatures = ref<Record<string, Set<string>>>({})
const originalUserFeatures = ref<Record<string, Set<string>>>({})
const searchQuery = ref('')
const savingUserId = ref<string | null>(null)

// Module Modal
const moduleModalVisible = ref(false)
const activeModuleUser = ref<User | null>(null)

// User Modal
const userModalVisible = ref(false)
const userModalLoading = ref(false)
const editingUser = ref<User | null>(null)
const existingUserConfirmVisible = ref(false)
const existingUserSaving = ref(false)
const existingUserId = ref('')
const existingUserMessage = ref('')
const userForm = ref({
    name: '',
    email: '',
    phone: ''
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
            getAllSystemModules()
        ])
        users.value = usersData
        systemModules.value = modulesData
        
        // Load assigned permissions for each user
        for (const user of usersData) {
            const assignedPerms = await getUserAssignedModules(user.id)
            userAssignedPermissions.value[user.id] = new Set(assignedPerms.submodules)
            originalUserPermissions.value[user.id] = new Set(assignedPerms.submodules)
            
            userAssignedFeatures.value[user.id] = new Set(assignedPerms.features)
            originalUserFeatures.value[user.id] = new Set(assignedPerms.features)
        }
    } catch (error) {
        message.error('Failed to load data')
    } finally {
        loading.value = false
    }
}

// Methods - Fetch and Utility

const isModuleFullyAssigned = (user: User, mod: SystemModule): boolean => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return false
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    const totalCount = allPerms.length + allFeatPerms.length
    return totalCount > 0 && allPerms.every(p => userPerms.has(p)) && allFeatPerms.every(p => userFeats.has(p))
}

const isModulePartiallyAssigned = (user: User, mod: SystemModule): boolean => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return false
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    const assignedCount = allPerms.filter(p => userPerms.has(p)).length + allFeatPerms.filter(p => userFeats.has(p)).length
    const totalCount = allPerms.length + allFeatPerms.length
    
    return assignedCount > 0 && assignedCount < totalCount
}

const isSubmoduleFullyAssigned = (user: User, submod: any): boolean => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return false
    
    const allPerms = submod.permissions.map((p: any) => p.id)
    const allFeatPerms = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    const totalCount = allPerms.length + allFeatPerms.length
    return totalCount > 0 && allPerms.every((p: string) => userPerms.has(p)) && allFeatPerms.every((p: string) => userFeats.has(p))
}

const isSubmodulePartiallyAssigned = (user: User, submod: any): boolean => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return false
    
    const allPerms = submod.permissions.map((p: any) => p.id)
    const allFeatPerms = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    const assignedCount = allPerms.filter((p: string) => userPerms.has(p)).length + allFeatPerms.filter((p: string) => userFeats.has(p)).length
    const totalCount = allPerms.length + allFeatPerms.length
    return assignedCount > 0 && assignedCount < totalCount
}

const isPermissionAssigned = (user: User, permissionId: string): boolean => {
    const userPerms = userAssignedPermissions.value[user.id]
    return userPerms ? userPerms.has(permissionId) : false
}

const isFeaturePermissionAssigned = (user: User, permissionId: string): boolean => {
    const userFeats = userAssignedFeatures.value[user.id]
    return userFeats ? userFeats.has(permissionId) : false
}

const toggleModuleAll = (user: User, mod: SystemModule) => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    const allAssigned = allPerms.every(p => userPerms.has(p)) && allFeatPerms.every(p => userFeats.has(p))
    
    if (allAssigned) {
        allPerms.forEach(p => userPerms.delete(p))
        allFeatPerms.forEach(p => userFeats.delete(p))
    } else {
        allPerms.forEach(p => userPerms.add(p))
        allFeatPerms.forEach(p => userFeats.add(p))
    }
}

const toggleSubmoduleAll = (user: User, submod: any, mod: SystemModule) => {
    const userPerms = userAssignedPermissions.value[user.id]
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userPerms || !userFeats) return
    
    const allPerms: string[] = submod.permissions.map((p: any) => p.id)
    const allFeatPerms: string[] = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    const allAssigned = allPerms.every((p: string) => userPerms.has(p)) && allFeatPerms.every((p: string) => userFeats.has(p))
    
    if (allAssigned) {
        allPerms.forEach((p: string) => userPerms.delete(p))
        allFeatPerms.forEach((p: string) => userFeats.delete(p))
    } else {
        allPerms.forEach((p: string) => userPerms.add(p))
        allFeatPerms.forEach((p: string) => userFeats.add(p))
    }
}

const togglePermission = (user: User, permissionId: string) => {
    const userPerms = userAssignedPermissions.value[user.id]
    if (!userPerms) return
    
    if (userPerms.has(permissionId)) {
        userPerms.delete(permissionId)
    } else {
        userPerms.add(permissionId)
    }
}

const toggleFeaturePermission = (user: User, permissionId: string) => {
    const userFeats = userAssignedFeatures.value[user.id]
    if (!userFeats) return
    
    if (userFeats.has(permissionId)) {
        userFeats.delete(permissionId)
    } else {
        userFeats.add(permissionId)
    }
}

const hasModuleChanges = (user: User): boolean => {
    const original = originalUserPermissions.value[user.id]
    const current = userAssignedPermissions.value[user.id]
    const originalFeat = originalUserFeatures.value[user.id]
    const currentFeat = userAssignedFeatures.value[user.id]
    
    if (!original || !current || !originalFeat || !currentFeat) return false
    if (original.size !== current.size || originalFeat.size !== currentFeat.size) return true
    
    for (const p of original) {
        if (!current.has(p)) return true
    }
    for (const p of originalFeat) {
        if (!currentFeat.has(p)) return true
    }
    return false
}

const saveUserModules = async (user: User) => {
    savingUserId.value = user.id
    try {
        const userPerms = userAssignedPermissions.value[user.id]
        const permissionArray = Array.from(userPerms || [])
        
        const userFeats = userAssignedFeatures.value[user.id]
        const featureArray = Array.from(userFeats || [])
        
        await assignModulesToUser(user.id, permissionArray, featureArray)
        
        originalUserPermissions.value[user.id] = new Set(userPerms)
        originalUserFeatures.value[user.id] = new Set(userFeats)
        message.success('Modules updated successfully')
        closeModuleModal()
    } catch (error) {
        message.error('Failed to update modules')
    } finally {
        savingUserId.value = null
    }
}

// Module Modal Methods
const openModuleModal = (user: User) => {
    activeModuleUser.value = user
    moduleModalVisible.value = true
}

const closeModuleModal = () => {
    moduleModalVisible.value = false
    activeModuleUser.value = null
}

// User Modal Methods
const openAddUserModal = () => {
    editingUser.value = null
    userForm.value = { name: '', email: '', phone: '' }
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
    userForm.value = { name: '', email: '', phone: '' }
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
            if (index > -1 && users.value[index]) {
                users.value[index]!.name = userForm.value.name
                users.value[index]!.email = userForm.value.email
                users.value[index]!.phone = userForm.value.phone
            }
            message.success('User updated successfully')
        } else {
            const newUser = await createUser({
                ...userForm.value,
                modules: ['Hub']
            })
            users.value.push(newUser)
            userAssignedPermissions.value[newUser.id] = new Set()
            originalUserPermissions.value[newUser.id] = new Set()
            userAssignedFeatures.value[newUser.id] = new Set()
            originalUserFeatures.value[newUser.id] = new Set()
            message.success('User created successfully')
        }
        closeUserModal()
    } catch (err: any) {
        if (err.data?.code === 'USER_CREATION_ERROR' && err.data?.error?.type === 'VALIDATION_ERROR') {
            const userIdError = err.data?.error?.fields?.user_id?.[0]
            const emailError = err.data?.error?.fields?.email?.[0]
            if (userIdError) {
                existingUserId.value = userIdError.message
                existingUserMessage.value = emailError?.message || 'User already exists in another app.'
                existingUserConfirmVisible.value = true
                userModalLoading.value = false
                return
            }
        }
        message.error('Failed to save user')
    } finally {
        userModalLoading.value = false
    }
}

const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser(userId)
        users.value = users.value.filter(u => u.id !== userId)
        delete userAssignedPermissions.value[userId]
        delete originalUserPermissions.value[userId]
        delete userAssignedFeatures.value[userId]
        delete originalUserFeatures.value[userId]
        message.success('User deleted successfully')
    } catch (error) {
        message.error('Failed to delete user')
    }
}

const handleConfirmExistingUser = async () => {
    existingUserSaving.value = true
    existingUserConfirmVisible.value = false
    try {
        const { $api } = useNuxtApp()
        await $api<any>(`/api/portal/users/org_portal/${existingUserId.value}/update/`, {
            method: 'PATCH',
            body: {
                app_name: 'org_portal',
                full_name: userForm.value.name,
                email: userForm.value.email,
                phone_number: userForm.value.phone,
            }
        })
        message.success('User added successfully')
        closeUserModal()
        await fetchData()
    } catch (error) {
        message.error('Failed to add user to org_portal')
    } finally {
        existingUserSaving.value = false
    }
}

onMounted(fetchData)
</script>

<style scoped>
.module-card {
    background-color: #fafafa;
    transition: all 0.15s ease;
}

.dark .module-card {
    background-color: #1f2937;
}

.submodule-item {
    padding: 0.25rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.dark .submodule-item {
    border-bottom-color: #374151;
}

.submodule-item:last-child {
    border-bottom: none;
}
</style>
