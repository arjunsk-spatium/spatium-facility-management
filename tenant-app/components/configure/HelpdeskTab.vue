<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Helpdesk Settings</h2>
        </div>

        <!-- Sub-tabs -->
        <a-tabs v-model:activeKey="activeSubTab" type="card">
            <a-tab-pane key="category" tab="Category">
                <div class="py-4">
                    <ConfigTable title="Categories" :columns="categoryColumns" :data="categories" :loading="loading"
                        @add="handleAddCategory" @edit="handleEditCategory" @delete="handleDeleteCategory" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="subcategory" tab="Subcategory">
                <div class="py-4 space-y-4">
                    <!-- Category Filter -->
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Filter by Category:</span>
                        <a-select v-model:value="selectedCategoryId" placeholder="Select Category" style="width: 200px"
                            allow-clear :options="categoryOptions" />
                    </div>
                    <ConfigTable title="Subcategories" :columns="subcategoryColumns" :data="filteredSubcategories"
                        :loading="loading" :parent-options="categoryOptions" parent-label="Category"
                        @add="handleAddSubcategory" @edit="handleEditSubcategory" @delete="handleDeleteSubcategory" />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'

const activeSubTab = ref('category')
const loading = ref(false)

// Category data
const categories = ref<any[]>([])
const selectedCategoryId = ref<number>()

// Subcategory data
const subcategories = ref<any[]>([])

// Columns
const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Action', key: 'action', width: 150 }
]

const subcategoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Action', key: 'action', width: 150 }
]

// Computed options
const categoryOptions = computed(() =>
    categories.value.map(c => ({ label: c.name, value: c.id }))
)

const filteredSubcategories = computed(() => {
    if (!selectedCategoryId.value) return subcategories.value
    return subcategories.value.filter(s => s.category_id === selectedCategoryId.value)
})

// Mock data for now
onMounted(() => {
    // TODO: Replace with API calls
    categories.value = [
        { id: 1, name: 'Electrical', description: 'Electrical issues' },
        { id: 2, name: 'Plumbing', description: 'Water and pipe related' },
        { id: 3, name: 'HVAC', description: 'Air conditioning and heating' }
    ]
    subcategories.value = [
        { id: 1, name: 'Light Fixture', category_id: 1, category_name: 'Electrical' },
        { id: 2, name: 'Power Outlet', category_id: 1, category_name: 'Electrical' },
        { id: 3, name: 'Pipe Leak', category_id: 2, category_name: 'Plumbing' },
        { id: 4, name: 'AC Not Working', category_id: 3, category_name: 'HVAC' }
    ]
})

// Handlers
const handleAddCategory = (data: any) => {
    message.success('Category added successfully')
    categories.value.push({ id: Date.now(), ...data })
}

const handleEditCategory = (record: any, data: any) => {
    message.success('Category updated successfully')
    const index = categories.value.findIndex(c => c.id === record.id)
    if (index > -1) categories.value[index] = { ...record, ...data }
}

const handleDeleteCategory = (record: any) => {
    message.success('Category deleted successfully')
    categories.value = categories.value.filter(c => c.id !== record.id)
}

const handleAddSubcategory = (data: any) => {
    message.success('Subcategory added successfully')
    const category = categories.value.find(c => c.id === data.parent_id)
    subcategories.value.push({
        id: Date.now(),
        name: data.name,
        category_id: data.parent_id,
        category_name: category?.name || ''
    })
}

const handleEditSubcategory = (record: any, data: any) => {
    message.success('Subcategory updated successfully')
    const index = subcategories.value.findIndex(s => s.id === record.id)
    if (index > -1) {
        const category = categories.value.find(c => c.id === data.parent_id)
        subcategories.value[index] = {
            ...record,
            name: data.name,
            category_id: data.parent_id,
            category_name: category?.name || ''
        }
    }
}

const handleDeleteSubcategory = (record: any) => {
    message.success('Subcategory deleted successfully')
    subcategories.value = subcategories.value.filter(s => s.id !== record.id)
}
</script>
