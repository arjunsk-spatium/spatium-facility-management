<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Employees</h1>
                <p class="text-gray-600 dark:text-gray-400">Manage your company's employees.</p>
            </div>
            <a-button type="primary" @click="showAddModal = true">
                <template #icon>
                    <PlusOutlined />
                </template>
                <span class="hidden sm:inline">Add Employee</span>
                <span class="sm:hidden">Add</span>
            </a-button>
        </div>

        <!-- Search -->
        <div class="flex flex-col sm:flex-row gap-3 sm:items-center">
            <a-input-search v-model:value="searchQuery" placeholder="Search employees..." allow-clear
                class="flex-1 sm:max-w-xs" />
        </div>

        <!-- Employee Table/Cards -->
        <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 overflow-hidden">
            <!-- Desktop Table -->
            <div class="hidden sm:block overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 dark:bg-neutral-900">
                        <tr>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Employee</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Department</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Designation</th>
                            <th
                                class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Contact</th>
                            <th
                                class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                                Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-100 dark:divide-neutral-700">
                        <tr v-for="employee in filteredEmployees" :key="employee.id"
                            class="hover:bg-gray-50 dark:hover:bg-neutral-700/50">
                            <td class="px-6 py-4">
                                <div class="flex items-center gap-3">
                                    <div
                                        class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                        {{ getInitials(employee.name) }}
                                    </div>
                                    <div>
                                        <p class="font-medium text-gray-900 dark:text-white">{{ employee.name }}</p>
                                        <p class="text-sm text-gray-500 dark:text-gray-400">{{ employee.email }}</p>
                                    </div>
                                </div>
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{{ employee.department || '-'
                            }}</td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{{ employee.designation ||
                                '-' }}
                            </td>
                            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{{ employee.phone || '-' }}
                            </td>
                            <td class="px-6 py-4 text-right">
                                <a-button type="text" danger size="small" @click="handleDelete(employee.id)">
                                    <DeleteOutlined />
                                </a-button>
                            </td>
                        </tr>
                        <tr v-if="filteredEmployees.length === 0">
                            <td colspan="5" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                <TeamOutlined class="text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                                <p>No employees found</p>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Mobile Cards -->
            <div class="sm:hidden divide-y divide-gray-100 dark:divide-neutral-700">
                <div v-for="employee in filteredEmployees" :key="employee.id" class="p-4">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex items-center gap-3">
                            <div
                                class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-medium">
                                {{ getInitials(employee.name) }}
                            </div>
                            <div>
                                <p class="font-medium text-gray-900 dark:text-white">{{ employee.name }}</p>
                                <p class="text-sm text-gray-500 dark:text-gray-400">{{ employee.designation }}</p>
                            </div>
                        </div>
                        <a-button type="text" danger size="small" @click="handleDelete(employee.id)">
                            <DeleteOutlined />
                        </a-button>
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-sm pl-13">
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Department</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ employee.department || '-' }}</p>
                        </div>
                        <div>
                            <p class="text-gray-400 dark:text-gray-500 text-xs">Phone</p>
                            <p class="text-gray-600 dark:text-gray-300">{{ employee.phone || '-' }}</p>
                        </div>
                    </div>
                </div>
                <div v-if="filteredEmployees.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
                    <TeamOutlined class="text-4xl mb-2 text-gray-300 dark:text-gray-600" />
                    <p>No employees found</p>
                </div>
            </div>
        </div>

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
import { message, Modal } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined, TeamOutlined } from '@ant-design/icons-vue'

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

const handleDelete = (id: string) => {
    Modal.confirm({
        title: 'Delete Employee',
        content: 'Are you sure you want to delete this employee?',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        async onOk() {
            try {
                await store.deleteEmployee(id)
                message.success('Employee deleted')
            } catch (err) {
                message.error('Failed to delete employee')
            }
        }
    })
}

onMounted(() => {
    store.fetchEmployees()
})
</script>
