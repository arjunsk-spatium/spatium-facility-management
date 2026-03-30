<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Helpdesk Settings</h2>
        </div>

        <!-- Sub-tabs -->
        <a-tabs v-model:activeKey="activeSubTab" type="card">
            <a-tab-pane key="category" tab="Category">
                <div class="py-4">
                    <ConfigTable 
                        title="Categories" 
                        :columns="categoryColumns" 
                        :data="categories" 
                        :loading="loading"
                        @add="handleAddCategory" 
                        @edit="handleEditCategory" 
                        @delete="handleDeleteCategory" 
                    />
                </div>
            </a-tab-pane>

            <a-tab-pane key="subcategory" tab="Subcategory">
                <div class="py-4 space-y-4">
                    <!-- Category Filter -->
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Filter by Category:</span>
                        <a-select v-model:value="selectedCategoryId" placeholder="Select Category" style="width: 200px"
                            allow-clear :options="categoryOptions" @change="handleCategoryFilterChange" />
                    </div>
                    <ConfigTable 
                        title="Subcategories" 
                        :columns="subcategoryColumns" 
                        :data="filteredSubcategories"
                        :loading="loadingSubcategories" 
                        :parent-options="categoryOptions" 
                        parent-label="Category"
                        :fields="subcategoryFields"
                        @add="handleAddSubcategory" 
                        @edit="handleEditSubcategory" 
                        @delete="handleDeleteSubcategory" 
                    />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type HelpdeskCategory, type HelpdeskSubCategory } from '../../composables/helpdeskService'
import ConfigTable from './ConfigTable.vue'

const activeSubTab = ref('category')
const loading = ref(false)
const loadingSubcategories = ref(false)

const service = useHelpdeskService()

// Category data
const categories = ref<HelpdeskCategory[]>([])
const selectedCategoryId = ref<string>()

// Subcategory data
const subcategories = ref<HelpdeskSubCategory[]>([])

// Columns
const categoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Action', key: 'action', width: 150 }
]

const subcategoryColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Category', dataIndex: 'category_name', key: 'category_name' },
    { title: 'Response SLA (hrs)', dataIndex: 'response_sla', key: 'response_sla' },
    { title: 'Resolution SLA (hrs)', dataIndex: 'resolution_sla', key: 'resolution_sla' },
    { title: 'Action', key: 'action', width: 150 }
]

const subcategoryFields = [
    { name: 'name', label: 'Name', type: 'text' as const },
    { name: 'key', label: 'Key', type: 'text' as const },
    { name: 'response_sla', label: 'Response SLA (hours)', type: 'number' as const },
    { name: 'resolution_sla', label: 'Resolution SLA (hours)', type: 'number' as const }
]

// Computed options
const categoryOptions = computed(() =>
    categories.value.map(c => ({ label: c.name, value: c.id }))
)

const filteredSubcategories = computed(() => {
    if (!selectedCategoryId.value) return subcategories.value
    return subcategories.value.filter(s => s.category === selectedCategoryId.value)
})

// Fetch data
const fetchCategories = async () => {
    loading.value = true
    try {
        categories.value = await service.getCategories()
    } catch (error) {
        message.error('Failed to load categories')
    } finally {
        loading.value = false
    }
}

const fetchSubcategories = async () => {
    loadingSubcategories.value = true
    try {
        if (selectedCategoryId.value) {
            subcategories.value = await service.getSubCategoriesByCategory(selectedCategoryId.value)
        } else {
            subcategories.value = await service.getSubCategories()
        }
    } catch (error) {
        message.error('Failed to load subcategories')
    } finally {
        loadingSubcategories.value = false
    }
}

const handleCategoryFilterChange = () => {
    fetchSubcategories()
}

// Initial load
onMounted(async () => {
    await fetchCategories()
    await fetchSubcategories()
})

// Category handlers
const handleAddCategory = async (data: any) => {
    try {
        const newCategory = await service.createCategory({
            name: data.name,
            key: data.name.toLowerCase().replace(/\s+/g, '_'),
            description: data.description || ''
        })
        categories.value.push(newCategory)
        message.success('Category added successfully')
    } catch (error) {
        message.error('Failed to add category')
    }
}

const handleEditCategory = async (record: HelpdeskCategory, data: any) => {
    try {
        const updated = await service.updateCategory(record.id, {
            name: data.name,
            description: data.description
        })
        const index = categories.value.findIndex(c => c.id === record.id)
        if (index > -1) categories.value[index] = updated
        message.success('Category updated successfully')
    } catch (error) {
        message.error('Failed to update category')
    }
}

const handleDeleteCategory = async (record: HelpdeskCategory) => {
    try {
        await service.deleteCategory(record.id)
        categories.value = categories.value.filter(c => c.id !== record.id)
        message.success('Category deleted successfully')
    } catch (error) {
        message.error('Failed to delete category')
    }
}

// Subcategory handlers
const handleAddSubcategory = async (data: any) => {
    try {
        const newSubcategory = await service.createSubCategory({
            category: data.parent_id,
            name: data.name,
            key: data.name.toLowerCase().replace(/\s+/g, '_'),
            response_sla: data.response_sla || 2,
            resolution_sla: data.resolution_sla || 24
        })
        const category = categories.value.find(c => c.id === data.parent_id)
        newSubcategory.category_name = category?.name || ''
        subcategories.value.push(newSubcategory)
        message.success('Subcategory added successfully')
    } catch (error) {
        message.error('Failed to add subcategory')
    }
}

const handleEditSubcategory = async (record: HelpdeskSubCategory, data: any) => {
    try {
        const updated = await service.updateSubCategory(record.id, {
            name: data.name,
            response_sla: data.response_sla,
            resolution_sla: data.resolution_sla
        })
        const index = subcategories.value.findIndex(s => s.id === record.id)
        if (index > -1) {
            subcategories.value[index] = { ...subcategories.value[index], ...updated }
        }
        message.success('Subcategory updated successfully')
    } catch (error) {
        message.error('Failed to update subcategory')
    }
}

const handleDeleteSubcategory = async (record: HelpdeskSubCategory) => {
    try {
        await service.deleteSubCategory(record.id)
        subcategories.value = subcategories.value.filter(s => s.id !== record.id)
        message.success('Subcategory deleted successfully')
    } catch (error) {
        message.error('Failed to delete subcategory')
    }
}
</script>
