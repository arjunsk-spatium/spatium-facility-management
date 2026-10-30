<template>
    <a-modal
        :open="open"
        :title="`Location Scope — ${userName || 'Worker'}`"
        width="800px"
        :confirm-loading="saving"
        @ok="handleSave"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2">
            <a-alert
                type="info"
                show-icon
                message="ScopeLadder cascades assignments outward: Wing → Floor → Tower → Facility. Configure this worker's covered areas below."
                class="mb-4"
            />

            <!-- Add Scope Form -->
            <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3">
                <div class="font-medium text-sm text-gray-700 dark:text-gray-300">Add Location Scope</div>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Scope Level</label>
                        <a-select
                            v-model:value="newScope.scope_type"
                            class="w-full"
                            :options="scopeTypeOptions"
                            @change="handleScopeTypeChange"
                        />
                    </div>
                    <div>
                        <label class="block text-xs font-medium text-gray-500 mb-1">Facility *</label>
                        <a-select
                            v-model:value="newScope.facility_id"
                            class="w-full"
                            placeholder="Select Facility"
                            :options="facilityOptions"
                            :loading="loadingFacilities"
                            @change="handleFacilityChange"
                        />
                    </div>
                    <div v-if="needsTower">
                        <label class="block text-xs font-medium text-gray-500 mb-1">Tower *</label>
                        <a-select
                            v-model:value="newScope.tower_id"
                            class="w-full"
                            placeholder="Select Tower"
                            :options="towerOptions"
                            :loading="loadingTowers"
                            :disabled="!newScope.facility_id"
                            @change="handleTowerChange"
                        />
                    </div>
                    <div v-if="needsFloor">
                        <label class="block text-xs font-medium text-gray-500 mb-1">Floor *</label>
                        <a-select
                            v-model:value="newScope.floor_id"
                            class="w-full"
                            placeholder="Select Floor"
                            :options="floorOptions"
                            :loading="loadingFloors"
                            :disabled="!newScope.tower_id"
                            @change="handleFloorChange"
                        />
                    </div>
                    <div v-if="needsWing">
                        <label class="block text-xs font-medium text-gray-500 mb-1">Wing *</label>
                        <a-select
                            v-model:value="newScope.wing_id"
                            class="w-full"
                            placeholder="Select Wing"
                            :options="wingOptions"
                            :loading="loadingWings"
                            :disabled="!newScope.floor_id"
                        />
                    </div>
                </div>
                <div class="flex justify-end pt-1">
                    <a-button type="dashed" size="small" @click="handleAddScope">
                        Add Scope Row
                    </a-button>
                </div>
            </div>

            <!-- Scopes Table -->
            <a-table
                :columns="columns"
                :data-source="scopes"
                :loading="loadingScopes"
                row-key="id"
                size="small"
                :pagination="false"
            >
                <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key === 'scope_type'">
                        <a-tag :color="getScopeColor(record.scope_type)">{{ record.scope_type }}</a-tag>
                    </template>
                    <template v-else-if="column.key === 'facility'">
                        <span class="font-medium text-gray-900 dark:text-white">{{ getFacilityDisplay(record) }}</span>
                    </template>
                    <template v-else-if="column.key === 'tower'">
                        <span>{{ getTowerDisplay(record) }}</span>
                    </template>
                    <template v-else-if="column.key === 'floor'">
                        <span>{{ getFloorDisplay(record) }}</span>
                    </template>
                    <template v-else-if="column.key === 'wing'">
                        <span>{{ getWingDisplay(record) }}</span>
                    </template>
                    <template v-else-if="column.key === 'action'">
                        <a-button type="text" danger size="small" @click="handleRemoveScope(index)">
                            Remove
                        </a-button>
                    </template>
                </template>
            </a-table>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService, type WorkerLocationScope } from '../../../composables/helpdeskService'
import { useFacilityService } from '../../../composables/facilityService'

const props = defineProps<{
    open: boolean
    userId: string
    userName?: string
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'saved'): void
}>()

const helpdeskService = useHelpdeskService()
const facilityService = useFacilityService()

const loadingScopes = ref(false)
const saving = ref(false)
const scopes = ref<WorkerLocationScope[]>([])

// Cascading pickers state
const loadingFacilities = ref(false)
const loadingTowers = ref(false)
const loadingFloors = ref(false)
const loadingWings = ref(false)

