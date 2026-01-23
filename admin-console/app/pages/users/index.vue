<template>
    <div class="p-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Users</h1>
            <NuxtLink to="/users/create">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create User
                </a-button>
            </NuxtLink>
        </div>

        <a-card class="shadow-sm">
            <ResponsiveDataView :columns="columns" :data="users || []" :loading="pending">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'actions'">
                        <div class="flex gap-2">
                            <NuxtLink :to="`/users/${record.id}`">
                                <a-button type="text" size="small">
                                    <template #icon>
                                        <EditOutlined />
                                    </template>
                                </a-button>
                            </NuxtLink>
                            <a-popconfirm title="Are you sure delete this user?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(record.id)">
                                <a-button type="text" danger size="small">
                                    <template #icon>
                                        <DeleteOutlined />
                                    </template>
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </template>
                </template>

                <template #mobileCard="{ record }">
                    <a-card size="small" :title="record.full_name" class="mb-4">
                        <template #extra>
                            <div class="flex gap-2">
                                <NuxtLink :to="`/users/${record.id}`">
                                    <a-button type="text" size="small">
                                        <EditOutlined />
                                    </a-button>
                                </NuxtLink>
                                <a-popconfirm title="Are you sure delete this user?" ok-text="Yes" cancel-text="No"
                                    @confirm="handleDelete(record.id)">
                                    <a-button type="text" danger size="small">
                                        <DeleteOutlined />
                                    </a-button>
                                </a-popconfirm>
                            </div>
                        </template>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-gray-500">Email:</span>
                                <span>{{ record.email }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">Phone:</span>
                                <span>{{ record.phone_number }}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-500">App Name:</span>
                                <a-tag>{{ record.app_name }}</a-tag>
                            </div>
                        </div>
                    </a-card>
                </template>
            </ResponsiveDataView>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import {
    PlusOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const { getUsers, deleteUser } = useUserService();

const columns = [
    {
        title: 'Full Name',
        dataIndex: 'full_name',
        key: 'full_name',
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Phone Number',
        dataIndex: 'phone_number',
        key: 'phone_number',
    },
    {
        title: 'App Name',
        dataIndex: 'app_name',
        key: 'app_name',
    },
    {
        title: 'Actions',
        key: 'actions',
        width: 100,
    },
];

const { data: users, pending, refresh } = await getUsers();

const handleDelete = async (id: string) => {
    try {
        await deleteUser(id);
        message.success('User deleted successfully');
        refresh();
    } catch (error) {
        message.error('Failed to delete user');
    }
};
</script>
