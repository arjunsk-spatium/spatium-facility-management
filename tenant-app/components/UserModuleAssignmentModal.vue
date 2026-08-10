<template>
    <a-modal :open="visible" 
        :title="`Manage Access - ${props.user?.name}`"
        width="900px"
        style="top: 20px;"
        :destroy-on-close="true"
        @cancel="closeModal"
        @update:open="handleUpdateOpen">
        <template #footer>
            <a-button @click="closeModal">Cancel</a-button>
            <a-button v-if="hasModuleChanges" type="primary" :loading="saving" @click="saveModules">
                Save Changes
            </a-button>
        </template>
        
        <div v-if="props.user" class="mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-for="mod in systemModules" :key="mod.id" 
                    class="module-card p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div class="flex items-center justify-between mb-2">
                        <span class="font-medium text-gray-900 dark:text-white">{{ mod.module }}</span>
                        <a-checkbox 
                            :checked="isModuleFullyAssigned(mod)" 
                            :indeterminate="isModulePartiallyAssigned(mod)"
                            @change="toggleModuleAll(mod)"
                        >
                            All
                        </a-checkbox>
                    </div>
                    <div class="space-y-2">
                        <div v-for="submod in mod.submodules" :key="submod.id" class="submodule-item">
                            <div class="flex items-center gap-2 text-sm">
                                <a-checkbox 
                                    :checked="isSubmoduleFullyAssigned(submod)"
                                    :indeterminate="isSubmodulePartiallyAssigned(submod)"
                                    @change="toggleSubmoduleAll(submod, mod)"
                                >
                                    {{ submod.name }}
                                </a-checkbox>
                            </div>
                            <div class="ml-6 mt-1 flex flex-wrap gap-1">
                                <span v-for="perm in submod.permissions" :key="perm.id"
                                    :class="[
                                        'text-xs px-1.5 py-0.5 rounded',
                                        isViewDisabled(perm, submod) ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                                        isPermissionAssigned(perm.id) 
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                    ]"
                                    @click="togglePermission(perm.id, submod)">
                                    {{ perm.name }}
                                </span>
                            </div>
                            <div v-if="submod.features && submod.features.length" class="ml-6 mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div class="text-xs font-medium text-gray-500 mb-1">Features</div>
                                <div class="flex flex-col gap-1.5">
                                    <div v-for="feat in submod.features" :key="feat.id" class="flex items-center gap-2 flex-wrap">
                                        <span class="text-xs text-gray-600 dark:text-gray-400 font-medium">{{ feat.name }}:</span>
                                        <span v-for="perm in feat.permissions" :key="perm.id"
                                            :class="[
                                                'text-xs px-1.5 py-0.5 rounded cursor-pointer',
                                                isFeaturePermissionAssigned(perm.id) 
                                                    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                                            ]"
                                            @click="toggleFeaturePermission(perm.id, submod)">
                                            {{ perm.name }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useUserService, type User, type SystemModule } from '../composables/userService'

const props = defineProps<{
    user: User
    open: boolean
}>()

const emit = defineEmits<{
    'update:open': [value: boolean]
    'saved': []
}>()

const { getAllSystemModules, getUserAssignedModules, assignModulesToUser } = useUserService()

const visible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
})

const systemModules = ref<SystemModule[]>([])
const userAssignedPermissions = ref<Set<string>>(new Set())
const originalUserPermissions = ref<Set<string>>(new Set())
const userAssignedFeatures = ref<Set<string>>(new Set())
const originalUserFeatures = ref<Set<string>>(new Set())
const saving = ref(false)
const loading = ref(false)

const handleUpdateOpen = (val: boolean) => {
    visible.value = val
}

const closeModal = () => {
    visible.value = false
}

const loadData = async () => {
    if (!props.user) return
    loading.value = true
    try {
        const [modulesData, assignedPerms] = await Promise.all([
            getAllSystemModules(),
            getUserAssignedModules(props.user.id)
        ])
        systemModules.value = modulesData
        userAssignedPermissions.value = new Set(assignedPerms.submodules)
        originalUserPermissions.value = new Set(assignedPerms.submodules)
        userAssignedFeatures.value = new Set(assignedPerms.features)
        originalUserFeatures.value = new Set(assignedPerms.features)
    } catch (error) {
        message.error('Failed to load module data')
    } finally {
        loading.value = false
    }
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        loadData()
    }
}, { immediate: true })

