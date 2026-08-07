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
                            <a-button @click="openFacilityModal(user)">
                                Manage Facilities
                            </a-button>
                            <a-button type="text" @click="navigateTo(`/users/${user.id}`)">
                                View
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
                    <div class="mt-4 flex flex-wrap gap-2 sm:hidden">
                        <a-button size="small" type="primary" ghost @click="openModuleModal(user)">
                            Access
                        </a-button>
                        <a-button size="small" @click="openFacilityModal(user)">
                            Facilities
                        </a-button>
                        <a-button size="small" @click="navigateTo(`/users/${user.id}`)">
                            View
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
        <UserModuleAssignmentModal
            v-if="activeModuleUser"
            v-model:open="moduleModalVisible"
            :user="activeModuleUser"
            @saved="fetchData" />

        <!-- Facility Management Modal -->
        <UserFacilityAssignmentModal
            v-if="activeFacilityUser"
            v-model:open="facilityModalVisible"
            :user="activeFacilityUser"
            @saved="fetchData" />

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
                    <PhoneInput v-model="userForm.phone" />
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
    DeleteOutlined
} from '@ant-design/icons-vue'
import { useUserService, type User } from '../../../composables/userService'
import { useSidebar } from '../../../composables/useSidebar'
import UserModuleAssignmentModal from '../../../components/UserModuleAssignmentModal.vue'
import UserFacilityAssignmentModal from '../../../components/UserFacilityAssignmentModal.vue'

definePageMeta({
    middleware: 'auth'
})

const { getUsers, createUser, updateUser, deleteUser } = useUserService()
const { isMobile } = useSidebar()

// State
const loading = ref(true)
const users = ref<User[]>([])
const searchQuery = ref('')

// Module Modal
const moduleModalVisible = ref(false)
const activeModuleUser = ref<User | null>(null)

// Facility Modal
const facilityModalVisible = ref(false)
const activeFacilityUser = ref<User | null>(null)

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
        users.value = await getUsers()
    } catch (error) {
        message.error('Failed to load data')
    } finally {
        loading.value = false
    }
}

// Module Modal Methods
const openModuleModal = (user: User) => {
    activeModuleUser.value = user
    moduleModalVisible.value = true
}

// Facility Modal Methods
const openFacilityModal = (user: User) => {
    activeFacilityUser.value = user
    facilityModalVisible.value = true
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
            if (emailError?.message) {
                message.error(emailError.message)
                userModalLoading.value = false
                return
            }
        }
        message.error(err.message || 'Failed to save user')
    } finally {
        userModalLoading.value = false
    }
}

const handleDeleteUser = async (userId: string) => {
    try {
        await deleteUser(userId)
        users.value = users.value.filter(u => u.id !== userId)
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
