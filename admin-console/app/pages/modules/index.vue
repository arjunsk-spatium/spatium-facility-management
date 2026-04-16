<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex flex-col md:flex-row md:justify-between md:items-center p-4 rounded-lg shadow-sm transition-colors duration-300 page-header gap-4">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Modules Registry</h1>
                <p class="text-gray-500 text-sm">Manage available system modules</p>
            </div>
            <div>
                <a-button type="primary" @click="openCreateModal" disabled>
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create Module
                </a-button>
            </div>
        </div>

        <!-- Data View -->
        <ResponsiveDataView :columns="columns" :data="modules" :loading="loading" :pagination="pagination"
            :row-key="(record: any) => record.id" @change="handleTableChange">
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'is_active'">
                    <a-tag :color="record.is_active ? 'green' : 'red'">
                        {{ record.is_active ? 'Active' : 'Inactive' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'actions'">
                    <a-space>
                        <a-button type="text" size="small" @click="openEditModal(record)">
                            <template #icon>
                                <EditOutlined />
                            </template>
                        </a-button>
                        <a-popconfirm title="Are you sure delete this module?" ok-text="Yes" cancel-text="No"
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
                    <p><strong>Key:</strong> {{ record.key }}</p>
                    <p><strong>Description:</strong> {{ record.description }}</p>
                    <div class="flex justify-end mt-4 gap-2">
                        <a-button size="small" @click="openEditModal(record)">Edit</a-button>
                        <a-popconfirm title="Are you sure delete this module?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="text" danger size="small">Delete</a-button>
                        </a-popconfirm>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- Create/Edit Modal -->
        <a-modal v-model:open="modalVisible" :title="isEditing ? 'Edit Module' : 'Create Module'"
            @ok="handleModalSubmit" :confirmLoading="submitting">
            <a-form layout="vertical">
                <a-form-item label="Module Name" required>
                    <a-input v-model:value="formState.name" placeholder="e.g. Advanced Inventory" />
                </a-form-item>
                <a-form-item label="Module Key" required>
                    <a-input v-model:value="formState.key" placeholder="e.g. inventory_v2" :disabled="isEditing" />
                    <small class="text-gray-400" v-if="!isEditing">Unique identifier for the module.</small>
                </a-form-item>
                <a-form-item label="App ID" required v-if="!isEditing">
                    <!-- Assuming a default App ID or allowing input. Per requirements, passing the ID from example -->
                    <a-input v-model:value="formState.app" placeholder="UUID" />
                </a-form-item>
                <a-form-item label="Description">
                    <a-textarea v-model:value="formState.description" rows="3" />
                </a-form-item>
                <a-form-item label="Active Status" v-if="isEditing">
                    <a-switch v-model:checked="formState.is_active" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useModuleRegistry, type RegistryModule } from '../../composables/useModuleRegistry';

const { getRegistry, createModule, updateModule, deleteModule } = useModuleRegistry();

// State
const modules = ref<RegistryModule[]>([]);
const loading = ref(false);
const submitting = ref(false);
const modalVisible = ref(false);
const isEditing = ref(false);
const currentId = ref<string>('');

const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true
});

const formState = reactive({
    app: '00000000-0000-0000-0000-000000000001', // Default from example
    key: '',
    name: '',
    description: '',
    is_active: true
});

const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', width: 100 },
    { title: 'Actions', key: 'actions', width: 120, align: 'center' }
];

// Methods
const fetchModules = async (page = 1, pageSize = 10) => {
    loading.value = true;
    try {
        const response = await getRegistry({ page, page_size: pageSize });
        if (response.success) {
            modules.value = response.data.results;
            pagination.total = response.data.count;
            pagination.current = page;
            pagination.pageSize = pageSize;
        }
    } catch (error) {
        message.error('Failed to load modules');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const handleTableChange = (pag: any) => {
    fetchModules(pag.current, pag.pageSize);
};

const openCreateModal = () => {
    isEditing.value = false;
    currentId.value = '';
    formState.key = '';
    formState.name = '';
    formState.description = '';
    formState.app = '00000000-0000-0000-0000-000000000001';
    formState.is_active = true;
    modalVisible.value = true;
};

const openEditModal = (record: RegistryModule) => {
    isEditing.value = true;
    currentId.value = record.id;
    formState.key = record.key;
    formState.name = record.name;
    formState.description = record.description;
    formState.app = record.app;
    formState.is_active = record.is_active;
    modalVisible.value = true;
};

const handleModalSubmit = async () => {
    if (!formState.name || !formState.key || !formState.app) {
        message.error('Please fill in all required fields');
        return;
    }

    submitting.value = true;
    try {
        if (isEditing.value) {
            await updateModule(currentId.value, {
                app: formState.app,
                name: formState.name,
                description: formState.description,
                is_active: formState.is_active
            });
            message.success('Module updated successfully');
        } else {
            await createModule({
                app: formState.app,
                key: formState.key,
                name: formState.name,
                description: formState.description
            });
            message.success('Module created successfully');
        }
        modalVisible.value = false;
        fetchModules(pagination.current, pagination.pageSize);
    } catch (error: any) {
        message.error(error.data?.message || 'Operation failed');
        console.error(error);
    } finally {
        submitting.value = false;
    }
};

const handleDelete = async (id: string) => {
    try {
        await deleteModule(id);
        message.success('Module deleted successfully');
        fetchModules(pagination.current, pagination.pageSize);
    } catch (error) {
        message.error('Failed to delete module');
        console.error(error);
    }
};

onMounted(() => {
    fetchModules();
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