const isModuleFullyAssigned = (mod: SystemModule): boolean => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    const totalCount = allPerms.length + allFeatPerms.length
    if (totalCount === 0) {
        return mod.submodules.every((sm: any) => userPerms.has(sm.id))
    }
    
    return allPerms.every(p => userPerms.has(p)) && allFeatPerms.every(p => userFeats.has(p))
}

const isModulePartiallyAssigned = (mod: SystemModule): boolean => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    const totalCount = allPerms.length + allFeatPerms.length
    if (totalCount === 0) {
        const assignedCount = mod.submodules.filter((sm: any) => userPerms.has(sm.id)).length
        return assignedCount > 0 && assignedCount < mod.submodules.length
    }
    
    const assignedCount = allPerms.filter(p => userPerms.has(p)).length + allFeatPerms.filter(p => userFeats.has(p)).length
    return assignedCount > 0 && assignedCount < totalCount
}

const isSubmoduleFullyAssigned = (submod: any): boolean => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms = submod.permissions.map((p: any) => p.id)
    const allFeatPerms = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    const totalCount = allPerms.length + allFeatPerms.length
    if (totalCount === 0) {
        return userPerms.has(submod.id)
    }
    
    return allPerms.every((p: string) => userPerms.has(p)) && allFeatPerms.every((p: string) => userFeats.has(p))
}

const isSubmodulePartiallyAssigned = (submod: any): boolean => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms = submod.permissions.map((p: any) => p.id)
    const allFeatPerms = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    const totalCount = allPerms.length + allFeatPerms.length
    if (totalCount === 0) {
        return false
    }
    
    const assignedCount = allPerms.filter((p: string) => userPerms.has(p)).length + allFeatPerms.filter((p: string) => userFeats.has(p)).length
    return assignedCount > 0 && assignedCount < totalCount
}

const isPermissionAssigned = (permissionId: string): boolean => {
    return userAssignedPermissions.value.has(permissionId)
}

const isFeaturePermissionAssigned = (permissionId: string): boolean => {
    return userAssignedFeatures.value.has(permissionId)
}

const toggleModuleAll = (mod: SystemModule) => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms = mod.submodules.flatMap(sm => sm.permissions.map(p => p.id))
    const allFeatPerms = mod.submodules.flatMap(sm => (sm.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id)))
    
    if (allPerms.length === 0 && allFeatPerms.length === 0) {
        const allAssigned = mod.submodules.every((sm: any) => userPerms.has(sm.id))
        if (allAssigned) {
            mod.submodules.forEach((sm: any) => userPerms.delete(sm.id))
        } else {
            mod.submodules.forEach((sm: any) => userPerms.add(sm.id))
        }
        return
    }
    
    const allAssigned = allPerms.every(p => userPerms.has(p)) && allFeatPerms.every(p => userFeats.has(p))
    
    if (allAssigned) {
        allPerms.forEach(p => userPerms.delete(p))
        allFeatPerms.forEach(p => userFeats.delete(p))
    } else {
        allPerms.forEach(p => userPerms.add(p))
        allFeatPerms.forEach(p => userFeats.add(p))
    }
}

const toggleSubmoduleAll = (submod: any, mod: SystemModule) => {
    const userPerms = userAssignedPermissions.value
    const userFeats = userAssignedFeatures.value
    
    const allPerms: string[] = submod.permissions.map((p: any) => p.id)
    const allFeatPerms: string[] = (submod.features || []).flatMap((f: any) => f.permissions.map((p: any) => p.id))
    
    if (allPerms.length === 0 && allFeatPerms.length === 0) {
        if (userPerms.has(submod.id)) {
            userPerms.delete(submod.id)
        } else {
            userPerms.add(submod.id)
        }
        return
    }
    
    const allAssigned = allPerms.every((p: string) => userPerms.has(p)) && allFeatPerms.every((p: string) => userFeats.has(p))
    
    if (allAssigned) {
        allPerms.forEach((p: string) => userPerms.delete(p))
        allFeatPerms.forEach((p: string) => userFeats.delete(p))
    } else {
        allPerms.forEach((p: string) => userPerms.add(p))
        allFeatPerms.forEach((p: string) => userFeats.add(p))
    }
}

