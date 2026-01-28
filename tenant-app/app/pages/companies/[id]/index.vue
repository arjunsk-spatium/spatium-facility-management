<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
                <NuxtLink to="/companies">
                    <a-button type="text">
                        <ArrowLeftOutlined /> Back
                    </a-button>
                </NuxtLink>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-0">Company Details</h1>
            </div>
            <!-- Placeholder for status if available in future -->
            <!-- <a-tag v-if="company" color="blue">Active</a-tag> -->
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <template v-else-if="company">
            <a-row :gutter="[24, 24]">
                <!-- Left Column (Main Info & Employees) -->
                <a-col :xs="24" :lg="16">
                    <div class="flex flex-col gap-6">
                        <!-- Main Info Card -->
                        <a-card>
                            <template #title>
                                <div class="flex items-center gap-3">
                                    <a-avatar :src="company.logo" :size="40"
                                        class="flex-shrink-0 bg-primary-100 text-primary-600">
                                        {{ getInitials(company.name) }}
                                    </a-avatar>
                                    <span class="font-semibold text-lg text-gray-900 dark:text-gray-100">Company
                                        Information</span>
                                </div>
                            </template>
                            <template #extra>
                                <NuxtLink :to="`/companies/${company.id}/edit`">
                                    <a-button type="primary" ghost>
                                        <EditOutlined /> Edit Details
                                    </a-button>
                                </NuxtLink>
                            </template>

                            <a-descriptions :column="{ xs: 1, sm: 2 }" bordered size="small">
                                <a-descriptions-item label="Company Name">{{ company.name }}</a-descriptions-item>
                                <a-descriptions-item label="Address">{{ company.address }}</a-descriptions-item>
                                <a-descriptions-item label="GSTIN">{{ company.gstin || 'N/A' }}</a-descriptions-item>
                                <a-descriptions-item label="Facility">{{ company.facility || 'N/A'
                                    }}</a-descriptions-item>
                            </a-descriptions>
                        </a-card>

                        <!-- Employee List -->
                        <a-card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-lg text-gray-900 dark:text-gray-100">Employee
                                        List</span>
                                    <a-button size="small">View All</a-button>
                                </div>
                            </template>
                            <ResponsiveDataView :data="employees" :columns="employeeColumns"
                                :row-key="(record) => record.key">
                                <template #bodyCell="{ column, record }">
                                    <template v-if="column.key === 'status'">
                                        <a-badge :status="record.status === 'Active' ? 'success' : 'default'"
                                            :text="record.status" />
                                    </template>
                                    <template v-else-if="column.key === 'role'">
                                        <a-tag :color="record.role === 'Admin' ? 'blue' : 'default'">{{ record.role
                                            }}</a-tag>
                                    </template>
                                </template>
                                <template #mobileCard="{ record }">
                                    <a-card size="small" class="mb-3 border-gray-200 dark:border-gray-800">
                                        <div class="flex justify-between items-start mb-2">
                                            <div>
                                                <div class="font-medium text-gray-900 dark:text-gray-100">{{ record.name
                                                    }}</div>
                                                <div class="text-xs text-gray-500">{{ record.email }}</div>
                                            </div>
                                            <a-tag :color="record.role === 'Admin' ? 'blue' : 'default'"
                                                class="m-0 text-xs">{{ record.role }}</a-tag>
                                        </div>
                                        <div
                                            class="flex justify-between items-center pt-2 border-t border-gray-100 dark:border-gray-800/50">
                                            <span class="text-xs text-gray-500">Status</span>
                                            <a-badge :status="record.status === 'Active' ? 'success' : 'default'"
                                                :text="record.status" />
                                        </div>
                                    </a-card>
                                </template>
                            </ResponsiveDataView>
                        </a-card>
                    </div>
                </a-col>

                <!-- Right Column (Credits & SPOC) -->
                <a-col :xs="24" :lg="8">
                    <div class="flex flex-col gap-6">
                        <!-- Credits Card -->
                        <a-card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-gray-900 dark:text-gray-100">Credits</span>
                                    <div class="flex gap-2">
                                        <a-tooltip title="View History">
                                            <a-button type="text" size="small"
                                                class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                @click="openHistoryDrawer">
                                                <HistoryOutlined />
                                            </a-button>
                                        </a-tooltip>
                                        <a-tooltip title="Edit Credits">
                                            <a-button type="text" size="small"
                                                class="text-gray-500 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-400"
                                                @click="openCreditModal">
                                                <EditOutlined />
                                            </a-button>
                                        </a-tooltip>
                                    </div>
                                </div>
                            </template>
                            <div class="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Allotted</div>
                                    <div class="text-xl font-bold text-gray-800 dark:text-gray-100">{{ credits.alloted
                                        }}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Used</div>
                                    <div class="text-xl font-bold text-orange-600">{{ credits.used }}</div>
                                </div>
                                <div>
                                    <div class="text-xs text-gray-500 dark:text-gray-400 mb-1">Balance</div>
                                    <div class="text-xl font-bold text-green-600">{{ credits.balance }}</div>
                                </div>
                            </div>
                            <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                <a-progress :percent="Math.round((credits.used / credits.alloted) * 100)"
                                    status="active" :stroke-color="{ '0%': '#108ee9', '100%': '#87d068' }" />
                                <div class="text-xs text-right mt-1 text-gray-500">Usage</div>
                            </div>
                        </a-card>

                        <!-- SPOC Details -->
                        <a-card>
                            <template #title>
                                <div class="flex justify-between items-center">
                                    <span class="font-semibold text-lg text-gray-900 dark:text-gray-100">SPOC
                                        Details</span>
                                    <a-button type="link" size="small" @click="openAddSpocModal">Add SPOC</a-button>
                                </div>
                            </template>

                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-3 overflow-y-auto px-1"
                                style="max-height: 400px;">
                                <div v-for="(item, index) in spocs" :key="index"
                                    class="relative group border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 hover:shadow-md transition-shadow">

                                    <!-- Actions -->
                                    <div class="absolute top-2 right-2 flex gap-1 z-10">
                                        <a-button type="text" shape="circle" size="small"
                                            class="text-blue-500 h-6 w-6 min-w-[24px]" @click="editSpoc(index)">
                                            <EditOutlined class="text-xs" />
                                        </a-button>
                                        <a-button type="text" shape="circle" size="small"
                                            class="text-red-500 h-6 w-6 min-w-[24px]" @click="deleteSpoc(index)"
                                            v-if="spocs.length > 1">
                                            <DeleteOutlined class="text-xs" />
                                        </a-button>
                                    </div>

                                    <div class="flex flex-col items-center mb-2 mt-1">
                                        <a-avatar :size="48" class="bg-primary-100 text-primary-600 mb-2 block">
                                            {{ getInitials(item.name) }}
                                        </a-avatar>
                                        <h3 class="font-medium text-sm mb-0 text-gray-900 dark:text-white text-center leading-tight truncate w-full px-2"
                                            :title="item.name">{{ item.name
                                            }}</h3>
                                        <p
                                            class="text-xs text-gray-500 dark:text-gray-400 text-center truncate w-full px-2">
                                            {{
                                                item.designation }}</p>
                                    </div>

                                    <div class="space-y-1.5 pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 truncate"
                                            :title="item.email">
                                            <MailOutlined class="text-gray-400 shrink-0" />
                                            <span class="truncate">{{ item.email }}</span>
                                        </div>
                                        <div
                                            class="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 truncate">
                                            <PhoneOutlined class="text-gray-400 shrink-0" />
                                            <span>{{ item.phone }}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </a-card>
                    </div>
                </a-col>
            </a-row>
        </template>

        <div v-else class="text-center p-12 text-gray-500">
            <div class="text-4xl mb-4">🏢</div>
            <h3 class="text-lg font-medium text-gray-900 dark:text-gray-100">Company not found</h3>
            <NuxtLink to="/companies">
                <a-button class="mt-4">Return to List</a-button>
            </NuxtLink>
        </div>

        <!-- Edit Credits Modal -->
        <a-modal v-model:open="isCreditModalVisible" title="Edit Credits" @ok="handleCreditOk">
            <a-form layout="vertical">
                <a-form-item label="Allotted Credits">
                    <a-input-number v-model:value="creditForm.alloted" class="w-full" :min="0" />
                </a-form-item>
                <a-form-item label="Used Credits">
                    <a-input-number v-model:value="creditForm.used" class="w-full" :min="0" />
                </a-form-item>
                <div class="bg-gray-50 dark:bg-gray-800 p-3 rounded text-sm">
                    <div class="flex justify-between mb-1">
                        <span>New Balance:</span>
                        <span
                            :class="{ 'text-red-500': (creditForm.alloted - creditForm.used) < 0, 'text-green-600': (creditForm.alloted - creditForm.used) >= 0, 'font-bold': true }">
                            {{ creditForm.alloted - creditForm.used }}
                        </span>
                    </div>
                </div>
            </a-form>
        </a-modal>

        <!-- Credit History Drawer -->
        <a-drawer v-model:open="isHistoryDrawerVisible" title="Credit Usage History" placement="right" width="400">
            <a-table :dataSource="creditHistory" :columns="historyColumns" size="small" :pagination="false" rowKey="id">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'amount'">
                        <span :class="record.amount < 0 ? 'text-red-500' : 'text-green-600'">
                            {{ record.amount > 0 ? '+' : '' }}{{ record.amount }}
                        </span>
                    </template>
                </template>
            </a-table>
        </a-drawer>

        <!-- Edit/Add SPOC Modal -->
        <a-modal v-model:open="isSpocModalVisible" :title="editingSpocIndex === -1 ? 'Add SPOC' : 'Edit SPOC'"
            @ok="handleSpocOk">
            <a-form layout="vertical">
                <a-form-item label="Name" required>
                    <a-input v-model:value="spocForm.name" />
                </a-form-item>
                <a-form-item label="Designation">
                    <a-input v-model:value="spocForm.designation" />
                </a-form-item>
                <a-form-item label="Email" required>
                    <a-input v-model:value="spocForm.email" />
                </a-form-item>
                <a-form-item label="Phone">
                    <a-input v-model:value="spocForm.phone" />
                </a-form-item>
            </a-form>
        </a-modal>

    </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, reactive, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCompanyStore } from '../../../../stores/company'
