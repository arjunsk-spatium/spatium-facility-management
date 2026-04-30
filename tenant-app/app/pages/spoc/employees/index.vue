<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Employees</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage your company's employees.</p>
            </div>
            <div class="flex items-center gap-2">
                <a-button @click="refreshEmployees" :loading="loading">
                    <template #icon>
                        <ReloadOutlined />
                    </template>
                </a-button>
                <a-button @click="openJobsDrawer">
                    <template #icon>
                        <HistoryOutlined />
                    </template>
                    <span class="hidden md:inline">Upload History</span>
                </a-button>
                <a-button type="primary" @click="showBulkUploadModal = true">
                    <template #icon>
                        <UploadOutlined />
                    </template>
                    Bulk <hide class="hidden md:inline">Upload</hide>
                </a-button>
                <a-button type="primary" @click="showAddModal = true">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Add <hide class="hidden md:inline">Employee</hide>
                </a-button>
            </div>
        </div>

        <!-- Search -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <a-input-search v-model:value="searchQuery" placeholder="Search employees..." allow-clear
                class="flex-1 sm:max-w-xs" @search="handleSearchChange" @change="handleSearchChange" />
        </div>

        <!-- Employee Table/Cards using ResponsiveDataView -->
        <ResponsiveDataView :columns="columns" :data="employees" :loading="loading" row-key="id"
            :pagination="paginationConfig">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'employee'">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                            :style="avatarStyle">
                            {{ getInitials(record.name) }}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">{{ record.name }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.email }}</p>
                        </div>
                    </div>
                </template>

                <template v-if="column.key === 'designation'">
                    <span class="text-gray-600 dark:text-gray-300">{{ record.designation || '-' }}</span>
                </template>

                <template v-if="column.key === 'role'">
                    <a-tag :color="record.role === 'SPOC' ? 'purple' : 'blue'">
                        {{ record.role }}
                    </a-tag>
                </template>

                <template v-if="column.key === 'status'">
                    <a-tag :color="record.status === 'active' ? 'green' : 'default'">
                        {{ record.status || 'active' }}
                    </a-tag>
                </template>

                <template v-if="column.key === 'actions'">
                    <div class="flex items-center gap-1">
                        <a-button type="text" size="small" @click="handleEdit(record)">
                            <EditOutlined />
                        </a-button>
                        <a-popconfirm title="Are you sure delete this employee?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="text" danger size="small">
                                <DeleteOutlined />
                            </a-button>
                        </a-popconfirm>
                    </div>
                </template>
            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full flex items-center justify-center font-medium"
                                :style="avatarStyle">
                                {{ getInitials(record.name) }}
                            </div>
                            <div>
                                <p class="font-bold text-base dark:text-white">{{ record.name }}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.email }}</p>
                            </div>
                        </div>
                        <a-tag :color="record.role === 'SPOC' ? 'purple' : 'blue'">
                            {{ record.role }}
                        </a-tag>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Phone</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.phone || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Department</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.department || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Designation</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.designation || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Status</p>
                            <a-tag :color="record.status === 'active' ? 'green' : 'default'" class="m-0">
                                {{ record.status || 'active' }}
                            </a-tag>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- Add/Edit Employee Modal -->
        <a-modal v-model:open="showAddModal" :title="editingEmployee ? 'Edit Employee' : 'Add Employee'" centered
            @ok="handleSaveEmployee" :confirm-loading="loading">
            <a-form :model="newEmployee" layout="vertical">
                <a-form-item label="Name" required>
                    <a-input v-model:value="newEmployee.name" placeholder="Employee name" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="newEmployee.email" placeholder="employee@company.com" />
                </a-form-item>
                <a-form-item label="Phone">
                    <PhoneInput v-model="newEmployee.phone" />
                </a-form-item>
                <a-form-item label="Department">
                    <a-select v-model:value="newEmployee.departmentId" placeholder="Select department">
                        <a-select-option v-for="dept in departments" :key="dept.id" :value="dept.id">
                            {{ dept.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="Designation">
                    <a-input v-model:value="newEmployee.designation" placeholder="Job title" />
                </a-form-item>
                <a-form-item label="Type">
                    <a-select v-model:value="newEmployee.role" placeholder="Select type">
                        <a-select-option value="Employee">Employee</a-select-option>
                        <a-select-option value="SPOC">SPOC</a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- Bulk Upload Modal -->
        <a-modal v-model:open="showBulkUploadModal" title="Bulk Upload Employees" centered
            :footer="null" @cancel="resetBulkUpload">
            <div class="space-y-4">
                <div class="flex items-center justify-between">
                    <p class="text-gray-600 dark:text-gray-400 text-sm">
                        Upload a CSV file with employee data.
                    </p>
                    <a-button type="link" size="small" @click="downloadSampleCsv">
                        <template #icon>
                            <DownloadOutlined />
                        </template>
                        Sample CSV
                    </a-button>
                </div>

                <a-upload-dragger
                    v-model:fileList="bulkUploadFileList"
                    name="file"
                    :multiple="false"
                    :before-upload="handleBeforeUpload"
                    accept=".csv"
                    :max-count="1"
                >
                    <p class="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p class="ant-upload-text">Click or drag a CSV file to this area</p>
                    <p class="ant-upload-hint">Only .csv files are accepted. Maximum one file at a time.</p>
                </a-upload-dragger>

                <div v-if="bulkUploadError" class="text-red-500 text-sm">
                    {{ bulkUploadError }}
                </div>

                <div class="flex justify-end gap-2 pt-2">
                    <a-button @click="resetBulkUpload">Cancel</a-button>
                    <a-button type="primary" :loading="bulkUploading"
                        :disabled="!bulkUploadFileList.length" @click="handleBulkUpload">
                        Upload
                    </a-button>
                </div>
            </div>
        </a-modal>

        <!-- Upload History Drawer -->
        <a-drawer v-model:open="showJobsDrawer" title="Upload History" placement="right"
            :width="640" @close="showJobsDrawer = false">
            <div class="space-y-3">
                <div class="flex items-center justify-between mb-2">
                    <p class="text-gray-500 dark:text-gray-400 text-sm">View the status of your bulk upload jobs.</p>
                    <a-button size="small" @click="loadJobs">
                        <template #icon><ReloadOutlined /></template>
                        Refresh
                    </a-button>
                </div>

                <a-spin :spinning="jobsLoading">
                    <div v-if="jobs.length === 0 && !jobsLoading" class="text-center py-12">
                        <InboxOutlined class="text-4xl text-gray-300 dark:text-gray-600 mb-2" />
                        <p class="text-gray-400 dark:text-gray-500">No upload jobs found.</p>
                    </div>

                    <a-collapse v-else accordion :bordered="false" class="jobs-collapse">
                        <a-collapse-panel v-for="job in jobs" :key="job.id">
                            <template #header>
                                <div class="flex items-center justify-between w-full pr-2">
                                    <div class="flex items-center gap-2 min-w-0">
                                        <a-tag :color="getJobStatusColor(job.status)" class="m-0">
                                            {{ job.status }}
                                        </a-tag>
                                        <span class="text-sm text-gray-700 dark:text-gray-300 truncate">
                                            {{ job.original_filename }}
                                        </span>
                                    </div>
                                    <span class="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap ml-2">
                                        {{ formatJobDate(job.started_at || job.completed_at) }}
                                    </span>
                                </div>
                            </template>

                            <div class="space-y-3">
                                <!-- Summary stats -->
                                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <div class="rounded-lg bg-gray-50 dark:bg-neutral-800 p-2 text-center">
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Total</p>
                                        <p class="text-lg font-bold dark:text-white">{{ job.total_rows }}</p>
                                    </div>
                                    <div class="rounded-lg bg-gray-50 dark:bg-neutral-800 p-2 text-center">
                                        <p class="text-xs text-gray-500 dark:text-gray-400">Processed</p>
                                        <p class="text-lg font-bold dark:text-white">{{ job.processed_rows }}</p>
                                    </div>
                                    <div class="rounded-lg bg-green-50 dark:bg-green-900/20 p-2 text-center">
                                        <p class="text-xs text-green-600 dark:text-green-400">Succeeded</p>
                                        <p class="text-lg font-bold text-green-600 dark:text-green-400">{{ job.succeeded_rows }}</p>
                                    </div>
                                    <div class="rounded-lg bg-red-50 dark:bg-red-900/20 p-2 text-center">
                                        <p class="text-xs text-red-600 dark:text-red-400">Failed</p>
                                        <p class="text-lg font-bold text-red-600 dark:text-red-400">{{ job.failed_rows }}</p>
                                    </div>
                                </div>

                                <!-- Timestamps -->
                                <div v-if="job.started_at || job.completed_at" class="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                                    <span v-if="job.started_at">Started: {{ formatJobDateTime(job.started_at) }}</span>
                                    <span v-if="job.completed_at">Completed: {{ formatJobDateTime(job.completed_at) }}</span>
                                </div>

                                <!-- Error report -->
                                <div v-if="job.error_report && job.error_report.length > 0">
                                    <div class="flex items-center gap-2 mb-2">
                                        <WarningOutlined class="text-orange-500" />
                                        <span class="font-medium text-xs dark:text-white">Errors ({{ job.error_report.length }})</span>
                                    </div>
                                    <a-table
                                        :dataSource="job.error_report"
                                        :columns="errorColumns"
                                        :pagination="false"
                                        size="small"
                                        :scroll="{ y: 200 }"
                                        :row-key="(record: any) => `${record.row_number}-${record.field}`"
                                    >
                                        <template #bodyCell="{ column, record }">
                                            <template v-if="column.key === 'row_number'">
                                                <span class="font-mono text-xs">{{ record.row_number }}</span>
                                            </template>
                                            <template v-if="column.key === 'field'">
                                                <a-tag size="small">{{ record.field }}</a-tag>
                                            </template>
                                            <template v-if="column.key === 'error'">
                                                <span class="text-red-600 dark:text-red-400 text-xs">{{ record.error }}</span>
                                            </template>
                                        </template>
                                    </a-table>
                                </div>

                                <div v-else-if="job.status === 'completed' && job.failed_rows === 0" class="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                                    <CheckCircleOutlined />
                                    <span>All rows processed successfully!</span>
                                </div>
                            </div>
                        </a-collapse-panel>
                    </a-collapse>
                </a-spin>

                <!-- Jobs pagination -->
                <div v-if="jobsCount > jobsPageSize" class="flex justify-end pt-2">
                    <a-pagination
                        :current="jobsPage"
                        :total="jobsCount"
                        :pageSize="jobsPageSize"
                        size="small"
                        @change="handleJobsPageChange"
                    />
                </div>
            </div>
        </a-drawer>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import dayjs from 'dayjs'
import { PlusOutlined, DeleteOutlined, EditOutlined, UploadOutlined, DownloadOutlined, InboxOutlined, CheckCircleOutlined, WarningOutlined, HistoryOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'
import { useDepartmentService, type Department } from '../../../../composables/departmentService'

definePageMeta({
    middleware: 'auth'
})

const tenantStore = useTenantStore()
const { isDark } = useTheme()
const store = useSpocStore()
const { employees, loading, employeeCount, employeePage, employeePageSize } = storeToRefs(store)
const { fetchDepartments } = useDepartmentService()

// Pagination config for table
const paginationConfig = computed(() => ({
    total: employeeCount.value,
    current: employeePage.value,
    pageSize: employeePageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    onChange: handlePageChange,
}))

// Whitelabeled avatar style using tenant's primary color
const avatarStyle = computed(() => {
    const primaryColor = tenantStore.primaryColor || '#3378ff'
    return {
        backgroundColor: isDark.value
            ? `color-mix(in srgb, ${primaryColor} 20%, transparent)`
            : `color-mix(in srgb, ${primaryColor} 10%, transparent)`,
        color: isDark.value
            ? `color-mix(in srgb, ${primaryColor} 60%, white)`
            : primaryColor
    }
})

const searchQuery = ref('')
const showAddModal = ref(false)
const showBulkUploadModal = ref(false)
const bulkUploadFileList = ref<UploadFile[]>([])
const bulkUploadFile = ref<File | null>(null)
const bulkUploading = ref(false)
const bulkUploadError = ref('')

// Jobs drawer state
const showJobsDrawer = ref(false)
const jobs = ref<any[]>([])
const jobsCount = ref(0)
const jobsPage = ref(1)
const jobsPageSize = 10
const jobsLoading = ref(false)

// Error table columns for job error reports
const errorColumns = [
    { title: 'Row', key: 'row_number', dataIndex: 'row_number', width: 60 },
    { title: 'Field', key: 'field', dataIndex: 'field', width: 140 },
    { title: 'Error', key: 'error', dataIndex: 'error' }
]
const editingEmployee = ref<any>(null)
const departments = ref<Department[]>([])

const newEmployee = reactive({
    name: '',
    email: '',
    phone: '',
    departmentId: null as string | null,
    designation: '',
    role: 'Employee' as 'Employee' | 'SPOC'
})

// Table columns
const columns = [
    { title: 'Employee', key: 'employee', dataIndex: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Designation', key: 'designation' },
    { title: 'Role', key: 'role' },
    { title: 'Status', key: 'status' },
    { title: '', key: 'actions', width: 50 }
]

const searchDebounce = ref<ReturnType<typeof setTimeout> | null>(null)

const handleSearchChange = () => {
    if (searchDebounce.value) clearTimeout(searchDebounce.value)
    searchDebounce.value = setTimeout(() => {
        store.employeePage = 1
        store.fetchEmployees({
            search: searchQuery.value,
            page: 1,
            page_size: employeePageSize.value
        })
    }, 400)
}

const handlePageChange = (page: number, newPageSize?: number) => {
    store.employeePage = page
    if (newPageSize) {
        store.employeePageSize = newPageSize
    }
    store.fetchEmployees({
        search: searchQuery.value,
        page,
        page_size: newPageSize || employeePageSize.value
    })
}

const loadDepartments = async () => {
    try {
        departments.value = await fetchDepartments()
    } catch (e) {
        console.error('Failed to load departments', e)
    }
}

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleSaveEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
        message.error('Name and email are required')
        return
    }

    const selectedDept = departments.value.find(d => d.id === newEmployee.departmentId)

    try {
        if (editingEmployee.value) {
            await store.updateEmployee(editingEmployee.value.id, {
                name: newEmployee.name,
                email: newEmployee.email,
                phone: newEmployee.phone || undefined,
                department: selectedDept?.name,
                department_id: newEmployee.departmentId || undefined,
                designation: newEmployee.designation || undefined,
                role: newEmployee.role
            })
            message.success('Employee updated successfully')
        } else {
            await store.addEmployee({
                name: newEmployee.name,
                email: newEmployee.email,
                phone: newEmployee.phone || undefined,
                department: selectedDept?.name,
                department_id: newEmployee.departmentId || undefined,
                designation: newEmployee.designation || undefined,
                role: newEmployee.role
            })
            message.success('Employee added successfully')
        }
        showAddModal.value = false
        editingEmployee.value = null
        // Reset form
        newEmployee.name = ''
        newEmployee.email = ''
        newEmployee.phone = ''
        newEmployee.departmentId = null
        newEmployee.designation = ''
        newEmployee.role = 'Employee'
    } catch (err) {
        message.error(editingEmployee.value ? 'Failed to update employee' : 'Failed to add employee')
    }
}

const handleEdit = (employee: any) => {
    editingEmployee.value = employee
    newEmployee.name = employee.name
    newEmployee.email = employee.email
    newEmployee.phone = employee.phone || ''
    newEmployee.departmentId = employee.department_id || null
    newEmployee.designation = employee.designation || ''
    newEmployee.role = employee.role || 'Employee'
    showAddModal.value = true
}

const handleDelete = async (id: string) => {
    try {
        await store.deleteEmployee(id)
        message.success('Employee deleted')
        refreshEmployees()
    } catch (err) {
        message.error('Failed to delete employee')
    }
}

// Bulk upload handlers
const handleBeforeUpload = (file: File) => {
    const isCsv = file.type === 'text/csv' || file.name.endsWith('.csv')
    if (!isCsv) {
        message.error('Only CSV files are allowed')
        return false
    }
    bulkUploadFile.value = file
    bulkUploadError.value = ''
    return false // prevent auto upload
}

const handleBulkUpload = async () => {
    if (!bulkUploadFile.value) {
        message.error('Please select a CSV file')
        return
    }
    bulkUploading.value = true
    bulkUploadError.value = ''
    try {
        await store.bulkUploadEmployees(bulkUploadFile.value)
        resetBulkUpload()
        message.success('Background task created for employee upload. Check Upload History for status.')
    } catch (err: any) {
        bulkUploadError.value = err?.data?.message || err?.message || 'Failed to upload employees'
        message.error(bulkUploadError.value)
    } finally {
        bulkUploading.value = false
    }
}

const resetBulkUpload = () => {
    showBulkUploadModal.value = false
    bulkUploadFileList.value = []
    bulkUploadFile.value = null
    bulkUploadError.value = ''
}

const refreshEmployees = () => {
    store.fetchEmployees({
        search: searchQuery.value,
        page: employeePage.value,
        page_size: employeePageSize.value
    })
}

const downloadSampleCsv = () => {
    const link = document.createElement('a')
    link.href = '/employees.csv'
    link.download = 'employees_sample.csv'
    link.click()
}

// Jobs drawer handlers
const openJobsDrawer = () => {
    showJobsDrawer.value = true
    loadJobs()
}

const loadJobs = async () => {
    jobsLoading.value = true
    try {
        const data = await store.fetchBulkUploadJobs({ page: jobsPage.value, page_size: jobsPageSize })
        jobs.value = data.results
        jobsCount.value = data.count
    } catch (err) {
        console.error('Failed to load jobs', err)
    } finally {
        jobsLoading.value = false
    }
}

const handleJobsPageChange = (page: number) => {
    jobsPage.value = page
    loadJobs()
}

const getJobStatusColor = (status: string) => {
    const colors: Record<string, string> = {
        pending: 'processing',
        processing: 'processing',
        completed: 'success',
        failed: 'error'
    }
    return colors[status] || 'default'
}

const formatJobDate = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('MMM D, HH:mm')
}

const formatJobDateTime = (dateStr: string | null) => {
    if (!dateStr) return '-'
    return dayjs(dateStr).format('MMM D, YYYY HH:mm:ss')
}

onMounted(() => {
    store.fetchEmployees({ page: employeePage.value, page_size: employeePageSize.value })
    loadDepartments()
})
</script>