const isViewPermission = (perm: any): boolean => {
    return perm?.name?.toLowerCase() === 'view' || perm?.key?.toLowerCase() === 'view'
}

const isViewDisabled = (perm: any, submod: any): boolean => {
    if (!perm || !submod || !isViewPermission(perm)) return false

    if (!userAssignedPermissions.value.has(perm.id)) return false

    const hasOtherPerms = (submod.permissions || []).some((p: any) => 
        !isViewPermission(p) && userAssignedPermissions.value.has(p.id)
    )
    if (hasOtherPerms) return true

    const hasOtherFeatPerms = (submod.features || []).some((f: any) => 
        (f.permissions || []).some((p: any) => userAssignedFeatures.value.has(p.id))
    )
    if (hasOtherFeatPerms) return true

    return false
}

const togglePermission = (permissionId: string, submod?: any) => {
    let targetSubmod = submod
    if (!targetSubmod) {
        for (const mod of systemModules.value) {
            const found = mod.submodules.find((sm: any) => sm.permissions?.some((p: any) => p.id === permissionId))
            if (found) {
                targetSubmod = found
                break
            }
        }
    }

    if (targetSubmod) {
        const perm = targetSubmod.permissions?.find((p: any) => p.id === permissionId)
        if (perm && isViewDisabled(perm, targetSubmod)) {
            return
        }
    }

    const userPerms = userAssignedPermissions.value
    if (userPerms.has(permissionId)) {
        userPerms.delete(permissionId)
    } else {
        userPerms.add(permissionId)

        if (targetSubmod && targetSubmod.permissions) {
            const viewPerm = targetSubmod.permissions.find((p: any) => isViewPermission(p))
            if (viewPerm) {
                userPerms.add(viewPerm.id)
            }
        }
    }
}

const toggleFeaturePermission = (permissionId: string, submod?: any) => {
    const userFeats = userAssignedFeatures.value
    if (userFeats.has(permissionId)) {
        userFeats.delete(permissionId)
    } else {
        userFeats.add(permissionId)

        let targetSubmod = submod
        if (!targetSubmod) {
            for (const mod of systemModules.value) {
                const found = mod.submodules.find((sm: any) => (sm.features || []).some((f: any) => f.permissions?.some((p: any) => p.id === permissionId)))
                if (found) {
                    targetSubmod = found
                    break
                }
            }
        }

        if (targetSubmod && targetSubmod.permissions) {
            const viewPerm = targetSubmod.permissions.find((p: any) => 
                p.name?.toLowerCase() === 'view' || p.key?.toLowerCase() === 'view'
            )
            if (viewPerm) {
                userAssignedPermissions.value.add(viewPerm.id)
            }
        }
    }
}

const hasModuleChanges = computed((): boolean => {
    const original = originalUserPermissions.value
    const current = userAssignedPermissions.value
    const originalFeat = originalUserFeatures.value
    const currentFeat = userAssignedFeatures.value
    
    if (original.size !== current.size || originalFeat.size !== currentFeat.size) return true
    
    for (const p of original) {
        if (!current.has(p)) return true
    }
    for (const p of originalFeat) {
        if (!currentFeat.has(p)) return true
    }
    return false
})

const saveModules = async () => {
    if (!props.user) return
    saving.value = true
    try {
        const permissionArray = Array.from(userAssignedPermissions.value || [])
        const featureArray = Array.from(userAssignedFeatures.value || [])
        
        await assignModulesToUser(props.user.id, permissionArray, featureArray)
        
        originalUserPermissions.value = new Set(userAssignedPermissions.value)
        originalUserFeatures.value = new Set(userAssignedFeatures.value)
        message.success('Modules updated successfully')
        emit('saved')
        closeModal()
    } catch (error) {
        message.error('Failed to update modules')
    } finally {
        saving.value = false
    }
}
</script>

<style scoped>
.module-card {
    background-color: #fafafa;
    transition: all 0.15s ease;
}

.dark .module-card {
    background-color: #1f2937;
}

.submodule-item {
    padding: 0.25rem 0;
    border-bottom: 1px solid #f0f0f0;
}

.dark .submodule-item {
    border-bottom-color: #374151;
}

.submodule-item:last-child {
    border-bottom: none;
}
</style>
