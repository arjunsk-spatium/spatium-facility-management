<template>
    <div class="space-y-6 min-w-0 overflow-hidden">
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
                        :canCreate="canCreate"
                        :canUpdate="canUpdate"
                        :canDelete="canDelete"
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
                        :canCreate="canCreate"
                        :canUpdate="canUpdate"
                        :canDelete="canDelete"
                        @add="handleAddSubcategory" 
                        @edit="handleEditSubcategory" 
                        @delete="handleDeleteSubcategory" 
                        @fieldChange="handleSubcategoryFieldChange"
                    />
                </div>
            </a-tab-pane>

            <a-tab-pane key="role" tab="Role">
                <div class="py-4">
                    <ConfigTable 
                        title="Roles" 
                        :columns="roleColumns" 
                        :data="roles" 
                        :loading="loadingRoles"
                        :fields="roleFields"
                        :canCreate="canCreate"
                        :canUpdate="canUpdate"
                        :canDelete="canDelete"
                        @add="handleAddRole" 
                        @edit="handleEditRole" 
                        @delete="handleDeleteRole" 
                    />
                </div>
            </a-tab-pane>

            <a-tab-pane key="directEscalation" tab="Direct Escalation">
                <div class="py-4">
                    <ConfigTable 
                        title="Direct Escalation Role Mappings" 
                        :columns="directEscalationColumns" 
                        :data="directEscalationMappings" 
                        :loading="loadingDirectEscalation"
                        :fields="directEscalationFields"
                        :canCreate="canCreate && directEscalationMappings.length === 0"
                        :canUpdate="canUpdate"
                        :canDelete="canDelete"
                        @add="handleAddDirectEscalation" 
                        @edit="handleEditDirectEscalation" 
                        @delete="handleDeleteDirectEscalation" 
                    />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type HelpdeskCategory, type HelpdeskSubCategory, type HelpdeskRole, type DirectedEscalationRoleMapping, type HelpdeskPriority, type HelpdeskAssignmentMode } from '../../composables/helpdeskService'
import ConfigTable from './ConfigTable.vue'

defineProps<{
    canCreate?: boolean
    canUpdate?: boolean
    canDelete?: boolean
}>()

const activeSubTab = ref('category')
const loading = ref(false)
const loadingSubcategories = ref(false)
const loadingRoles = ref(false)
const loadingDirectEscalation = ref(false)
const loadingPriorities = ref(false)
const loadingAssignmentModes = ref(false)

const service = useHelpdeskService()

// Category data
const categories = ref<HelpdeskCategory[]>([])
const selectedCategoryId = ref<string>()

// Subcategory data
const subcategories = ref<HelpdeskSubCategory[]>([])

// Role data
const roles = ref<HelpdeskRole[]>([])

// Priority data
const priorities = ref<HelpdeskPriority[]>([])

// Assignment Mode data
const assignmentModes = ref<HelpdeskAssignmentMode[]>([])

// Direct Escalation data
const directEscalationMappings = ref<DirectedEscalationRoleMapping[]>([])

const ASSIGNMENT_MODE = '00000000-0000-0000-0000-000000000303'

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
    { title: 'Response SLA (min)', dataIndex: 'response_sla', key: 'response_sla' },
    { title: 'Resolution SLA (min)', dataIndex: 'resolution_sla', key: 'resolution_sla' },
    { title: 'Assignment Mode', dataIndex: 'assignment_mode_key', key: 'assignment_mode_key' },
    { title: 'Action', key: 'action', width: 150 }
]

// Priority options
const priorityOptions = computed(() =>
    priorities.value.map(p => ({ label: p.label, value: p.id }))
)

// Assignment mode options
const assignmentModeOptions = computed(() =>
    assignmentModes.value.map(a => ({ label: a.name, value: a.id }))
)

const subcategoryFields = computed(() => {
    const priorityOpts = priorityOptions.value?.length ? priorityOptions.value : []
    const assignmentOpts = assignmentModeOptions.value?.length ? assignmentModeOptions.value : []
    const roleOpts = roleOptions.value?.length ? roleOptions.value : []
    
    const fields = [
        { name: 'name', label: 'Name', type: 'text' as const },
        { name: 'key', label: 'Key', type: 'text' as const },
        { name: 'default_priority', label: 'Default Priority', type: 'select' as const, options: priorityOpts },
        { name: 'assignment_mode', label: 'Assignment Mode', type: 'select' as const, options: assignmentOpts },
        { name: 'response_sla', label: 'Response SLA (minutes)', type: 'number' as const },
        { name: 'resolution_sla', label: 'Resolution SLA (minutes)', type: 'number' as const }
    ]
    
    // Auto assignment mode requires a role
    if (selectedAssignmentMode.value === '00000000-0000-0000-0000-000000000301') {
        fields.splice(4, 0, { name: 'required_role', label: 'Required Role', type: 'select' as const, options: roleOpts })
    }
    
    return fields
})

const selectedAssignmentMode = ref<string | undefined>()

const roleColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Key', dataIndex: 'key', key: 'key' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Display Order', dataIndex: 'display_order', key: 'display_order' },
    { title: 'Action', key: 'action', width: 150 }
]

const roleFields = [
    { name: 'name', label: 'Name', type: 'text' as const },
    { name: 'key', label: 'Key', type: 'text' as const },
    { name: 'description', label: 'Description', type: 'text' as const },
    { name: 'display_order', label: 'Display Order', type: 'number' as const }
]

