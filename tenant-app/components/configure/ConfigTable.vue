<template>
    <div class="space-y-4">
    <!-- Header with Add Button -->
    <div class="flex justify-between items-center">
        <h3 class="text-lg font-medium dark:text-white">{{ title }}</h3>
        <a-button v-if="canCreate" type="primary" @click="openAddModal">
            <template #icon>
                <PlusOutlined />
            </template>
            Add
        </a-button>
    </div>

        <!-- Responsive Data Table -->
        <div class="overflow-x-auto">
            <ResponsiveDataView :columns="tableColumns" :data="data" :loading="loading"
                :row-key="(record: any) => record.id" :pagination="{ pageSize: 10 }" :mobile-page-size="5">
                <template #bodyCell="{ column, record }">
                    <template v-if="column.key === 'action'">
                        <a-space>
                            <a-button v-if="canUpdate" type="link" size="small" @click="openEditModal(record)">
                                <EditOutlined />
                            </a-button>
                            <a-popconfirm v-if="canDelete" title="Are you sure you want to delete this item?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(record)">
                                <a-button type="link" size="small" danger>
                                    <DeleteOutlined />
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </template>
                    <template v-else-if="column.customRender">
                        {{ getColumnValue(column, record) }}
                    </template>
                </template>

            <!-- Mobile Card View -->
            <template #mobileCard="{ record }">
                <a-card size="small">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <!-- Primary field (name or first column) -->
                            <h4 class="font-medium text-gray-900 dark:text-white">
                                {{ record.name || record[columns[0]?.dataIndex] || 'N/A' }}
                            </h4>
                            <!-- Secondary fields -->
                            <div class="mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <template v-for="col in displayColumns" :key="col.key">
                                    <div v-if="record[col.dataIndex]" class="flex gap-2">
                                        <span class="font-medium">{{ col.title }}:</span>
                                        <span>{{ record[col.dataIndex] }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <!-- Actions -->
                        <div class="flex gap-2">
                            <a-button v-if="canUpdate" type="text" size="small" @click="openEditModal(record)">
                                <EditOutlined />
                            </a-button>
                            <a-popconfirm v-if="canDelete" title="Delete this item?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(record)">
                                <a-button type="text" size="small" danger>
                                    <DeleteOutlined />
                                </a-button>
                            </a-popconfirm>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>
        </div>

        <!-- Add/Edit Modal -->
        <a-modal v-model:open="modalVisible" :title="isEditing ? `Edit ${singularTitle}` : `Add ${singularTitle}`"
            :confirm-loading="modalLoading" @ok="handleSubmit" @cancel="closeModal">
            <a-form :model="formData" layout="vertical" class="mt-4">
                <!-- Parent Select (for dependent entities) -->
                <a-form-item v-if="parentOptions && parentOptions.length > 0" :label="parentLabel">
                    <a-select v-model:value="formData.parent_id" :placeholder="`Select ${parentLabel}`"
                        :options="parentOptions" />
                </a-form-item>

                <!-- Dynamic Fields -->
                <template v-if="fields && fields.length > 0">
                    <a-form-item v-for="field in fields" :key="field.name" :label="field.label">
                        <a-switch v-if="field.type === 'switch'" v-model:checked="formData[field.name]" @change="handleFieldChange(field.name, $event)" />
                        <a-select v-else-if="field.type === 'select'" v-model:value="formData[field.name]"
                            :placeholder="`Select ${field.label.toLowerCase()}`" :options="field.options" @change="handleFieldChange(field.name, $event)" />
                        <a-input-number v-else-if="field.type === 'number'" v-model:value="formData[field.name]"
                            :placeholder="`Enter ${field.label.toLowerCase()}`" style="width: 100%" />
                        <a-upload v-else-if="field.type === 'file'" :before-upload="(file: File) => { formData[field.name] = file; return false }"
                            :show-upload-list="false" accept="image/*">
                            <a-button>
                                <template #icon><UploadOutlined /></template>
                                Select Icon
                            </a-button>
                        </a-upload>
                        <a-input v-else v-model:value="formData[field.name]"
                            :placeholder="`Enter ${field.label.toLowerCase()}`" />
                    </a-form-item>
                </template>

                <!-- Default Name Field -->
                <a-form-item v-else label="Name">
                    <a-input v-model:value="formData.name" placeholder="Enter name" />
                </a-form-item>

                <!-- Description Field (if applicable) -->
                <a-form-item v-if="hasDescriptionColumn && !fields" label="Description">
                    <a-textarea v-model:value="formData.description" placeholder="Enter description" :rows="3" />
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons-vue'
import ResponsiveDataView from '../ResponsiveDataView.vue'

interface Column {
    title: string
    dataIndex?: string
    key: string
    width?: number
}

interface Field {
    name: string
    label: string
    type: 'text' | 'number' | 'file' | 'select' | 'switch'
    options?: { label: string; value: string | number }[]
}

interface ParentOption {
    label: string
    value: number
}

const props = defineProps<{
    title: string
    columns: Column[]
    data: any[]
    loading?: boolean
    parentOptions?: ParentOption[]
    parentLabel?: string
    fields?: Field[]
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
}>()

const emit = defineEmits<{
    add: [data: any]
    edit: [record: any, data: any]
    delete: [record: any]
    fieldChange: [field: string, value: any]
}>()

// Computed
const singularTitle = computed(() => {
    const t = props.title
    if (t.endsWith('ies')) return t.slice(0, -3) + 'y'
    if (t.endsWith('es')) return t.slice(0, -2)
    if (t.endsWith('s')) return t.slice(0, -1)
    return t
})

const tableColumns = computed(() => props.columns)

// Columns to display in mobile card (exclude action and name)
const displayColumns = computed(() =>
    props.columns.filter(col => col.key !== 'action' && col.dataIndex !== 'name' && col.dataIndex)
)

const hasDescriptionColumn = computed(() =>
    props.columns.some(col => col.dataIndex === 'description')
)

// State
const modalVisible = ref(false)
const modalLoading = ref(false)
const isEditing = ref(false)
const editingRecord = ref<any>(null)
const formData = ref<any>({})

// Watch for form data changes to emit updates
watch(() => formData.value, (newVal) => {
    emit('fieldChange', newVal)
}, { deep: true })

// Methods
const openAddModal = () => {
    isEditing.value = false
    editingRecord.value = null
    formData.value = {}
    modalVisible.value = true
}

const openEditModal = (record: any) => {
    isEditing.value = true
    editingRecord.value = record
    formData.value = { ...record }
    if (props.parentOptions) {
        // Set parent_id from the record's parent field
        const parentIdKey = Object.keys(record).find(k =>
            k.endsWith('_id') && k !== 'id'
        )
        if (parentIdKey) {
            formData.value.parent_id = record[parentIdKey]
        }
    }
    modalVisible.value = true
}

const closeModal = () => {
    modalVisible.value = false
    formData.value = {}
}

const handleSubmit = () => {
    modalLoading.value = true
    setTimeout(() => {
        if (isEditing.value) {
            emit('edit', editingRecord.value, formData.value)
        } else {
            emit('add', formData.value)
        }
        modalLoading.value = false
        closeModal()
    }, 300)
}

const handleDelete = (record: any) => {
    emit('delete', record)
}

const handleFieldChange = (field: string, value: any) => {
    emit('fieldChange', field, value)
}

const getColumnValue = (column: any, record: any) => {
    if (column.customRender) {
        return column.customRender(record[column.dataIndex], record)
    }
    return record[column.dataIndex]
}
</script>
