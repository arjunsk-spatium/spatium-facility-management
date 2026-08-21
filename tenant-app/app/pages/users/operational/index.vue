<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold dark:text-white">Operational Staff</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage operational staff, roles, and facility assignments</p>
            </div>
            <a-button type="primary" @click="openAddStaffModal">
                <template #icon>
                    <PlusOutlined />
                </template>
                Add <span class="hidden sm:inline">Operational Staff</span>
            </a-button>
        </div>

        <!-- Filters & Search -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <a-input-search
                v-model:value="searchQuery"
                placeholder="Search staff by name, email, or phone..."
                allow-clear
                class="max-w-md"
            />
            <a-select
                v-model:value="selectedFacilityFilter"
                placeholder="Filter by Facility"
                allow-clear
                class="w-full sm:w-64"
                :loading="facilitiesLoading"
            >
                <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                    {{ facility.name }}
                </a-select-option>
            </a-select>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <!-- Staff Table -->
        <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <a-table
                :columns="columns"
                :data-source="filteredStaff"
                :loading="loading"
                v-model:pagination="paginationConfig"
                row-key="id"
            >
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'full_name'">
                        <div class="flex items-center gap-3">
                            <a-avatar class="bg-blue-100 text-blue-600 font-semibold flex-shrink-0">
                                {{ (record.full_name || record.username || 'S').charAt(0).toUpperCase() }}
                            </a-avatar>
                            <div>
                                <div class="font-medium text-gray-900 dark:text-white">{{ record.full_name }}</div>
                                <div v-if="record.username" class="text-xs text-gray-400">@{{ record.username }}</div>
                            </div>
                        </div>
                    </template>
                    <template v-else-if="column.key === 'email'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.email }}</span>
                    </template>
                    <template v-else-if="column.key === 'phone_number'">
                        <span class="text-gray-600 dark:text-gray-300">{{ record.phone_number || 'N/A' }}</span>
                    </template>
                    <template v-else-if="column.key === 'facility'">
                        <a-tag color="blue">
                            {{ getFacilityName(record) }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'role'">
                        <a-tag color="purple">
                            {{ getRoleName(record) }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'status'">
                        <a-tag :color="record.status === 'active' || !record.status ? 'green' : 'default'">
                            {{ record.status || 'active' }}
                        </a-tag>
                    </template>
                    <template v-else-if="column.key === 'actions'">
                        <a-space>
                            <a-button type="text" size="small" @click="openEditStaffModal(record)">
                                <EditOutlined />
                            </a-button>
                            <a-popconfirm
                                title="Are you sure you want to delete this staff member?"
                                ok-text="Yes"
                                cancel-text="No"
                                @confirm="handleDeleteStaff(record.id)"
                            >
                                <a-button type="text" danger size="small">
                                    <DeleteOutlined />
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                </template>
            </a-table>
        </div>

        <!-- Add/Edit Operational Staff Modal -->
        <a-modal
            v-model:open="isModalOpen"
            :title="editingStaffId ? 'Edit Operational Staff' : 'Add Operational Staff'"
            :confirm-loading="submitting"
            @ok="handleSubmit"
            @cancel="isModalOpen = false"
        >
            <a-form :model="staffForm" layout="vertical" class="mt-4">
                <a-form-item label="Full Name" required>
                    <a-input v-model:value="staffForm.full_name" placeholder="Enter full name" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="staffForm.email" placeholder="Enter email address" type="email" />
                </a-form-item>
                <a-form-item label="Phone Number">
                    <PhoneInput v-model="staffForm.phone_number" />
                </a-form-item>
                <a-form-item label="Facility">
                    <a-select v-model:value="staffForm.facility_id" placeholder="Select facility" allow-clear>
                        <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                            {{ facility.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="Role">
                    <a-select v-model:value="staffForm.role_id" placeholder="Select role" allow-clear :loading="rolesLoading">
                        <a-select-option v-for="role in roles" :key="role.id" :value="role.id">
                            {{ role.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <template v-if="!editingStaffId">
                    <a-form-item label="Username" required>
                        <a-input v-model:value="staffForm.username" placeholder="Enter username" />
                    </a-form-item>
                    <a-form-item label="Password" required>
                        <a-input-password v-model:value="staffForm.password" placeholder="Enter password" />
                    </a-form-item>
                </template>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useUserService, type OperationalStaff } from '../../../composables/userService'
import { useFacilityService, type Facility } from '../../../composables/facilityService'

definePageMeta({
    middleware: 'auth'
})

const {
    getOperationalStaff,
    createOperationalStaff,
    updateOperationalStaff,
    deleteOperationalStaff
} = useUserService()
const { getFacilities, getFacilityById } = useFacilityService()

// State
const loading = ref(true)
const staffList = ref<OperationalStaff[]>([])
const searchQuery = ref('')
const selectedFacilityFilter = ref<string | undefined>(undefined)
const facilityCache = ref<Record<string, string>>({})

// Pagination state
const paginationConfig = ref({
    current: 1,
    pageSize: 10,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number) => `Total ${total} staff members`
})

// Facilities & Roles
const facilities = ref<Facility[]>([])
const facilitiesLoading = ref(false)
const roles = ref<any[]>([])
const rolesLoading = ref(false)

// Modal State
const isModalOpen = ref(false)
const submitting = ref(false)
const editingStaffId = ref<string | null>(null)
const staffForm = ref({
    full_name: '',
    email: '',
    phone_number: '',
    username: '',
    password: '',
    facility_id: undefined as string | undefined,
    role_id: undefined as string | undefined
})

const columns = [
    { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Facility', key: 'facility' },
    { title: 'Role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    { title: 'Actions', key: 'actions', width: 100 }
]

// Computed
const filteredStaff = computed(() => {
    let result = staffList.value

    if (selectedFacilityFilter.value) {
        result = result.filter(s => {
            const facId = s.facility_id || (typeof s.facility === 'string' ? s.facility : (s.facility as any)?.id)
            return facId === selectedFacilityFilter.value
        })
    }

    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        result = result.filter(s =>
            (s.full_name && s.full_name.toLowerCase().includes(query)) ||
            (s.email && s.email.toLowerCase().includes(query)) ||
            (s.phone_number && s.phone_number.includes(query)) ||
            (s.username && s.username.toLowerCase().includes(query))
        )
    }

    return result
})

watch([searchQuery, selectedFacilityFilter], () => {
    paginationConfig.value.current = 1
})

const getFacilityName = (record: any) => {
    if (!record) return 'N/A'
    if (record.facility_name) return record.facility_name
    if (record.facility_details?.name) return record.facility_details.name

    const facId = record.facility_id || (typeof record.facility === 'string' ? record.facility : record.facility?.id)
    if (!facId) return 'N/A'

    const found = facilities.value.find(f => f.id === facId)
    if (found) return found.name

    if (facilityCache.value[facId]) {
        return facilityCache.value[facId]
    }

    // Fetch asynchronously from API if not found in preloaded list
    getFacilityById(facId).then(fac => {
        if (fac?.name) {
            facilityCache.value[facId] = fac.name
        }
    }).catch(() => {})

    return 'N/A'
}

const getRoleName = (record: any) => {
    if (!record) return 'N/A'
    if (record.role_name) return record.role_name
    if (record.role_details?.name) return record.role_details.name

    const roleId = record.role_id || (typeof record.role === 'string' ? record.role : record.role?.id)
    if (!roleId) return 'N/A'

    const r = roles.value.find(role => role.id === roleId)
    return r ? r.name : 'N/A'
}

// Methods
const fetchStaff = async () => {
    loading.value = true
    try {
        staffList.value = await getOperationalStaff()
    } catch (error) {
        message.error('Failed to load operational staff')
    } finally {
        loading.value = false
    }
}

const fetchFacilities = async () => {
    facilitiesLoading.value = true
    try {
        const response = await getFacilities({ page_size: 9999 })
        facilities.value = response?.facilities || []
    } catch (error) {
        console.error('Failed to load facilities:', error)
        facilities.value = []
    } finally {
        facilitiesLoading.value = false
    }
}

const fetchRoles = async () => {
    rolesLoading.value = true
    try {
        const { $api } = useNuxtApp()
        const response = await $api<any>('/api/portal/helpdesk/roles/')
        const data = response?.data?.data || response?.data
        if (data?.results) {
            roles.value = data.results
        } else if (Array.isArray(data)) {
            roles.value = data
        }
    } catch (error) {
        console.error('Failed to fetch roles:', error)
    } finally {
        rolesLoading.value = false
    }
}

const openAddStaffModal = () => {
    editingStaffId.value = null
    staffForm.value = {
        full_name: '',
        email: '',
        phone_number: '',
        username: '',
        password: '',
        facility_id: selectedFacilityFilter.value,
        role_id: undefined
    }
    isModalOpen.value = true
}

const openEditStaffModal = (record: OperationalStaff | any) => {
    editingStaffId.value = record.id
    const facId = record.facility_id || (typeof record.facility === 'string' ? record.facility : record.facility?.id)
    const roleId = record.role_id || (typeof record.role === 'string' ? record.role : record.role?.id)

    staffForm.value = {
        full_name: record.full_name || '',
        email: record.email || '',
        phone_number: record.phone_number || '',
        username: record.username || '',
        password: '',
        facility_id: facId || undefined,
        role_id: roleId || undefined
    }
    isModalOpen.value = true
}

const handleSubmit = async () => {
    if (!staffForm.value.full_name || !staffForm.value.email) {
        message.error('Please fill in full name and email')
        return
    }

    if (!editingStaffId.value && (!staffForm.value.username || !staffForm.value.password)) {
        message.error('Username and password are required for new staff')
        return
    }

    submitting.value = true
    try {
        if (editingStaffId.value) {
            await updateOperationalStaff(editingStaffId.value, {
                full_name: staffForm.value.full_name,
                email: staffForm.value.email,
                phone_number: staffForm.value.phone_number,
                ...(staffForm.value.facility_id && { facility_id: staffForm.value.facility_id }),
                ...(staffForm.value.role_id && { role_id: staffForm.value.role_id })
            })
            message.success('Operational staff updated successfully')
        } else {
            await createOperationalStaff({
                full_name: staffForm.value.full_name,
                email: staffForm.value.email,
                phone_number: staffForm.value.phone_number,
                username: staffForm.value.username,
                password: staffForm.value.password,
                ...(staffForm.value.facility_id && { facility_id: staffForm.value.facility_id }),
                ...(staffForm.value.role_id && { role_id: staffForm.value.role_id })
            })
            message.success('Operational staff created successfully')
        }
        isModalOpen.value = false
        await fetchStaff()
    } catch (e: any) {
        console.error('Failed to save operational staff:', e)
        message.error(e.message || 'Failed to save operational staff')
    } finally {
        submitting.value = false
    }
}

const handleDeleteStaff = async (id: string) => {
    try {
        await deleteOperationalStaff(id)
        message.success('Staff member deleted successfully')
        await fetchStaff()
    } catch (error) {
        message.error('Failed to delete staff member')
    }
}

onMounted(() => {
    fetchStaff()
    fetchFacilities()
    fetchRoles()
})
</script>
