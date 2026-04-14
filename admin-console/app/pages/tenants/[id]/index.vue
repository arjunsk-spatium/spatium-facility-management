<template>
    <div class="space-y-8 pb-12">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-6">
            <div class="flex items-center gap-4">
                <NuxtLink to="/tenants">
                    <a-button type="text" class="text-gray-500 hover:text-gray-700 dark:text-gray-400">
                        <ArrowLeftOutlined />
                    </a-button>
                </NuxtLink>
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        {{ tenant?.name || 'Tenant Details' }}
                        <a-tag v-if="tenant" :class="getStatusClass(tenant.status)" class="capitalize m-0">
                            {{ tenant.status }}
                        </a-tag>
                    </h1>
                    <p class="text-gray-500 text-sm mt-1" v-if="tenant?.id">ID: {{ tenant.id }}</p>
                </div>
            </div>
            <div v-if="tenant">
                <NuxtLink :to="`/tenants/${tenant.id}/edit`">
                    <a-button type="primary">
                        <EditOutlined /> Edit Tenant
                    </a-button>
                </NuxtLink>
            </div>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <div v-else-if="tenant" class="grid grid-cols-1 xl:grid-cols-3 gap-8">

            <!-- LEFT COLUMN: Branding & Basic Info -->
            <div class="space-y-8 xl:col-span-2">

                <!-- Branding Card -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Brand Identity</h3>
                    </div>
                    <div class="p-8">
                        <div class="flex flex-wrap gap-8 items-start">

                            <!-- Brand Color -->
                            <div class="text-center">
                                <div class="w-16 h-16 rounded-xl shadow-inner mb-3 mx-auto"
                                    :style="{ backgroundColor: tenant.branding?.primary_color || '#000' }"></div>
                                <span
                                    class="text-xs font-mono text-gray-500 p-1 bg-gray-50 dark:bg-gray-900 rounded border border-gray-200 dark:border-gray-700">
                                    {{ tenant.branding?.primary_color || 'N/A' }}
                                </span>
                                <p class="text-xs text-gray-400 mt-1">Brand Color</p>
                            </div>

                            <!-- Logos -->
                            <div class="flex gap-6">
                                <div v-if="tenant.branding?.logo"
                                    class="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                    <img :src="tenant.branding.logo" class="h-12 w-auto object-contain"
                                        alt="Light Logo" />
                                    <p class="text-xs text-center text-gray-400 mt-9">Light Background Logo</p>
                                </div>
                                <div v-if="tenant.branding?.dark_logo"
                                    class="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-900">
                                    <img :src="tenant.branding.dark_logo" class="h-12 w-auto object-contain"
                                        alt="Dark Logo" />
                                    <p class="text-xs text-center text-gray-500 mt-9">Dark Background Logo</p>
                                </div>
                                <div v-if="tenant.branding?.favicon"
                                    class="p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-24 flex flex-col items-center">
                                    <img :src="tenant.branding.favicon" class="h-8 w-8 object-contain" alt="Favicon" />
                                    <p class="text-xs text-center text-gray-400 mt-6">Favicon</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                <!-- Basic Info & PII -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Organization Details</h3>
                    </div>
                    <div class="p-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-[15px]">
                        <!-- Tenant Domain -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">Tenant Domain</span>
                            <a href="#" class="text-primary-600 hover:text-primary-700 font-medium">
                                {{ tenant.domain }}
                            </a>
                        </div>

                        <!-- Onboarded At -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">Onboarded At</span>
                            <span class="text-gray-900 dark:text-gray-100">
                                {{ formatDate(tenant.onboarded_at || tenant.created_at) }}
                            </span>
                        </div>

                        <!-- Contact Name -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">Contact Name</span>
                            <span class="text-gray-900 dark:text-gray-100">{{ tenant.pii?.full_name ||
                                tenant.pii?.contact_person || '-' }}</span>
                        </div>

                        <!-- Contact Email -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">Contact Email</span>
                            <span v-if="tenant.pii?.email" class="text-gray-900 dark:text-gray-100">{{ tenant.pii.email
                            }}</span>
                            <span v-else class="text-gray-400">-</span>
                        </div>

                        <!-- GSTIN -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">GSTIN / Tax ID</span>
                            <span class="font-mono text-gray-600 dark:text-gray-400">{{ tenant.pii?.gstin || '-'
                            }}</span>
                        </div>

                        <!-- Phone -->
                        <div class="flex flex-col gap-[5px]">
                            <span class="text-gray-500 font-medium text-sm">Phone</span>
                            <span class="text-gray-900 dark:text-gray-100">{{ tenant.pii?.phone ||
                                tenant.pii?.phone_number || '-' }}</span>
                        </div>

                        <!-- Address -->
                        <div class="flex flex-col gap-[5px] sm:col-span-2">
                            <span class="text-gray-500 font-medium text-sm">Address</span>
                            <span class="whitespace-pre-line text-gray-600 dark:text-gray-400">{{
                                tenant.pii?.address || '-' }}</span>
                        </div>
                    </div>
                </section>

                <!-- Section 6: Users -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Tenant Users</h3>
                        <a-button type="primary" size="small" @click="showCreateUserModal = true">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            Create User
                        </a-button>
                    </div>
                    <div class="p-0">
                        <a-table :dataSource="tenantUsers" :columns="userColumns" :pagination="false" size="middle">
                            <template #bodyCell="{ column, record }">
                                <template v-if="column.key === 'actions'">
                                    <a-popconfirm title="Are you sure delete this user?" ok-text="Yes" cancel-text="No"
                                        @confirm="handleDeleteUser(record.id)">
                                        <a-button type="text" danger size="small">
                                            <template #icon>
                                                <DeleteOutlined />
                                            </template>
                                        </a-button>
                                    </a-popconfirm>
                                </template>
                            </template>
                        </a-table>
                    </div>
                </section>

            </div>

            <!-- RIGHT COLUMN: Subscription & Modules -->
            <div class="space-y-8">

                <!-- Subscription Card -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
                    <div
                        class="bg-gradient-to-r from-primary-50 to-white dark:from-primary-900/10 dark:to-gray-800 p-6 border-b border-gray-200 dark:border-gray-700">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">Current Plan
                                </p>
                                <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                                    {{ tenant.subscription?.plan?.name || 'Free Plan' }}
                                </h3>
                            </div>
                            <div class="text-right">
                                <p class="text-2xl font-bold text-gray-900 dark:text-white">
                                    {{ formatCurrency(tenant.subscription?.price) }}
                                </p>
                                <p class="text-xs text-gray-500">/ {{ tenant.subscription?.billing_cycle || 'month' }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="p-6 space-y-4">
                        <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span class="text-gray-500">Status</span>
                            <a-tag color="green" v-if="tenant.subscription?.status === 'active'">Active</a-tag>
                            <a-tag color="red" v-else>Inactive</a-tag>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span class="text-gray-500">User Limit</span>
                            <span class="font-medium">{{ tenant.user_count || 0 }} / {{ tenant.subscription?.max_users
                                || '∞' }}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span class="text-gray-500">Client User Limit</span>
                            <span class="font-medium">{{ tenant.client_user_count || 0 }} / {{
                                tenant.subscription?.max_client_users
                                || '∞' }}</span>
                        </div>
                        <div class="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700/50">
                            <span class="text-gray-500">Start Date</span>
                            <span class="font-medium">{{ formatDate(tenant.subscription?.start_date) }}</span>
                        </div>
                        <div class="flex justify-between py-2">
                            <span class="text-gray-500">Renews On</span>
                            <span class="font-medium">{{ formatDate(tenant.subscription?.end_date) }}</span>
                        </div>
                    </div>
                </section>

                <!-- Modules Card -->
                <section
                    class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <h3 class="font-semibold text-gray-900 dark:text-white">Enabled Modules</h3>
                        <a-badge :count="assignedModules.length"
                            :number-style="{ backgroundColor: '#e6f7ff', color: '#1890ff', boxShadow: '0 0 0 1px #91d5ff inset' }" />
                    </div>
                    <div class="p-6">
                        <div v-if="assignedModules.length" class="grid grid-cols-1 gap-3">
                            <div v-for="mod in assignedModules" :key="mod.id"
                                class="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/50">
                                <CheckCircleFilled class="text-green-500 text-lg" />
                                <span class="font-medium text-gray-700 dark:text-gray-200 capitalize">
                                    {{ mod.module_name || mod.module?.name || mod.module_id || mod.module }}
                                </span>
                            </div>
                        </div>
                        <div v-else class="text-center py-8 text-gray-400 italic">
                            No modules enabled
                        </div>
                    </div>
                </section>

            </div>
        </div>

        <div v-else
            class="text-center p-24 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
            <p class="text-gray-500 text-lg">Tenant not found</p>
            <NuxtLink to="/tenants" class="text-primary-600 mt-2 block hover:underline">Return to list</NuxtLink>
        </div>

        <!-- Create User Modal -->
        <a-modal v-model:visible="showCreateUserModal" title="Create Tenant User" @ok="handleCreateUser"
            :confirmLoading="creatingUser">
            <a-form :model="userForm" layout="vertical">
                <a-form-item label="Full Name" name="full_name"
                    :rules="[{ required: true, message: 'Please enter full name' }]">
                    <a-input v-model:value="userForm.full_name" placeholder="John Doe" />
                </a-form-item>
                <a-form-item label="Email" name="email"
                    :rules="[{ required: true, type: 'email', message: 'Please enter valid email' }]">
                    <a-input v-model:value="userForm.email" placeholder="john@example.com" />
                </a-form-item>
                <a-form-item label="Phone Number" name="phone_number">
                    <a-input v-model:value="userForm.phone_number" placeholder="+1234567890" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { ArrowLeftOutlined, EditOutlined, CheckCircleFilled, PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useTenantService } from '../../../composables/tenantService';
import { useUserService } from '../../../composables/userService';
import { message } from 'ant-design-vue';

const route = useRoute();
const tenantId = route.params.id as string;
const { getTenantById, getTenantModules } = useTenantService();
const { getUsers, createUser, deleteUser } = useUserService();

const loading = ref(true);
const tenant = ref<any>(null);
const assignedModules = ref<any[]>([]);
const tenantUsers = ref<any[]>([]);

const showCreateUserModal = ref(false);
const creatingUser = ref(false);
const userForm = reactive({
    full_name: '',
    email: '',
    phone_number: '',
});

const userColumns = [
    { title: 'Name', dataIndex: 'full_name', key: 'full_name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Phone', dataIndex: 'phone_number', key: 'phone_number' },
    { title: '', key: 'actions', width: 60 },
];

const fetchData = async () => {
    loading.value = true;
    try {
        const [fetchedTenant, modulesRes, users] = await Promise.all([
            getTenantById(tenantId),
            getTenantModules(tenantId),
            getUsers({ tenant_id: tenantId })
        ]);

        if (fetchedTenant) {
            tenant.value = fetchedTenant;
        }

        if (modulesRes && modulesRes.data) {
            const results = modulesRes.data.results || modulesRes.data;
            assignedModules.value = Array.isArray(results) ? results : [];
        }

        if (users) {
            tenantUsers.value = users;
        }
    } catch (e) {
        console.error('Failed to load tenant data', e);
    } finally {
        loading.value = false;
    }
};

const handleCreateUser = async () => {
    if (!userForm.full_name || !userForm.email) {
        message.warning('Please fill in required fields');
        return;
    }

    creatingUser.value = true;
    try {
        await createUser({
            ...userForm,
            tenant_id: tenantId,
            app_name: 'tenant',
            apps: ['tenant']
        });
        message.success('User created successfully');
        showCreateUserModal.value = false;
        // Reset form
        userForm.full_name = '';
        userForm.email = '';
        userForm.phone_number = '';
        // Refresh users
        const users = await getUsers({ tenant_id: tenantId });
        tenantUsers.value = users;
    } catch (e: any) {
        message.error(e.data?.message || 'Failed to create user');
    } finally {
        creatingUser.value = false;
    }
};

const handleDeleteUser = async (id: string) => {
    try {
        await deleteUser(id);
        message.success('User deleted successfully');
        tenantUsers.value = tenantUsers.value.filter(u => u.id !== id);
    } catch (e) {
        message.error('Failed to delete user');
    }
};

const getStatusClass = (status: string) => {
    switch (status) {
        case 'active': return 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800';
        case 'trial': return 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
        case 'suspended': return 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800';
        case 'inactive': return 'bg-gray-100 text-gray-700 border border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800';
        default: return 'bg-gray-100 text-gray-700';
    }
};

const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};

const formatCurrency = (amount: string | number) => {
    if (amount === undefined || amount === null) return '₹0';
    return `₹${Number(amount).toLocaleString('en-IN')}`;
};

onMounted(() => {
    fetchData();
});
</script>
