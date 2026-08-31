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
                @search="handleSearch"
                @pressEnter="handleSearch"
            />
            <a-select
                v-model:value="selectedFacilityFilter"
                placeholder="Filter by Facility"
                allow-clear
                class="w-full sm:w-64"
                :loading="facilitiesLoading"
                @change="handleFacilityFilterChange"
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
                :data-source="staffList"
                :loading="loading"
                :pagination="paginationConfig"
                :scroll="{ x: 800 }"
                @change="handleTableChange"
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
                        <div class="flex flex-wrap gap-1 items-center">
                            <template v-if="record.is_all_facilities">
                                <a-tag color="blue">All facilities</a-tag>
                            </template>
                            <template v-else>
                                <template v-for="(name, idx) in getFacilityNames(record)" :key="idx">
                                    <a-tag color="blue">{{ name }}</a-tag>
                                </template>
                            </template>
                        </div>
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
                            <a-tooltip title="Manage Facilities">
                                <a-button type="text" size="small" @click="openFacilityModal(record)">
                                    <BankOutlined />
                                </a-button>
                            </a-tooltip>
                            <a-tooltip title="Edit Staff">
                                <a-button type="text" size="small" @click="openEditStaffModal(record)">
                                    <EditOutlined />
                                </a-button>
                            </a-tooltip>
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

        <!-- Facility Assignment Modal -->
        <UserFacilityAssignmentModal
            v-if="activeFacilityStaff"
            v-model:open="facilityModalVisible"
            :user="activeFacilityStaff"
            @saved="handleFacilityAssignmentSaved"
        />

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
                <a-form-item label="Facilities">
                    <div class="space-y-2">
                        <a-checkbox v-model:checked="staffForm.is_all_facilities">
                            All facilities
                        </a-checkbox>
                        <a-select
                            v-if="!staffForm.is_all_facilities"
                            v-model:value="staffForm.facility_ids"
                            mode="multiple"
                            placeholder="Select facilities"
                            allow-clear
                            :loading="facilitiesLoading"
                            class="w-full"
                        >
                            <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                                {{ facility.name }}
                            </a-select-option>
                        </a-select>
                    </div>
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
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons-vue'
import UserFacilityAssignmentModal from '../../../components/UserFacilityAssignmentModal.vue'
import { useUserService, type OperationalStaff } from '../../../composables/userService'
import { useFacilityService, type Facility } from '../../../composables/facilityService'

definePageMeta({
    middleware: 'auth'
})

const {
    getOperationalStaff,
    createOperationalStaff,
    updateOperationalStaff,
    deleteOperationalStaff,
    getUserFacilities,
    assignUserFacilities
} = useUserService()
const { getFacilities, getFacilityById } = useFacilityService()

// State
const loading = ref(true)
const staffList = ref<OperationalStaff[]>([])
const searchQuery = ref('')
const selectedFacilityFilter = ref<string | undefined>(undefined)
const facilityCache = ref<Record<string, string>>({})

// Facility Assignment Modal State
const activeFacilityStaff = ref<OperationalStaff | null>(null)
const facilityModalVisible = ref(false)

// Pagination state
const currentPage = ref(1)
const pageSize = ref(10)
const totalStaffCount = ref(0)

