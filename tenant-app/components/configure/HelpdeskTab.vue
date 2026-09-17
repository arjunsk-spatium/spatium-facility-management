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

            <a-tab-pane key="config" tab="General Config">
                <div class="py-4 max-w-2xl">
                    <a-card title="Helpdesk Operational Configuration" :bordered="true">
                        <div class="space-y-6">
                            <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                                <div>
                                    <div class="font-medium text-gray-900 dark:text-white">Priority Aging</div>
                                    <div class="text-xs text-gray-500">Automatically bump ticket priority after aging intervals</div>
                                </div>
                                <a-switch v-model:checked="helpdeskConfig.priority_aging_enabled" />
                            </div>

                            <div v-if="helpdeskConfig.priority_aging_enabled" class="space-y-1">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Aging Interval (minutes)</label>
                                <a-input-number
                                    v-model:value="helpdeskConfig.aging_interval_minutes"
                                    :min="1"
                                    class="w-full"
                                />
                                <div class="text-xs text-gray-500">Tickets will age up priority if waiting unserviced for this duration</div>
                            </div>

                            <div class="space-y-1">
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300">Auto-Close Hours</label>
                                <a-input-number
                                    v-model:value="helpdeskConfig.auto_close_hours"
                                    :min="1"
                                    class="w-full"
                                />
                                <div class="text-xs text-gray-500">Resolved tickets auto-close after this many hours</div>
                            </div>

                            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <div class="font-medium text-gray-900 dark:text-white">Auto-Mode Capacity Gate</div>
                                    <div class="text-xs text-gray-500">Prevent auto-assigning tickets to workers who reached their throttle limit</div>
                                </div>
                                <a-switch v-model:checked="helpdeskConfig.auto_mode_capacity_gate_enabled" />
                            </div>

                            <div class="pt-4 flex justify-end">
                                <a-button type="primary" :loading="savingConfig" @click="handleSaveConfig">
                                    Save Helpdesk Settings
                                </a-button>
                            </div>
                        </div>
                    </a-card>
                </div>
            </a-tab-pane>

            <a-tab-pane v-if="isScopeLadderEntitled" key="scoring" tab="ScopeLadder Scoring">
                <div class="py-4 max-w-2xl">
                    <a-card title="ScopeLadder Multi-Factor Scoring Weights" :bordered="true">
                        <div class="space-y-6">
                            <a-alert
                                type="info"
                                show-icon
                                message="Weights customize candidate selection during location-scope cascades. Higher weights increase importance of that dimension."
                                class="mb-2"
                            />

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-medium dark:text-white">α — Skill Match Weight</span>
                                    <span class="font-mono text-sm">{{ scoringConfig.alpha }}</span>
                                </div>
                                <a-slider v-model:value="scoringConfig.alpha" :min="0" :max="5" :step="0.1" />
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-medium dark:text-white">β — Load Headroom Weight</span>
                                    <span class="font-mono text-sm">{{ scoringConfig.beta }}</span>
                                </div>
                                <a-slider v-model:value="scoringConfig.beta" :min="0" :max="5" :step="0.1" />
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-medium dark:text-white">γ — Availability Weight</span>
                                    <span class="font-mono text-sm">{{ scoringConfig.gamma }}</span>
                                </div>
                                <a-slider v-model:value="scoringConfig.gamma" :min="0" :max="5" :step="0.1" />
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-medium dark:text-white">δ — Fairness (Even Distribution) Weight</span>
                                    <span class="font-mono text-sm">{{ scoringConfig.delta }}</span>
                                </div>
                                <a-slider v-model:value="scoringConfig.delta" :min="0" :max="5" :step="0.1" />
                            </div>

                            <div>
                                <div class="flex justify-between items-center mb-1">
                                    <span class="text-sm font-medium dark:text-white">ε — Proximity Weight</span>
                                    <span class="font-mono text-sm">{{ scoringConfig.epsilon }}</span>
                                </div>
                                <a-slider v-model:value="scoringConfig.epsilon" :min="0" :max="5" :step="0.1" />
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Reassign Threshold</label>
                                    <a-input-number
                                        v-model:value="scoringConfig.reassign_threshold"
                                        :min="0"
                                        :step="0.05"
                                        class="w-full"
                                    />
                                </div>
                                <div>
                                    <label class="block text-xs font-medium text-gray-500 mb-1">Handover Penalty</label>
                                    <a-input-number
                                        v-model:value="scoringConfig.handover_penalty"
                                        :min="0"
                                        :step="0.05"
                                        class="w-full"
                                    />
                                </div>
                            </div>

                            <div class="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
                                <div>
                                    <div class="font-medium text-gray-900 dark:text-white">Night Mode Dispatch</div>
                                    <div class="text-xs text-gray-500">When on, ScopeLadder skips wing/floor/tower and directly considers facility-level candidates.</div>
                                </div>
                                <a-switch v-model:checked="scoringConfig.night_mode_enabled" />
                            </div>

                            <div class="pt-4 flex justify-end">
                                <a-button type="primary" :loading="savingScoring" @click="handleSaveScoring">
                                    Save Scoring Weights
                                </a-button>
                            </div>
                        </div>
                    </a-card>
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type HelpdeskCategory, type HelpdeskSubCategory, type HelpdeskRole, type HelpdeskPriority, type HelpdeskAssignmentMode, type HelpdeskConfig, type HelpdeskScoringConfig } from '../../composables/helpdeskService'
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
const loadingPriorities = ref(false)
const loadingAssignmentModes = ref(false)