const directEscalationColumns = [
    { title: 'Role', dataIndex: 'role_name', key: 'role_name' },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', customRender: (text: boolean) => text ? 'Active' : 'Inactive' },
    { title: 'Action', key: 'action', width: 150 }
]

// Computed options
const categoryOptions = computed(() =>
    categories.value.map(c => ({ label: c.name, value: c.id }))
)

const roleOptions = computed(() =>
    roles.value.map(r => ({ label: r.name, value: r.id }))
)

const directEscalationFields = [
    { name: 'role', label: 'Role', type: 'select' as const, options: roleOptions },
    { name: 'is_active', label: 'Active', type: 'switch' as const }
]

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

const fetchRoles = async () => {
    loadingRoles.value = true
    try {
        roles.value = await service.getRoles()
    } catch (error) {
        message.error('Failed to load roles')
    } finally {
        loadingRoles.value = false
    }
}

const fetchPriorities = async () => {
    loadingPriorities.value = true
    try {
        priorities.value = await service.getPriorities()
    } catch (error) {
        message.error('Failed to load priorities')
    } finally {
        loadingPriorities.value = false
    }
}

const fetchAssignmentModes = async () => {
    loadingAssignmentModes.value = true
    try {
        assignmentModes.value = await service.getAssignmentModes()
    } catch (error) {
        message.error('Failed to load assignment modes')
    } finally {
        loadingAssignmentModes.value = false
    }
}

const fetchDirectEscalationMappings = async () => {
    loadingDirectEscalation.value = true
    try {
        directEscalationMappings.value = await service.getDirectedEscalationRoleMappings()
    } catch (error) {
        message.error('Failed to load direct escalation mappings')
    } finally {
        loadingDirectEscalation.value = false
    }
}

// Initial load
onMounted(async () => {
    await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        fetchRoles(),
        fetchPriorities(),
        fetchAssignmentModes(),
        fetchDirectEscalationMappings()
    ])
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
            default_priority: data.default_priority,
            required_role: data.required_role,
            assignment_mode: data.assignment_mode,
            response_sla: data.response_sla || 120,
            resolution_sla: data.resolution_sla || 1440
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
            category: data.parent_id,
            name: data.name,
            key: data.key,
            default_priority: data.default_priority,
            required_role: data.required_role,
            assignment_mode: data.assignment_mode,
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

const handleSubcategoryFieldChange = (field: string, value: any) => {
    if (field === 'assignment_mode') {
        selectedAssignmentMode.value = value
    }
}

const handleAddRole = async (data: any) => {
    try {
        const newRole = await service.createRole({
            key: data.key,
            name: data.name,
            description: data.description || '',
            display_order: data.display_order || 1
        })
        roles.value.push(newRole)
        message.success('Role added successfully')
    } catch (error) {
        message.error('Failed to add role')
    }
}

const handleEditRole = async (record: HelpdeskRole, data: any) => {
    try {
        const updated = await service.updateRole(record.id, {
            name: data.name,
            key: data.key,
            description: data.description,
            display_order: data.display_order
        })
        const index = roles.value.findIndex(r => r.id === record.id)
        if (index > -1) roles.value[index] = updated
        message.success('Role updated successfully')
    } catch (error) {
        message.error('Failed to update role')
    }
}

const handleDeleteRole = async (record: HelpdeskRole) => {
    try {
        await service.deleteRole(record.id)
        roles.value = roles.value.filter(r => r.id !== record.id)
        message.success('Role deleted successfully')
    } catch (error) {
        message.error('Failed to delete role')
    }
}

const handleAddDirectEscalation = async (data: any) => {
    try {
        const newMapping = await service.createDirectedEscalationRoleMapping({
            assignment_mode: ASSIGNMENT_MODE,
            role: data.role,
            deadline_hours: data.deadline_hours || 2,
            is_active: data.is_active !== false
        })
        const role = roles.value.find(r => r.id === data.role)
        newMapping.role_name = role?.name || ''
        directEscalationMappings.value.push(newMapping)
        message.success('Direct escalation mapping added successfully')
    } catch (error) {
        message.error('Failed to add direct escalation mapping')
    }
}

const handleEditDirectEscalation = async (record: DirectedEscalationRoleMapping, data: any) => {
    try {
        const updated = await service.updateDirectedEscalationRoleMapping(record.id, {
            role: data.role,
            deadline_hours: data.deadline_hours,
            is_active: data.is_active
        })
        const index = directEscalationMappings.value.findIndex(m => m.id === record.id)
        if (index > -1) {
            const role = roles.value.find(r => r.id === data.role)
            directEscalationMappings.value[index] = { ...directEscalationMappings.value[index], ...updated, role_name: role?.name || '' }
        }
        message.success('Direct escalation mapping updated successfully')
    } catch (error) {
        message.error('Failed to update direct escalation mapping')
    }
}

const handleDeleteDirectEscalation = async (record: DirectedEscalationRoleMapping) => {
    try {
        await service.deleteDirectedEscalationRoleMapping(record.id)
        directEscalationMappings.value = directEscalationMappings.value.filter(m => m.id !== record.id)
        message.success('Direct escalation mapping deleted successfully')
    } catch (error) {
        message.error('Failed to delete direct escalation mapping')
    }
}
</script>
