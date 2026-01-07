<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Location Settings</h2>
        </div>

        <!-- Sub-tabs -->
        <a-tabs v-model:activeKey="activeSubTab" type="card">
            <a-tab-pane key="state" tab="State">
                <div class="py-4">
                    <ConfigTable title="States" :columns="stateColumns" :data="states" :loading="loading"
                        @add="handleAddState" @edit="handleEditState" @delete="handleDeleteState" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="city" tab="City">
                <div class="py-4 space-y-4">
                    <!-- State Filter -->
                    <div class="flex items-center gap-4">
                        <span class="text-sm text-gray-600 dark:text-gray-400">Filter by State:</span>
                        <a-select v-model:value="selectedStateId" placeholder="Select State" style="width: 200px"
                            allow-clear :options="stateOptions" />
                    </div>
                    <ConfigTable title="Cities" :columns="cityColumns" :data="filteredCities" :loading="loading"
                        :parent-options="stateOptions" parent-label="State" @add="handleAddCity" @edit="handleEditCity"
                        @delete="handleDeleteCity" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="zone" tab="Zone">
                <div class="py-4 space-y-4">
                    <!-- City Filter -->
                    <div class="flex flex-wrap items-center gap-4">
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-600 dark:text-gray-400">State:</span>
                            <a-select v-model:value="selectedStateForZone" placeholder="Select State"
                                style="width: 180px" allow-clear :options="stateOptions"
                                @change="selectedCityId = undefined" />
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="text-sm text-gray-600 dark:text-gray-400">City:</span>
                            <a-select v-model:value="selectedCityId" placeholder="Select City" style="width: 180px"
                                allow-clear :disabled="!selectedStateForZone" :options="filteredCityOptions" />
                        </div>
                    </div>
                    <ConfigTable title="Zones" :columns="zoneColumns" :data="filteredZones" :loading="loading"
                        :parent-options="filteredCityOptions" parent-label="City" @add="handleAddZone"
                        @edit="handleEditZone" @delete="handleDeleteZone" />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'

const activeSubTab = ref('state')
const loading = ref(false)

// State data
const states = ref<any[]>([])
const selectedStateId = ref<number>()
const selectedStateForZone = ref<number>()

// City data
const cities = ref<any[]>([])
const selectedCityId = ref<number>()

// Zone data
const zones = ref<any[]>([])

// Columns
const stateColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Action', key: 'action', width: 150 }
]

const cityColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'State', dataIndex: 'state_name', key: 'state_name' },
    { title: 'Action', key: 'action', width: 150 }
]

const zoneColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'City', dataIndex: 'city_name', key: 'city_name' },
    { title: 'Action', key: 'action', width: 150 }
]

// Computed options
const stateOptions = computed(() =>
    states.value.map(s => ({ label: s.name, value: s.id }))
)

const filteredCities = computed(() => {
    if (!selectedStateId.value) return cities.value
    return cities.value.filter(c => c.state_id === selectedStateId.value)
})

const filteredCityOptions = computed(() => {
    const citiesToUse = selectedStateForZone.value
        ? cities.value.filter(c => c.state_id === selectedStateForZone.value)
        : cities.value
    return citiesToUse.map(c => ({ label: c.name, value: c.id }))
})

const filteredZones = computed(() => {
    if (!selectedCityId.value) return zones.value
    return zones.value.filter(z => z.city_id === selectedCityId.value)
})

// Mock data for now
onMounted(() => {
    // TODO: Replace with API calls
    states.value = [
        { id: 1, name: 'Maharashtra', code: 'MH' },
        { id: 2, name: 'Karnataka', code: 'KA' },
        { id: 3, name: 'Tamil Nadu', code: 'TN' }
    ]
    cities.value = [
        { id: 1, name: 'Mumbai', state_id: 1, state_name: 'Maharashtra' },
        { id: 2, name: 'Pune', state_id: 1, state_name: 'Maharashtra' },
        { id: 3, name: 'Bangalore', state_id: 2, state_name: 'Karnataka' }
    ]
    zones.value = [
        { id: 1, name: 'Andheri', city_id: 1, city_name: 'Mumbai' },
        { id: 2, name: 'Bandra', city_id: 1, city_name: 'Mumbai' },
        { id: 3, name: 'Whitefield', city_id: 3, city_name: 'Bangalore' }
    ]
})

// Handlers
const handleAddState = (data: any) => {
    message.success('State added successfully')
    states.value.push({ id: Date.now(), ...data })
}

const handleEditState = (record: any, data: any) => {
    message.success('State updated successfully')
    const index = states.value.findIndex(s => s.id === record.id)
    if (index > -1) states.value[index] = { ...record, ...data }
}

const handleDeleteState = (record: any) => {
    message.success('State deleted successfully')
    states.value = states.value.filter(s => s.id !== record.id)
}

const handleAddCity = (data: any) => {
    message.success('City added successfully')
    const state = states.value.find(s => s.id === data.parent_id)
    cities.value.push({
        id: Date.now(),
        name: data.name,
        state_id: data.parent_id,
        state_name: state?.name || ''
    })
}

const handleEditCity = (record: any, data: any) => {
    message.success('City updated successfully')
    const index = cities.value.findIndex(c => c.id === record.id)
    if (index > -1) {
        const state = states.value.find(s => s.id === data.parent_id)
        cities.value[index] = {
            ...record,
            name: data.name,
            state_id: data.parent_id,
            state_name: state?.name || ''
        }
    }
}

const handleDeleteCity = (record: any) => {
    message.success('City deleted successfully')
    cities.value = cities.value.filter(c => c.id !== record.id)
}

const handleAddZone = (data: any) => {
    message.success('Zone added successfully')
    const city = cities.value.find(c => c.id === data.parent_id)
    zones.value.push({
        id: Date.now(),
        name: data.name,
        city_id: data.parent_id,
        city_name: city?.name || ''
    })
}

const handleEditZone = (record: any, data: any) => {
    message.success('Zone updated successfully')
    const index = zones.value.findIndex(z => z.id === record.id)
    if (index > -1) {
        const city = cities.value.find(c => c.id === data.parent_id)
        zones.value[index] = {
            ...record,
            name: data.name,
            city_id: data.parent_id,
            city_name: city?.name || ''
        }
    }
}

const handleDeleteZone = (record: any) => {
    message.success('Zone deleted successfully')
    zones.value = zones.value.filter(z => z.id !== record.id)
}
</script>