const facilityList = ref<any[]>([])
const towerList = ref<any[]>([])
const floorList = ref<any[]>([])
const wingList = ref<any[]>([])

// Name lookup caches for ID-to-name resolution
const facilityNames = ref<Record<string, string>>({})
const towerNames = ref<Record<string, string>>({})
const floorNames = ref<Record<string, string>>({})
const wingNames = ref<Record<string, string>>({})

const scopeTypeOptions = [
    { label: 'Facility', value: 'FACILITY' },
    { label: 'Tower', value: 'TOWER' },
    { label: 'Floor', value: 'FLOOR' },
    { label: 'Wing', value: 'WING' },
]

const newScope = ref<{
    scope_type: 'FACILITY' | 'TOWER' | 'FLOOR' | 'WING'
    facility_id?: string
    tower_id?: string
    floor_id?: string
    wing_id?: string
}>({
    scope_type: 'FACILITY'
})

const needsTower = computed(() => ['TOWER', 'FLOOR', 'WING'].includes(newScope.value.scope_type))
const needsFloor = computed(() => ['FLOOR', 'WING'].includes(newScope.value.scope_type))
const needsWing = computed(() => newScope.value.scope_type === 'WING')

const facilityOptions = computed(() => facilityList.value.map(f => ({ label: f.name, value: f.id })))
const towerOptions = computed(() => towerList.value.map(t => ({ label: t.name, value: t.id })))
const floorOptions = computed(() => floorList.value.map(fl => ({ label: fl.name, value: fl.id })))
const wingOptions = computed(() => wingList.value.map(w => ({ label: w.name, value: w.id })))

const columns = [
    { title: 'Level', dataIndex: 'scope_type', key: 'scope_type', width: 100 },
    { title: 'Facility', key: 'facility' },
    { title: 'Tower', key: 'tower' },
    { title: 'Floor', key: 'floor' },
    { title: 'Wing', key: 'wing' },
    { title: 'Action', key: 'action', width: 80 }
]

const getScopeColor = (type: string) => {
    switch (type) {
        case 'WING': return 'green'
        case 'FLOOR': return 'orange'
        case 'TOWER': return 'cyan'
        default: return 'blue'
    }
}

const getFacilityDisplay = (record: WorkerLocationScope) => {
    if (record.facility_name) return record.facility_name
    if ((record as any).facility?.name) return (record as any).facility.name
    if ((record as any).facility_details?.name) return (record as any).facility_details.name
    const id = record.facility_id || (record as any).facility
    if (id && facilityNames.value[id]) {
        return facilityNames.value[id]
    }
    const match = facilityList.value.find(f => f.id === id)
    if (match?.name) return match.name
    return id || '—'
}

const getTowerDisplay = (record: WorkerLocationScope) => {
    if (record.tower_name) return record.tower_name
    if ((record as any).tower?.name) return (record as any).tower.name
    if ((record as any).tower_details?.name) return (record as any).tower_details.name
    const id = record.tower_id || (record as any).tower
    if (id && towerNames.value[id]) {
        return towerNames.value[id]
    }
    const match = towerList.value.find(t => t.id === id)
    if (match?.name) return match.name
    return id || '—'
}

const getFloorDisplay = (record: WorkerLocationScope) => {
    if (record.floor_name) return record.floor_name
    if ((record as any).floor?.name) return (record as any).floor.name
    if ((record as any).floor_details?.name) return (record as any).floor_details.name
    const id = record.floor_id || (record as any).floor
    if (id && floorNames.value[id]) {
        return floorNames.value[id]
    }
    const match = floorList.value.find(fl => fl.id === id)
    if (match?.name) return match.name
    return id || '—'
}

const getWingDisplay = (record: WorkerLocationScope) => {
    if (record.wing_name) return record.wing_name
    if ((record as any).wing?.name) return (record as any).wing.name
    if ((record as any).wing_details?.name) return (record as any).wing_details.name
    const id = record.wing_id || (record as any).wing
    if (id && wingNames.value[id]) {
        return wingNames.value[id]
    }
    const match = wingList.value.find(w => w.id === id)
    if (match?.name) return match.name
    return id || '—'
}

const loadFacilities = async () => {
    loadingFacilities.value = true
    try {
        const res = await facilityService.getFacilities({ page_size: 999 } as any)
        const list = res.facilities || (Array.isArray(res) ? res : [])
        facilityList.value = list
        for (const f of list) {
            if (f.id && f.name) {
                facilityNames.value[f.id] = f.name
            }
        }
    } catch (err: any) {
        console.error('Failed to load facilities:', err)
    } finally {
        loadingFacilities.value = false
    }
}

