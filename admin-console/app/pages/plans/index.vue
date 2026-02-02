<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex flex-col md:flex-row md:justify-between md:items-center p-4 rounded-lg shadow-sm transition-colors duration-300 page-header gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Plan Management</h1>
                <p class="text-gray-500 text-sm">Manage billing plans and pricing</p>
            </div>
            <div>
                <NuxtLink to="/plans/create">
                    <a-button type="primary">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Create Plan
                    </a-button>
                </NuxtLink>
            </div>
        </div>

        <!-- Data View -->
        <ResponsiveDataView :columns="columns" :data="plans" :loading="loading" :pagination="pagination"
            :row-key="(record: any) => record.id" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'price'">
                    <span v-if="record.is_custom">Custom</span>
                    <span v-else>₹{{ record.price }} / {{ record.billing_cycle === 'monthly' ? 'mo' : 'yr' }}</span>
                </template>
                <template v-if="column.key === 'is_active'">
                    <a-tag :color="record.is_active ? 'green' : 'red'">
                        {{ record.is_active ? 'Active' : 'Inactive' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'actions'">
                    <a-space>
                        <NuxtLink :to="`/plans/${record.id}/edit`">
                            <a-button type="text" size="small">
                                <template #icon>
                                    <EditOutlined />
                                </template>
                            </a-button>
                        </NuxtLink>
                        <a-popconfirm title="Are you sure archive this plan?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="text" danger size="small">
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                            </a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>

            <template #mobileCard="{ record }">
                <a-card class="mb-4" :title="record.name">
                    <template #extra>
                        <a-tag :color="record.is_active ? 'green' : 'red'">
                            {{ record.is_active ? 'Active' : 'Inactive' }}
                        </a-tag>
                    </template>
                    <p><strong>Code:</strong> {{ record.code }}</p>
                    <p><strong>Price:</strong> <span v-if="record.is_custom">Custom</span><span v-else>₹{{ record.price
                    }} / {{
                                record.billing_cycle }}</span></p>
                    <p><strong>Max Users:</strong> {{ record.max_users > 0 ? record.max_users : 'Unlimited' }}</p>
                    <p><strong>Max Client Users:</strong> {{ record.max_client_users > 0 ? record.max_client_users : 'Unlimited' }}</p>
                    <p class="text-gray-500 text-sm mt-2">{{ record.description }}</p>

                    <div class="flex justify-end mt-4 gap-2">
                        <NuxtLink :to="`/plans/${record.id}/edit`">
                            <a-button size="small">Edit</a-button>
                        </NuxtLink>
                        <a-popconfirm title="Are you sure archive this plan?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="text" danger size="small">Archive</a-button>
                        </a-popconfirm>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { usePlanService, type Plan } from '../../composables/planService';

const { getPlans, deletePlan } = usePlanService();

// State
const plans = ref<Plan[]>([]);
const loading = ref(false);

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
});

const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Price', key: 'price' },
    { title: 'Max Users', dataIndex: 'max_users', key: 'max_users' },
    { title: 'Max Client Users', dataIndex: 'max_client_users', key: 'max_client_users' },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', width: 100 },
    { title: 'Actions', key: 'actions', width: 120, align: 'center' }
];

// Methods
const fetchPlans = async (page = 1, pageSize = 10) => {
    loading.value = true;
    try {
        const response = await getPlans({ page, page_size: pageSize });
        if (response.success) {
            plans.value = response.data.results;
            pagination.total = response.data.count;
            pagination.current = page;
            pagination.pageSize = pageSize;
        }
    } catch (error) {
        message.error('Failed to load plans');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleTableChange = (pag: any) => {
    fetchPlans(pag.current, pag.pageSize);
};

const handleDelete = async (id: string) => {
    try {
        await deletePlan(id);
        message.success('Plan archived successfully');
        fetchPlans(pagination.current, pagination.pageSize);
    } catch (error) {
        message.error('Failed to archive plan');
        console.error(error);
    }
};

onMounted(() => {
    fetchPlans();
});
</script>

<style scoped>
.page-header {
    background: #ffffff;
    border: 1px solid #e5e5e5;
}

.dark .page-header {
    background: #1f1f1f;
    border-color: #333333;
}
</style>
