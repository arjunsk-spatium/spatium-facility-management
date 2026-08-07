<template>
    <div class="space-y-6" v-if="user">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div class="flex items-center gap-3">
                <a-avatar :size="56" class="bg-primary-100 text-primary-600 flex-shrink-0 text-xl">
                    {{ user.name.charAt(0).toUpperCase() }}
                </a-avatar>
                <div>
                    <div class="flex items-center gap-2">
                        <h1 class="text-2xl font-bold dark:text-white">{{ user.name }}</h1>
                        <span v-if="user.status"
                            :class="[
                                'w-2.5 h-2.5 rounded-full',
                                user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                            ]"
                            :title="user.status">
                        </span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-400">{{ user.email }}</p>
                </div>
            </div>
            <a-button @click="navigateTo('/users')">
                Back to Users
            </a-button>
        </div>

        <!-- User Info Card -->
        <a-card title="User Details">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                    <p class="text-sm font-medium dark:text-white">{{ user.email }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">Phone</p>
                    <p class="text-sm font-medium dark:text-white">{{ user.phone || 'Not provided' }}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-500 uppercase tracking-wide">Role</p>
                    <p class="text-sm font-medium dark:text-white">{{ user.role }}</p>
                </div>
            </div>
        </a-card>

        <!-- Modules Card -->
        <a-card title="Modules">
            <template #extra>
                <a-button type="primary" ghost @click="openModuleModal">
                    Manage Modules
                </a-button>
            </template>
            <div v-if="loading" class="flex justify-center py-8">
                <a-spin />
            </div>
            <div v-else-if="assignedSubmodules.length === 0 && assignedFeatures.length === 0" class="text-gray-500">
                No modules assigned.
            </div>
            <div v-else class="space-y-4">
                <div v-if="assignedSubmodules.length > 0">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Module Access</h3>
                    <div class="flex flex-wrap gap-2">
                        <a-tag v-for="name in assignedSubmodules" :key="name" color="blue">{{ name }}</a-tag>
                    </div>
                </div>
                <div v-if="assignedFeatures.length > 0">
                    <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Features</h3>
                    <div class="flex flex-wrap gap-2">
                        <a-tag v-for="name in assignedFeatures" :key="name" color="orange">{{ name }}</a-tag>
                    </div>
                </div>
            </div>
        </a-card>

        <!-- Facilities Card -->
        <a-card title="Facilities">
            <template #extra>
                <a-button type="primary" ghost @click="openFacilityModal">
                    Manage Facilities
                </a-button>
            </template>
            <div v-if="loading" class="flex justify-center py-8">
                <a-spin />
            </div>
            <div v-else-if="userFacilities.is_all_facilities" class="text-gray-500">
                All facilities
            </div>
            <div v-else-if="assignedFacilityNames.length === 0" class="text-gray-500">
                No facilities assigned.
            </div>
            <div v-else class="flex flex-wrap gap-2">
                <a-tag v-for="name in assignedFacilityNames" :key="name" color="green">{{ name }}</a-tag>
            </div>
        </a-card>

        <UserModuleAssignmentModal
            v-if="user"
            v-model:open="moduleModalVisible"
            :user="user"
            @saved="loadData" />

        <UserFacilityAssignmentModal
            v-if="user"
            v-model:open="facilityModalVisible"
            :user="user"
            @saved="loadData" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserService, type User, type SystemModule } from '../../../../composables/userService'
import { useFacilityService, type Facility } from '../../../../composables/facilityService'
import UserModuleAssignmentModal from '../../../../components/UserModuleAssignmentModal.vue'
import UserFacilityAssignmentModal from '../../../../components/UserFacilityAssignmentModal.vue'

definePageMeta({
    middleware: 'auth',
    layout: 'default'
})

const route = useRoute()
const { getUsers, getUserAssignedModules, getAllSystemModules, getUserFacilities } = useUserService()
const facilityService = useFacilityService()

const user = ref<User | null>(null)
const systemModules = ref<SystemModule[]>([])
const allFacilities = ref<Facility[]>([])
const userAssignedModules = ref<{ submodules: string[]; features: string[] }>({ submodules: [], features: [] })
const userFacilities = ref<{ facility_ids: string[]; is_all_facilities: boolean }>({ facility_ids: [], is_all_facilities: false })
const loading = ref(false)
const moduleModalVisible = ref(false)
const facilityModalVisible = ref(false)

const submoduleNameMap = computed(() => {
    const map: Record<string, string> = {}
    systemModules.value.forEach(mod => {
        mod.submodules.forEach(sm => {
            sm.permissions.forEach(p => {
                map[p.id] = `${mod.module} - ${sm.name} (${p.name})`
            })
        })
    })
    return map
})

const featureNameMap = computed(() => {
    const map: Record<string, string> = {}
    systemModules.value.forEach(mod => {
        mod.submodules.forEach(sm => {
            (sm.features || []).forEach((feat: any) => {
                feat.permissions.forEach((p: any) => {
                    map[p.id] = `${mod.module} - ${sm.name} - ${feat.name} (${p.name})`
                })
            })
        })
    })
    return map
})

const assignedSubmodules = computed(() => {
    return userAssignedModules.value.submodules
        .map(id => submoduleNameMap.value[id] || id)
        .filter((v, i, a) => a.indexOf(v) === i)
})

const assignedFeatures = computed(() => {
    return userAssignedModules.value.features
        .map(id => featureNameMap.value[id] || id)
        .filter((v, i, a) => a.indexOf(v) === i)
})

const facilityNameMap = computed(() => {
    const map: Record<string, string> = {}
    allFacilities.value.forEach(f => {
        map[f.id] = f.name
    })
    return map
})

const assignedFacilityNames = computed(() => {
    return userFacilities.value.facility_ids
        .map(id => facilityNameMap.value[id] || id)
})

const loadData = async () => {
    const userId = route.params.id as string
    if (!userId) return

    loading.value = true
    try {
        const usersData = await getUsers()
        const found = usersData.find((u: User) => u.id === userId) || null
        if (!found) {
            user.value = null
            message.error('User not found')
            return
        }
        user.value = found

        const [modulesData, assignedModulesData, facilitiesData, allFacilitiesData] = await Promise.all([
            getAllSystemModules(),
            getUserAssignedModules(userId),
            getUserFacilities(userId),
            facilityService.getFacilities({ page_size: 999 })
        ])

        systemModules.value = modulesData
        userAssignedModules.value = assignedModulesData
        userFacilities.value = {
            facility_ids: facilitiesData.facility_ids || [],
            is_all_facilities: facilitiesData.is_all_facilities
        }
        allFacilities.value = allFacilitiesData.facilities || []
    } catch (error) {
        message.error('Failed to load user details')
    } finally {
        loading.value = false
    }
}

const openModuleModal = () => {
    moduleModalVisible.value = true
}

const openFacilityModal = () => {
    facilityModalVisible.value = true
}

onMounted(loadData)
</script>