const resolveScopeNames = async (scopeList: WorkerLocationScope[]) => {
    if (!scopeList?.length) return

    // 1. Resolve Facility Names
    const facIds = [
        ...new Set(
            scopeList
                .map(s => s.facility_id || (s as any).facility)
                .filter(Boolean)
        )
    ] as string[]

    await Promise.all(
        facIds.map(async (facId) => {
            if (!facilityNames.value[facId]) {
                const found = facilityList.value.find(f => f.id === facId)
                if (found?.name) {
                    facilityNames.value[facId] = found.name
                } else {
                    try {
                        const fac = await facilityService.getFacilityById(facId)
                        if (fac?.name) facilityNames.value[facId] = fac.name
                    } catch (e) {
                        console.error(`Failed to fetch facility ${facId}:`, e)
                    }
                }
            }
        })
    )

    // 2. Resolve Tower Names
    const towerScopes = scopeList.filter(s => s.tower_id || (s as any).tower)
    const towerFacilityIds = [
        ...new Set(
            towerScopes
                .map(s => s.facility_id || (s as any).facility)
                .filter(Boolean)
        )
    ] as string[]

    await Promise.all(
        towerFacilityIds.map(async (facId) => {
            try {
                const res = await facilityService.getTowers(facId)
                const towers = res.towers || (Array.isArray(res) ? res : [])
                for (const t of towers) {
                    if (t.id && t.name) towerNames.value[t.id] = t.name
                }
            } catch (e) {
                console.error(`Failed to fetch towers for facility ${facId}:`, e)
            }
        })
    )

    // 3. Resolve Floor Names
    const floorScopes = scopeList.filter(s => s.floor_id || (s as any).floor)
    const floorTowerIds = [
        ...new Set(
            floorScopes
                .map(s => s.tower_id || (s as any).tower)
                .filter(Boolean)
        )
    ] as string[]

    await Promise.all(
        floorTowerIds.map(async (towerId) => {
            try {
                const floors = await facilityService.getFloors(towerId)
                for (const fl of (floors || [])) {
                    if (fl.id && fl.name) floorNames.value[fl.id] = fl.name
                }
            } catch (e) {
                console.error(`Failed to fetch floors for tower ${towerId}:`, e)
            }
        })
    )

    // 4. Resolve Wing Names
    const wingScopes = scopeList.filter(s => s.wing_id || (s as any).wing)
    const wingFloorIds = [
        ...new Set(
            wingScopes
                .map(s => s.floor_id || (s as any).floor)
                .filter(Boolean)
        )
    ] as string[]

    await Promise.all(
        wingFloorIds.map(async (floorId) => {
            try {
                const wings = await facilityService.getWings(floorId)
                for (const w of (wings || [])) {
                    if (w.id && w.name) wingNames.value[w.id] = w.name
                }
            } catch (e) {
                console.error(`Failed to fetch wings for floor ${floorId}:`, e)
            }
        })
    )

    // 5. Backfill *_name onto scopes
    for (const s of scopeList) {
        const facId = s.facility_id || (s as any).facility
        const towId = s.tower_id || (s as any).tower
        const flId = s.floor_id || (s as any).floor
        const wId = s.wing_id || (s as any).wing

        if (!s.facility_name && facId && facilityNames.value[facId]) {
            s.facility_name = facilityNames.value[facId]
        }
        if (!s.tower_name && towId && towerNames.value[towId]) {
            s.tower_name = towerNames.value[towId]
        }
        if (!s.floor_name && flId && floorNames.value[flId]) {
            s.floor_name = floorNames.value[flId]
        }
        if (!s.wing_name && wId && wingNames.value[wId]) {
            s.wing_name = wingNames.value[wId]
        }
    }
}

const loadScopes = async () => {
    if (!props.userId) return
    loadingScopes.value = true
    try {
        if (!facilityList.value.length) {
            await loadFacilities()
        }
        const res = await helpdeskService.getStaffLocationScopes(props.userId)
        scopes.value = res || []
        await resolveScopeNames(scopes.value)
    } catch (err: any) {
        message.error(err.message || 'Failed to load worker location scopes')
    } finally {
        loadingScopes.value = false
    }
}