import ResponsiveDataView from '../../../../components/ResponsiveDataView.vue'
import {
    ArrowLeftOutlined,
    EditOutlined,
    MailOutlined,
    PhoneOutlined,
    HistoryOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue'

const route = useRoute()
const store = useCompanyStore()

const company = computed(() => store.currentCompany)
const loading = computed(() => store.loading)

// --- Mock Data & Component State ---

// Credits
const credits = ref({
    alloted: 5000,
    used: 1200,
    balance: 3800
})

const isCreditModalVisible = ref(false)
const creditForm = reactive({
    alloted: 0,
    used: 0
})

const isHistoryDrawerVisible = ref(false)
const creditHistory = ref([
    { id: 1, date: '2024-01-25', description: 'Booking #1234', amount: -50 },
    { id: 2, date: '2024-01-20', description: 'Monthly Allocation', amount: +1000 },
    { id: 3, date: '2024-01-15', description: 'Booking #987', amount: -120 },
    { id: 4, date: '2023-12-01', description: 'Initial Credits', amount: +5000 },
])
const historyColumns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount', align: 'right' },
]


// SPOCs
const spocs = ref<any[]>([])
const isSpocModalVisible = ref(false)
const editingSpocIndex = ref(-1)
const spocForm = reactive({
    name: '',
    email: '',
    phone: '',
    designation: ''
})