const paginationConfig = computed(() => ({
    total: totalStaffCount.value,
    current: currentPage.value,
    pageSize: pageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} staff members`,
    onChange: (page: number, size: number) => {
        if (size !== pageSize.value) {
            pageSize.value = size
            currentPage.value = 1
        } else {
            currentPage.value = page
        }
        fetchStaff()
    }
}))

const handleTableChange = (pagination: any) => {
    if (pagination) {
        let changed = false
        if (pagination.pageSize && pagination.pageSize !== pageSize.value) {
            pageSize.value = pagination.pageSize
            currentPage.value = 1
            changed = true
        } else if (pagination.current && pagination.current !== currentPage.value) {
            currentPage.value = pagination.current
            changed = true
        }
        if (changed) {
            fetchStaff()
        }
    }
}

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
    facility_ids: [] as string[],
    is_all_facilities: false,
    role_id: undefined as string | undefined
})

const columns = [
    { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: 'Facility', key: 'facility' },
    { title: 'Role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status', width: 100 },
    { title: 'Actions', key: 'actions', width: 120 }
]

const handleSearch = () => {
    currentPage.value = 1
    fetchStaff()
}

const handleFacilityFilterChange = () => {
    currentPage.value = 1
    fetchStaff()
}

watch(searchQuery, (newVal) => {
    if (!newVal) {
        currentPage.value = 1
        fetchStaff()
    }
})

const resolveFacilityName = (facId: string): string => {
    if (!facId) return 'N/A'
    const found = facilities.value.find(f => f.id === facId)
    if (found) return found.name
    if (facilityCache.value[facId]) return facilityCache.value[facId]

    getFacilityById(facId).then(fac => {
        if (fac?.name) {
            facilityCache.value[facId] = fac.name
        }
    }).catch(() => {})

    return 'N/A'
}

const getFacilityNames = (record: any): string[] => {
    if (!record) return ['N/A']
    if (record.is_all_facilities) return ['All facilities']

    if (Array.isArray(record.facility_ids) && record.facility_ids.length > 0) {
        return record.facility_ids.map((id: string) => resolveFacilityName(id))
    }

    if (Array.isArray(record.facilities) && record.facilities.length > 0) {
        return record.facilities.map((f: any) => (typeof f === 'string' ? resolveFacilityName(f) : f.name || resolveFacilityName(f.id)))
    }

    if (record.facility_name) return [record.facility_name]
    if (record.facility_details?.name) return [record.facility_details.name]

    const facId = record.facility_id || (typeof record.facility === 'string' ? record.facility : record.facility?.id)
    if (facId) {
        return [resolveFacilityName(facId)]
    }

    return ['N/A']
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
        const response: any = await getOperationalStaff({
            page: currentPage.value,
            page_size: pageSize.value,
            facility_id: selectedFacilityFilter.value || undefined,
            search: searchQuery.value?.trim() || undefined
        })

        if (response && typeof response === 'object' && 'results' in response) {
            staffList.value = response.results || []
            totalStaffCount.value = response.count ?? response.results?.length ?? 0
        } else if (Array.isArray(response)) {
            staffList.value = response
            totalStaffCount.value = response.length
        } else {
            staffList.value = []
            totalStaffCount.value = 0
        }
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

const openFacilityModal = (record: OperationalStaff) => {
    activeFacilityStaff.value = record
    facilityModalVisible.value = true
}

const handleFacilityAssignmentSaved = (payload?: { facility_ids: string[]; is_all_facilities: boolean }) => {
    if (activeFacilityStaff.value && payload) {
        const staff = staffList.value.find(s => s.id === activeFacilityStaff.value?.id)
        if (staff) {
            staff.facility_ids = payload.facility_ids
            staff.is_all_facilities = payload.is_all_facilities
        }
    }
    fetchStaff()
}

const openAddStaffModal = () => {
    editingStaffId.value = null
    const initialFacilityIds: string[] = []
    if (selectedFacilityFilter.value) {
        initialFacilityIds.push(selectedFacilityFilter.value)
    }
    staffForm.value = {
        full_name: '',
        email: '',
        phone_number: '',
        username: '',
        password: '',
        facility_ids: initialFacilityIds,
        is_all_facilities: false,
        role_id: undefined
    }
    isModalOpen.value = true
}

const openEditStaffModal = async (record: OperationalStaff | any) => {
    editingStaffId.value = record.id
    const roleId = record.role_id || (typeof record.role === 'string' ? record.role : record.role?.id)

    let currentFacilityIds: string[] = []
    let isAllFacilities = !!record.is_all_facilities

    if (Array.isArray(record.facility_ids)) {
        currentFacilityIds = [...record.facility_ids]
    } else {
        const singleFacId = record.facility_id || (typeof record.facility === 'string' ? record.facility : record.facility?.id)
        if (singleFacId) {
            currentFacilityIds = [singleFacId]
        }
    }

    staffForm.value = {
        full_name: record.full_name || '',
        email: record.email || '',
        phone_number: record.phone_number || '',
        username: record.username || '',
        password: '',
        facility_ids: currentFacilityIds,
        is_all_facilities: isAllFacilities,
        role_id: roleId || undefined
    }
    isModalOpen.value = true

    // Fetch latest user facilities from API if available
    try {
        const facilitiesData = await getUserFacilities(record.id)
        if (editingStaffId.value === record.id) {
            staffForm.value.facility_ids = facilitiesData.facility_ids || []
            staffForm.value.is_all_facilities = facilitiesData.is_all_facilities
        }
    } catch (e) {
        // Fall back to record data
    }
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
        let staffId = editingStaffId.value
        const primaryFacilityId = staffForm.value.facility_ids?.[0]

        if (staffId) {
            await updateOperationalStaff(staffId, {
                full_name: staffForm.value.full_name,
                email: staffForm.value.email,
                phone_number: staffForm.value.phone_number,
                ...(primaryFacilityId && { facility_id: primaryFacilityId }),
                ...(staffForm.value.role_id && { role_id: staffForm.value.role_id })
            })
            message.success('Operational staff updated successfully')
        } else {
            const createdStaff = await createOperationalStaff({
                full_name: staffForm.value.full_name,
                email: staffForm.value.email,
                phone_number: staffForm.value.phone_number,
                username: staffForm.value.username,
                password: staffForm.value.password,
                ...(primaryFacilityId && { facility_id: primaryFacilityId }),
                ...(staffForm.value.role_id && { role_id: staffForm.value.role_id })
            })
            staffId = createdStaff.id
            message.success('Operational staff created successfully')
        }

        // Save multiple facilities via org_portal facilities API
        if (staffId) {
            await assignUserFacilities(staffId, {
                facility_ids: staffForm.value.is_all_facilities ? [] : staffForm.value.facility_ids,
                is_all_facilities: staffForm.value.is_all_facilities
            })
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