const handleScopeTypeChange = () => {
    if (!needsTower.value) newScope.value.tower_id = undefined
    if (!needsFloor.value) newScope.value.floor_id = undefined
    if (!needsWing.value) newScope.value.wing_id = undefined
}

const handleFacilityChange = async (facId: string) => {
    newScope.value.tower_id = undefined
    newScope.value.floor_id = undefined
    newScope.value.wing_id = undefined
    towerList.value = []
    floorList.value = []
    wingList.value = []
    if (!facId || !needsTower.value) return

    loadingTowers.value = true
    try {
        const res = await facilityService.getTowers(facId)
        towerList.value = res.towers || (Array.isArray(res) ? res : [])
    } catch (err) {
        console.error('Failed to load towers:', err)
    } finally {
        loadingTowers.value = false
    }
}

const handleTowerChange = async (towerId: string) => {
    newScope.value.floor_id = undefined
    newScope.value.wing_id = undefined
    floorList.value = []
    wingList.value = []
    if (!towerId || !needsFloor.value) return

    loadingFloors.value = true
    try {
        floorList.value = await facilityService.getFloors(towerId)
    } catch (err) {
        console.error('Failed to load floors:', err)
    } finally {
        loadingFloors.value = false
    }
}

const handleFloorChange = async (floorId: string) => {
    newScope.value.wing_id = undefined
    wingList.value = []
    if (!floorId || !needsWing.value) return

    loadingWings.value = true
    try {
        wingList.value = await facilityService.getWings(floorId)
    } catch (err) {
        console.error('Failed to load wings:', err)
    } finally {
        loadingWings.value = false
    }
}

const handleAddScope = () => {
    if (!newScope.value.facility_id) {
        message.warning('Please select a facility')
        return
    }
    if (needsTower.value && !newScope.value.tower_id) {
        message.warning('Please select a tower')
        return
    }
    if (needsFloor.value && !newScope.value.floor_id) {
        message.warning('Please select a floor')
        return
    }
    if (needsWing.value && !newScope.value.wing_id) {
        message.warning('Please select a wing')
        return
    }

    const facilityObj = facilityList.value.find(f => f.id === newScope.value.facility_id)
    const towerObj = towerList.value.find(t => t.id === newScope.value.tower_id)
    const floorObj = floorList.value.find(fl => fl.id === newScope.value.floor_id)
    const wingObj = wingList.value.find(w => w.id === newScope.value.wing_id)

    if (newScope.value.facility_id && facilityObj?.name) {
        facilityNames.value[newScope.value.facility_id] = facilityObj.name
    }
    if (newScope.value.tower_id && towerObj?.name) {
        towerNames.value[newScope.value.tower_id] = towerObj.name
    }
    if (newScope.value.floor_id && floorObj?.name) {
        floorNames.value[newScope.value.floor_id] = floorObj.name
    }
    if (newScope.value.wing_id && wingObj?.name) {
        wingNames.value[newScope.value.wing_id] = wingObj.name
    }

    scopes.value.push({
        id: `temp-${Date.now()}`,
        scope_type: newScope.value.scope_type,
        facility_id: newScope.value.facility_id,
        facility_name: facilityObj?.name,
        tower_id: newScope.value.tower_id || null,
        tower_name: towerObj?.name,
        floor_id: newScope.value.floor_id || null,
        floor_name: floorObj?.name,
        wing_id: newScope.value.wing_id || null,
        wing_name: wingObj?.name,
    })

    // Reset picker
    newScope.value = { scope_type: newScope.value.scope_type, facility_id: newScope.value.facility_id }
}

const handleRemoveScope = (index: number) => {
    scopes.value.splice(index, 1)
}

const handleSave = async () => {
    saving.value = true
    try {
        const cleanPayload = scopes.value.map(s => ({
            scope_type: s.scope_type,
            facility_id: s.facility_id || (s as any).facility,
            tower_id: s.tower_id || (s as any).tower || null,
            floor_id: s.floor_id || (s as any).floor || null,
            wing_id: s.wing_id || (s as any).wing || null,
        }))
        await helpdeskService.setStaffLocationScopes(props.userId, cleanPayload as any)
        message.success('Location scopes updated successfully')
        emit('saved')
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to save location scopes')
    } finally {
        saving.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, async (isOpen) => {
    if (isOpen) {
        await loadFacilities()
        await loadScopes()
    }
}, { immediate: true })
</script>