// Employees
const employees = ref([
    { key: 1, name: 'Alice Johnson', email: 'alice@techcorp.com', role: 'Admin', status: 'Active' },
    { key: 2, name: 'Bob Smith', email: 'bob@techcorp.com', role: 'User', status: 'Active' },
    { key: 3, name: 'Charlie Brown', email: 'charlie@techcorp.com', role: 'User', status: 'Inactive' },
    { key: 4, name: 'Diana Prince', email: 'diana@techcorp.com', role: 'User', status: 'Active' },
    { key: 5, name: 'Evan Wright', email: 'evan@techcorp.com', role: 'Admin', status: 'Active' },
])

const employeeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
]

// --- Actions: Credits ---

const openCreditModal = () => {
    creditForm.alloted = credits.value.alloted
    creditForm.used = credits.value.used
    isCreditModalVisible.value = true
}

const handleCreditOk = () => {
    credits.value.alloted = creditForm.alloted
    credits.value.used = creditForm.used
    credits.value.balance = creditForm.alloted - creditForm.used
    isCreditModalVisible.value = false
}

const openHistoryDrawer = () => {
    isHistoryDrawerVisible.value = true
}

// --- Actions: SPOCs ---

const openAddSpocModal = () => {
    editingSpocIndex.value = -1
    spocForm.name = ''
    spocForm.email = ''
    spocForm.phone = ''
    spocForm.designation = 'Point of Contact'
    isSpocModalVisible.value = true
}

const editSpoc = (index: number) => {
    editingSpocIndex.value = index
    const spoc = spocs.value[index]
    spocForm.name = spoc.name
    spocForm.email = spoc.email
    spocForm.phone = spoc.phone
    spocForm.designation = spoc.designation
    isSpocModalVisible.value = true
}

const deleteSpoc = (index: number) => {
    spocs.value.splice(index, 1)
}

const handleSpocOk = () => {
    if (editingSpocIndex.value === -1) {
        // Add
        spocs.value.push({ ...spocForm })
    } else {
        // Edit
        spocs.value[editingSpocIndex.value] = { ...spocForm }
    }
    isSpocModalVisible.value = false
}

// --- Helpers ---

const getInitials = (name: string) => {
    if (!name) return ''
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
}

// --- Lifecycle ---

onMounted(async () => {
    const id = route.params.id as string
    if (id) {
        await store.fetchCompany(id)
        // Initialize SPOCs from store data if available, otherwise use defaults
        if (store.currentCompany) {
            spocs.value = [{
                name: store.currentCompany.spoc_name,
                email: store.currentCompany.spoc_email,
                phone: store.currentCompany.spoc_phone,
                designation: 'Primary Point of Contact'
            }]
        }
    }
})

// Watch for company load to init SPOC if not already done (e.g. if loaded late)
watch(() => store.currentCompany, (newVal) => {
    if (newVal && spocs.value.length === 0) {
        spocs.value = [{
            name: newVal.spoc_name,
            email: newVal.spoc_email,
            phone: newVal.spoc_phone,
            designation: 'Primary Point of Contact'
        }]
    }
})
</script>

<style scoped>
:deep(.ant-card) {
    border-radius: 12px;
}

:deep(.ant-descriptions-item-label) {
    color: #6b7280;
    /* text-gray-500 */
    font-size: 0.875rem;
}

:deep(.ant-descriptions-item-content) {
    font-weight: 500;
}
</style>
