<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="mb-6">
            <div class="flex items-center gap-2 mb-2 text-sm text-gray-500">
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo('/facilities')">Facilities</span>
                <span>/</span>
                <span class="cursor-pointer hover:text-blue-500" @click="navigateTo(`/facilities/${facilityId}`)">{{
                    facility?.name || 'Loading...' }}</span>
                <span>/</span>
                <span class="text-gray-900 dark:text-gray-200">Edit</span>
            </div>
            <div class="flex justify-between items-center">
                <h1 class="text-2xl font-bold dark:text-white">Edit Facility</h1>
            </div>
        </div>
        <div class="flex justify-center">
        <!-- Loading State -->
        <AppLoader v-if="loading" message="Loading Facility..." />

        <div v-else-if="!facility" class="text-center py-12">
            <p class="text-red-500">Facility not found</p>
            <a-button class="mt-4" @click="navigateTo('/facilities')">Back to Facilities</a-button>
        </div>

        <!-- Edit Form -->
     
        <a-card v-else class="max-w-4xl lg:w-full">
            <a-form layout="vertical">
                <!-- Basic Info Section -->
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 dark:text-white">Basic Information</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <a-form-item label="Facility Name" required>
                            <a-input v-model:value="formData.name" placeholder="Enter facility name" />
                        </a-form-item>
                        <a-form-item label="Address" required>
                            <a-textarea v-model:value="formData.address" placeholder="Street address" :rows="3" />
                        </a-form-item>
                        <a-form-item label="Postal Code">
                            <a-input v-model:value="formData.postal_code" placeholder="Postal/ZIP code" />
                        </a-form-item>
                    </div>
                </div>

                <!-- Location Section with Cascading Dropdowns -->
                <div class="mb-8">
                    <h2 class="text-lg font-semibold mb-4 dark:text-white">Location Details</h2>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <!-- Country Dropdown -->
                        <a-form-item label="Country" required>
                            <a-select
                                v-model:value="formData.country"
                                placeholder="Select Country"
                                :loading="loadingCountries"
                                show-search
                            option-filter-prop="label"
                            @change="handleCountryChange"
                            >
                                <a-select-option v-for="country in countries" :key="country.id" :value="country.id" :label="country.name">
                                    {{ country.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <!-- State Dropdown -->
                        <a-form-item label="State" required>
                            <a-select
                                v-model:value="formData.state"
                                placeholder="Select State"
                                :loading="loadingStates"
                                :disabled="!formData.country"
                                show-search
                            option-filter-prop="label"
                            @change="handleStateChange"
                            >
                                <a-select-option v-for="state in states" :key="state.id" :value="state.id" :label="state.name">
                                    {{ state.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <!-- City Dropdown -->
                        <a-form-item label="City" required>
                            <a-select
                                v-model:value="formData.city"
                                placeholder="Select City"
                                :loading="loadingCities"
                                :disabled="!formData.state"
                                show-search
                            option-filter-prop="label"
                            @change="handleCityChange"
                            >
                                <a-select-option v-for="city in cities" :key="city.id" :value="city.id" :label="city.name">
                                    {{ city.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>

                        <!-- Zone Dropdown -->
                        <a-form-item label="Zone" required>
                            <a-select
                                v-model:value="formData.zone"
                                placeholder="Select Zone"
                                :loading="loadingZones"
                                :disabled="!formData.city"
                                show-search
                                option-filter-prop="label"
                            >
                                <a-select-option v-for="zone in zones" :key="zone.id" :value="zone.id" :label="zone.name">
                                    {{ zone.name }}
                                </a-select-option>
                            </a-select>
                        </a-form-item>
                    </div>
                </div>

                <!-- Structure Section -->
                <div class="mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold dark:text-white">Structure (Towers)</h2>
                        <a-button type="link" @click="navigateTo(`/facilities/${facilityId}`)">
                            Manage Towers →
                        </a-button>
                    </div>

                    <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <div class="grid grid-cols-2 gap-4 text-center">
                            <div>
                                <div class="text-2xl font-bold dark:text-white">{{ facility.tower_count || 0 }}</div>
                                <div class="text-xs text-gray-500">Towers</div>
                            </div>
                            <div>
                                <div class="text-2xl font-bold dark:text-white">{{ formData.has_towers ? 'Yes' : 'No' }}</div>
                                <div class="text-xs text-gray-500">Multi-Building</div>
                            </div>
                        </div>
                    </div>

                    <div class="mt-4 flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <a-switch v-model:checked="formData.has_towers" />
                        <div>
                            <div class="font-medium">Multi-Building Complex</div>
                            <div class="text-sm text-gray-500">Enable if this facility has multiple towers.</div>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-6 mt-4">
                    <a-button @click="navigateTo(`/facilities/${facilityId}`)">Cancel</a-button>
                    <a-button type="primary" :loading="saving" @click="handleSave">
                        Save Changes
                    </a-button>
                </div>
            </a-form>
        </a-card>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useFacilityService, type Facility } from '../../../../composables/facilityService';
import { useLocationService, type Country, type State, type City, type Zone } from '../../../../composables/locationService';
import AppLoader from '../../../../components/AppLoader.vue';
import { message } from 'ant-design-vue';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const facilityId = route.params.id as string;
const facilityService = useFacilityService();
const locationService = useLocationService();

const loading = ref(true);
const saving = ref(false);
const facility = ref<Facility | null>(null);

// Location data
const countries = ref<Country[]>([]);
const states = ref<State[]>([]);
const cities = ref<City[]>([]);
const zones = ref<Zone[]>([]);

// Loading states
const loadingCountries = ref(false);
const loadingStates = ref(false);
const loadingCities = ref(false);
const loadingZones = ref(false);

const formData = reactive({
    name: '',
    address: '',
    postal_code: '',
    country: '' as string,
    state: '' as string,
    city: '' as string,
    zone: '' as string,
    has_towers: false
});

// Filter option for searchable selects
const filterOption = (input: string, option: any) => {
    return option.children?.[0]?.children?.toLowerCase().includes(input.toLowerCase());
};

const loadCountries = async () => {
    loadingCountries.value = true;
    try {
        countries.value = await locationService.getCountries();
    } catch (e) {
        console.error('Failed to load countries', e);
    } finally {
        loadingCountries.value = false;
    }
};

const loadStatesForCountry = async (countryId: string) => {
    loadingStates.value = true;
    try {
        states.value = await locationService.getStatesByCountry(countryId);
    } catch (e) {
        console.error('Failed to load states', e);
    } finally {
        loadingStates.value = false;
    }
};

const loadCitiesForState = async (stateId: string) => {
    loadingCities.value = true;
    try {
        cities.value = await locationService.getCitiesByState(stateId);
    } catch (e) {
        console.error('Failed to load cities', e);
    } finally {
        loadingCities.value = false;
    }
};

const loadZonesForCity = async (cityId: string) => {
    loadingZones.value = true;
    try {
        zones.value = await locationService.getZonesByCity(cityId);
    } catch (e) {
        console.error('Failed to load zones', e);
    } finally {
        loadingZones.value = false;
    }
};

// Handle country change - load states and reset dependent fields
const handleCountryChange = async (countryId: string) => {
    formData.state = '';
    formData.city = '';
    formData.zone = '';
    states.value = [];
    cities.value = [];
    zones.value = [];

    if (countryId) {
        await loadStatesForCountry(countryId);
    }
};

// Handle state change - load cities and reset dependent fields
const handleStateChange = async (stateId: string) => {
    formData.city = '';
    formData.zone = '';
    cities.value = [];
    zones.value = [];

    if (stateId) {
        await loadCitiesForState(stateId);
    }
};

// Handle city change - load zones
const handleCityChange = async (cityId: string) => {
    formData.zone = '';
    zones.value = [];

    if (cityId) {
        await loadZonesForCity(cityId);
    }
};

const fetchFacility = async () => {
    loading.value = true;
    try {
        const data = await facilityService.getFacilityById(facilityId);
        facility.value = data;

        // Populate form with facility data
        formData.name = data.name;
        formData.address = data.address;
        formData.postal_code = data.postal_code || '';
        formData.country = data.country;
        formData.state = data.state;
        formData.city = data.city;
        formData.zone = data.zone;
        formData.has_towers = data.has_towers;

        // Load countries first
        await loadCountries();

        // Load cascading data based on existing values
        if (data.country) {
            await loadStatesForCountry(data.country);
        }
        if (data.state) {
            await loadCitiesForState(data.state);
        }
        if (data.city) {
            await loadZonesForCity(data.city);
        }
    } catch (e) {
        console.error('Failed to load facility', e);
        message.error('Failed to load facility');
    } finally {
        loading.value = false;
    }
};

// Save
const handleSave = async () => {
    if (!formData.name) {
        message.error('Please enter a facility name');
        return;
    }
    if (!formData.address) {
        message.error('Please enter an address');
        return;
    }
    if (!formData.country || !formData.state || !formData.city || !formData.zone) {
        message.error('Please select all location fields');
        return;
    }

    saving.value = true;
    try {
        await facilityService.updateFacility(facilityId, {
            name: formData.name,
            address: formData.address,
            postal_code: formData.postal_code || undefined,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zone: formData.zone,
            has_towers: formData.has_towers
        });

        message.success('Facility updated successfully');
        navigateTo(`/facilities/${facilityId}`);
    } catch (e) {
        console.error('Failed to update facility', e);
        message.error('Failed to update facility');
    } finally {
        saving.value = false;
    }
};

onMounted(() => {
    fetchFacility();
});
</script>