const service = useHelpdeskService()

// Category data
const categories = ref<HelpdeskCategory[]>([])
const selectedCategoryId = ref<string>()

// Subcategory data
const subcategories = ref<HelpdeskSubCategory[]>([])

// Role data (kept for subcategory required_role selection)
const roles = ref<HelpdeskRole[]>([])

// Priority data
const priorities = ref<HelpdeskPriority[]>([])

// Assignment Mode data
const assignmentModes = ref<HelpdeskAssignmentMode[]>([])

// General Config & Scoring Config State
const loadingConfig = ref(false)
const savingConfig = ref(false)
const helpdeskConfig = ref<HelpdeskConfig>({
    priority_aging_enabled: false,
    aging_interval_minutes: 60,
    auto_close_hours: 48,
    auto_mode_capacity_gate_enabled: false
})

const loadingScoring = ref(false)
const savingScoring = ref(false)
const scoringConfig = ref<HelpdeskScoringConfig>({
    alpha: 1.0,
    beta: 1.0,
    gamma: 1.0,
    delta: 1.0,
    epsilon: 1.0,
    reassign_threshold: 0.1,
    handover_penalty: 0.15,
    night_mode_enabled: false
})

const isScopeLadderEntitled = computed(() => {
    return assignmentModes.value.some(m =>
        m.key?.toLowerCase() === 'scope_ladder' ||
        m.name?.toLowerCase().includes('scopeladder') ||
        m.name?.toLowerCase().includes('scope ladder')
    )
})

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
    { title: 'Default Effort (min)', dataIndex: 'default_estimated_effort_min', key: 'default_estimated_effort_min' },
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

const isAutoAssignmentMode = (modeIdOrKey?: string) => {
    if (!modeIdOrKey) return false
    if (modeIdOrKey === '00000000-0000-0000-0000-000000000301') return true
    const mode = assignmentModes.value.find(m => m.id === modeIdOrKey || m.key === modeIdOrKey)
    if (mode) {
        return mode.key?.toLowerCase() === 'auto' || mode.name?.toLowerCase().includes('auto')
    }
    return typeof modeIdOrKey === 'string' && modeIdOrKey.toLowerCase() === 'auto'
}

