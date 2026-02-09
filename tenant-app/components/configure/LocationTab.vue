<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Zone Settings</h2>
            <a-button type="primary" @click="showAddModal = true">
                <template #icon><PlusOutlined /></template>
                Add Zone
            </a-button>
        </div>

        <!-- Filters - 2 column layout: label | dropdown -->
        <div class="space-y-4 max-w-xl">
            <div class="grid grid-cols-[1fr_3fr] gap-4 items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">Country</span>
                <a-select
                    v-model:value="filterCountry"
                    placeholder="Select Country"
                    allow-clear
                    show-search
                    option-filter-prop="label"
                    :loading="loadingCountries"
                    @change="handleFilterCountryChange"
                >
                    <a-select-option v-for="country in countries" :key="country.id" :value="country.id" :label="country.name">
                        {{ country.name }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="grid grid-cols-[1fr_3fr] gap-4 items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">State</span>
                <a-select
                    v-model:value="filterState"
                    placeholder="Select State"
                    allow-clear
                    show-search
                    option-filter-prop="label"
                    :disabled="!filterCountry"
                    :loading="loadingFilterStates"
                    @change="handleFilterStateChange"
                >
                    <a-select-option v-for="state in filterStates" :key="state.id" :value="state.id" :label="state.name">
                        {{ state.name }}
                    </a-select-option>
                </a-select>
            </div>
            <div class="grid grid-cols-[1fr_3fr] gap-4 items-center">
                <span class="text-sm font-medium text-gray-600 dark:text-gray-400">City</span>
                <a-select
                    v-model:value="filterCity"
                    placeholder="Select City"
                    allow-clear
                    show-search
                    option-filter-prop="label"
                    :disabled="!filterState"
                    :loading="loadingFilterCities"
                    @change="loadZones"
                >
                    <a-select-option v-for="city in filterCities" :key="city.id" :value="city.id" :label="city.name">
                        {{ city.name }}
                    </a-select-option>
                </a-select>
            </div>
        </div>

        <!-- Zones Table -->
        <a-table
            :columns="zoneColumns"
            :data-source="zones"
            :loading="loadingZones"
            :pagination="{ pageSize: 10 }"
            row-key="id"
        >
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'country'">
                    {{ record.country_details?.name || '-' }}
                </template>
                <template v-if="column.key === 'state'">
                    {{ record.state_details?.name || '-' }}
                </template>
                <template v-if="column.key === 'city'">
                    {{ record.city_details?.name || '-' }}
                </template>
            </template>
        </a-table>

        <!-- Add Zone Modal -->
        <a-modal
            v-model:open="showAddModal"
            title="Add Zone"
            :confirm-loading="saving"
            @ok="handleAddZone"
            @cancel="resetForm"
        >
            <a-form layout="vertical" class="mt-4">
                <a-form-item label="Zone Name" required>
                    <a-input v-model:value="formData.name" placeholder="Enter zone name" />
                </a-form-item>
                <a-form-item label="Country" required>
                    <a-select
                        v-model:value="formData.country"
                        placeholder="Select Country"
                        show-search
                        option-filter-prop="label"
                        :loading="loadingCountries"
                        @change="handleFormCountryChange"
                    >
                        <a-select-option v-for="country in countries" :key="country.id" :value="country.id" :label="country.name">
                            {{ country.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="State" required>
                    <a-select
                        v-model:value="formData.state"
                        placeholder="Select State"
                        show-search
                        option-filter-prop="label"
                        :disabled="!formData.country"
                        :loading="loadingFormStates"
                        @change="handleFormStateChange"
                    >
                        <a-select-option v-for="state in formStates" :key="state.id" :value="state.id" :label="state.name">
                            {{ state.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item label="City" required>
                    <a-select
                        v-model:value="formData.city"
                        placeholder="Select City"
                        show-search
                        option-filter-prop="label"
                        :disabled="!formData.state"
                        :loading="loadingFormCities"
                    >
                        <a-select-option v-for="city in formCities" :key="city.id" :value="city.id" :label="city.name">
                            {{ city.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>
            </a-form>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useLocationService, type Country, type State, type City, type Zone } from '../../composables/locationService'

const locationService = useLocationService()

// Countries (shared)
const countries = ref<Country[]>([])
const loadingCountries = ref(false)

// Filter dropdowns state
const filterCountry = ref<string>()
const filterState = ref<string>()
const filterCity = ref<string>()
const filterStates = ref<State[]>([])
const filterCities = ref<City[]>([])
const loadingFilterStates = ref(false)
const loadingFilterCities = ref(false)

// Form dropdowns state
const formStates = ref<State[]>([])
const formCities = ref<City[]>([])
const loadingFormStates = ref(false)
const loadingFormCities = ref(false)

// Zones
const zones = ref<Zone[]>([])
const loadingZones = ref(false)

// Modal
const showAddModal = ref(false)
const saving = ref(false)
const formData = ref({
    name: '',
    country: undefined as string | undefined,
    state: undefined as string | undefined,
    city: undefined as string | undefined
})

const zoneColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Country', key: 'country' },
    { title: 'State', key: 'state' },
    { title: 'City', key: 'city' }
]

// Load countries and zones on mount
onMounted(async () => {
    // Load countries
    loadingCountries.value = true
    try {
        countries.value = await locationService.getCountries()
    } catch (e) {
        message.error('Failed to load countries')
    } finally {
        loadingCountries.value = false
    }
    
    // Load all zones
    loadingZones.value = true
    try {
        zones.value = await locationService.getAllZones()
    } catch (e) {
        message.error('Failed to load zones')
    } finally {
        loadingZones.value = false
    }
})

// Filter handlers
const handleFilterCountryChange = async (countryId: string | undefined) => {
    filterState.value = undefined
    filterCity.value = undefined
    filterStates.value = []
    filterCities.value = []
    zones.value = []
    
    if (countryId) {
        loadingFilterStates.value = true
        try {
            filterStates.value = await locationService.getStatesByCountry(countryId)
        } catch (e) {
            message.error('Failed to load states')
        } finally {
            loadingFilterStates.value = false
        }
    }
}

const handleFilterStateChange = async (stateId: string | undefined) => {
    filterCity.value = undefined
    filterCities.value = []
    zones.value = []
    
    if (stateId) {
        loadingFilterCities.value = true
        try {
            filterCities.value = await locationService.getCitiesByState(stateId)
        } catch (e) {
            message.error('Failed to load cities')
        } finally {
            loadingFilterCities.value = false
        }
    }
}

const loadZones = async () => {
    if (!filterCity.value) {
        zones.value = []
        return
    }
    
    loadingZones.value = true
    try {
        zones.value = await locationService.getZonesByCity(filterCity.value)
    } catch (e) {
        message.error('Failed to load zones')
    } finally {
        loadingZones.value = false
    }
}

// Form handlers
const handleFormCountryChange = async (countryId: string | undefined) => {
    formData.value.state = undefined
    formData.value.city = undefined
    formStates.value = []
    formCities.value = []
    
    if (countryId) {
        loadingFormStates.value = true
        try {
            formStates.value = await locationService.getStatesByCountry(countryId)
        } catch (e) {
            message.error('Failed to load states')
        } finally {
            loadingFormStates.value = false
        }
    }
}

const handleFormStateChange = async (stateId: string | undefined) => {
    formData.value.city = undefined
    formCities.value = []
    
    if (stateId) {
        loadingFormCities.value = true
        try {
            formCities.value = await locationService.getCitiesByState(stateId)
        } catch (e) {
            message.error('Failed to load cities')
        } finally {
            loadingFormCities.value = false
        }
    }
}

const handleAddZone = async () => {
    if (!formData.value.name || !formData.value.country || !formData.value.state || !formData.value.city) {
        message.error('Please fill in all fields')
        return
    }
    
    saving.value = true
    try {
        await locationService.createZone({
            name: formData.value.name,
            country: formData.value.country,
            state: formData.value.state,
            city: formData.value.city
        })
        message.success('Zone created successfully')
        showAddModal.value = false
        resetForm()
        
        // Reload all zones
        zones.value = await locationService.getAllZones()
    } catch (e) {
        message.error('Failed to create zone')
    } finally {
        saving.value = false
    }
}

const resetForm = () => {
    formData.value = {
        name: '',
        country: undefined,
        state: undefined,
        city: undefined
    }
    formStates.value = []
    formCities.value = []
}
</script>
