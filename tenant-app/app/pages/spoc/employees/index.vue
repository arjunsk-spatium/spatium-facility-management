<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Employees</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage your company's employees.</p>
            </div>
            <a-button type="primary" @click="showAddModal = true">
                <template #icon>
                    <PlusOutlined />
                </template>
                Add <hide class="hidden md:inline">Employee</hide>
            </a-button>
        </div>

        <!-- Search -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <a-input-search v-model:value="searchQuery" placeholder="Search employees..." allow-clear
                class="flex-1 sm:max-w-xs" />
        </div>

        <!-- Employee Table/Cards using ResponsiveDataView -->
        <ResponsiveDataView :columns="columns" :data="filteredEmployees" :loading="loading" row-key="id">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'employee'">
                    <div class="flex items-center gap-3">
                        <div
                            class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                            {{ getInitials(record.name) }}
                        </div>
                        <div>
                            <p class="font-medium text-gray-900 dark:text-white">{{ record.name }}</p>
                            <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.email }}</p>
                        </div>
                    </div>
                </template>

                <template v-if="column.key === 'actions'">
                    <a-popconfirm title="Are you sure delete this employee?" ok-text="Yes" cancel-text="No"
                        @confirm="handleDelete(record.id)">
                        <a-button type="text" danger size="small">
                            <DeleteOutlined />
                        </a-button>
                    </a-popconfirm>
                </template>
            </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card
                    class="mb-4 shadow-sm !border-neutral-200 dark:!border-neutral-700 hover:shadow-md transition-shadow"
                    :bordered="true" :bodyStyle="{ padding: '16px' }">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                {{ getInitials(record.name) }}
                            </div>
                            <div>
                                <p class="font-bold text-base dark:text-white">{{ record.name }}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ record.designation ||
                                    record.email }}</p>
                            </div>
                        </div>
                        <a-popconfirm title="Are you sure delete this employee?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="text" danger size="small">
                                <DeleteOutlined />
                            </a-button>
                        </a-popconfirm>
                    </div>

                    <div class="grid grid-cols-2 gap-2 text-sm pt-3 border-t border-gray-100 dark:border-gray-800">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Department</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.department || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Phone</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ record.phone || '-' }}</p>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- Add Employee Modal -->
        <a-modal v-model:open="showAddModal" title="Add Employee" centered @ok="handleAddEmployee"
            :confirm-loading="loading">
            <a-form :model="newEmployee" layout="vertical">
                <a-form-item label="Name" required>
                    <a-input v-model:value="newEmployee.name" placeholder="Employee name" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="newEmployee.email" placeholder="employee@company.com" />
                </a-form-item>
                <a-form-item label="Phone">
                    <a-input v-model:value="newEmployee.phone" placeholder="+91 98765 43210" />
                </a-form-item>
                <a-form-item label="Department">
                    <a-select v-model:value="newEmployee.department" placeholder="Select department">
                        <a-select-option value="Engineering">Engineering</a-select-option>
                        <a-select-option value="HR">HR</a-select-option>
                        <a-select-option value="Sales">Sales</a-select-option>
                        <a-select-option value="Marketing">Marketing</a-select-option>
                        <a-select-option value="Finance">Finance</a-select-option>
                        <a-select-option value="Operations">Operations</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="Designation">
                    <a-input v-model:value="newEmployee.designation" placeholder="Job title" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'

definePageMeta({
    middleware: 'auth'
})

const store = useSpocStore()
const { employees, loading } = storeToRefs(store)

const searchQuery = ref('')
const showAddModal = ref(false)

const newEmployee = reactive({
    name: '',
    email: '',
    phone: '',
    department: null as string | null,
    designation: ''
})

// Table columns
const columns = [
    { title: 'Employee', key: 'employee', dataIndex: 'name' },
    { title: 'Department', dataIndex: 'department', key: 'department' },
    { title: 'Designation', dataIndex: 'designation', key: 'designation' },
    { title: 'Phone', dataIndex: 'phone', key: 'phone' },
    { title: '', key: 'actions', width: 50 }
]

const filteredEmployees = computed(() => {
    if (!searchQuery.value) return employees.value

    const query = searchQuery.value.toLowerCase()
    return employees.value.filter(e =>
        e.name.toLowerCase().includes(query) ||
        e.email.toLowerCase().includes(query) ||
        e.department?.toLowerCase().includes(query) ||
        e.designation?.toLowerCase().includes(query)
    )
})

const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email) {
        message.error('Name and email are required')
        return
    }

    try {
        await store.addEmployee({
            name: newEmployee.name,
            email: newEmployee.email,
            phone: newEmployee.phone || undefined,
            department: newEmployee.department || undefined,
            designation: newEmployee.designation || undefined
        })
        message.success('Employee added successfully')
        showAddModal.value = false
        // Reset form
        newEmployee.name = ''
        newEmployee.email = ''
        newEmployee.phone = ''
        newEmployee.department = null
        newEmployee.designation = ''
    } catch (err) {
        message.error('Failed to add employee')
    }
}

const handleDelete = async (id: string) => {
    try {
        await store.deleteEmployee(id)
        message.success('Employee deleted')
    } catch (err) {
        message.error('Failed to delete employee')
    }
}

onMounted(() => {
    store.fetchEmployees()
})
</script>