const subcategoryFields = computed(() => {
    const priorityOpts = priorityOptions.value?.length ? priorityOptions.value : []
    const assignmentOpts = assignmentModeOptions.value?.length ? assignmentModeOptions.value : []
    const roleOpts = roleOptions.value?.length ? roleOptions.value : []
    
    const fields = [
        { name: 'name', label: 'Name', type: 'text' as const },
        { name: 'default_priority', label: 'Default Priority', type: 'select' as const, options: priorityOpts },
        { name: 'assignment_mode', label: 'Assignment Mode', type: 'select' as const, options: assignmentOpts },
        { name: 'default_estimated_effort_min', label: 'Default Estimated Effort (minutes)', type: 'number' as const },
        { name: 'response_sla', label: 'Response SLA (minutes)', type: 'number' as const },
        { name: 'resolution_sla', label: 'Resolution SLA (minutes)', type: 'number' as const }
    ]
    
    // Auto assignment mode requires a role
    if (isAutoAssignmentMode(selectedAssignmentMode.value)) {
        fields.splice(3, 0, { name: 'required_role', label: 'Required Role', type: 'select' as const, options: roleOpts })
    }
    
    return fields
})

const selectedAssignmentMode = ref<string | undefined>()

watch(selectedAssignmentMode, (newVal) => {
    if (isAutoAssignmentMode(newVal)) {
        if (roles.value.length === 0 && !loadingRoles.value) {
            fetchRoles()
        }
    }
})

// Computed options
const categoryOptions = computed(() =>
    categories.value.map(c => ({ label: c.name, value: c.id }))
)

const roleOptions = computed(() =>
    roles.value.map(r => ({ label: r.name, value: r.id }))
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

// Initial load
onMounted(async () => {
    await Promise.all([
        fetchCategories(),
        fetchSubcategories(),
        fetchRoles(),
        fetchPriorities(),
        fetchAssignmentModes(),
        fetchHelpdeskConfig(),
        fetchScoringConfig()
    ])
})

const fetchHelpdeskConfig = async () => {
    if (!service.getHelpdeskConfig) return
    loadingConfig.value = true
    try {
        const res = await service.getHelpdeskConfig()
        if (res) {
            helpdeskConfig.value = { ...helpdeskConfig.value, ...res }
        }
    } catch (error) {
        console.error('Failed to load helpdesk config:', error)
    } finally {
        loadingConfig.value = false
    }
}

const handleSaveConfig = async () => {
    if (!service.updateHelpdeskConfig) return
    savingConfig.value = true
    try {
        await service.updateHelpdeskConfig(helpdeskConfig.value)
        message.success('Helpdesk settings saved successfully')
    } catch (error: any) {
        message.error(error.message || 'Failed to save helpdesk settings')
    } finally {
        savingConfig.value = false
    }
}

const fetchScoringConfig = async () => {
    if (!service.getScoringConfig) return
    loadingScoring.value = true
    try {
        const res = await service.getScoringConfig()
        if (res) {
            scoringConfig.value = { ...scoringConfig.value, ...res }
        }
    } catch (error) {
        console.error('Failed to load scoring config:', error)
    } finally {
        loadingScoring.value = false
    }
}

const handleSaveScoring = async () => {
    if (!service.updateScoringConfig) return
    savingScoring.value = true
    try {
        await service.updateScoringConfig(scoringConfig.value)
        message.success('ScopeLadder scoring weights saved successfully')
    } catch (error: any) {
        message.error(error.message || 'Failed to save scoring weights')
    } finally {
        savingScoring.value = false
    }
}

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
            default_estimated_effort_min: data.default_estimated_effort_min ? Number(data.default_estimated_effort_min) : null,
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
            key: record.key,
            default_priority: data.default_priority,
            required_role: data.required_role,
            assignment_mode: data.assignment_mode,
            default_estimated_effort_min: data.default_estimated_effort_min ? Number(data.default_estimated_effort_min) : null,
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

const handleSubcategoryFieldChange = (fieldOrData: any, value?: any) => {
    let mode: string | undefined
    if (typeof fieldOrData === 'string') {
        if (fieldOrData === 'assignment_mode') {
            mode = value
        }
    } else if (fieldOrData && typeof fieldOrData === 'object') {
        mode = fieldOrData.assignment_mode
    }

    if (mode !== undefined) {
        selectedAssignmentMode.value = mode
        if (isAutoAssignmentMode(mode) && roles.value.length === 0 && !loadingRoles.value) {
            fetchRoles()
        }
    }
}
</script>
