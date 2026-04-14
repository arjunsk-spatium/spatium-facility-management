<template>
    <div class="space-y-6">
        <div class="mb-6 flex items-center justify-between">
            <h1 class="text-2xl font-bold dark:text-white">Create Facility</h1>
            <a-button @click="navigateTo('/facilities')">Cancel</a-button>
        </div>
        <div class="flex justify-center">
        <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
            <a-steps :current="currentStep" class="mb-8">
                <a-step title="Basic Info" description="Name & Address" />
                <a-step title="Location" description="Country, State, City" />
                <a-step title="Review" description="Confirm Details" />
            </a-steps>

            <!-- Step 1: Basic Information -->
            <div v-show="currentStep === 0" class="max-w-3xl mx-auto space-y-8 py-8">
                <a-form layout="vertical" :model="formData">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Left Column (Name & Postal Code) -->
                        <div class="space-y-6">
                            <a-form-item label="Facility Name" required>
                                <a-input v-model:value="formData.name" placeholder="e.g. Headquarters" size="large" />
                            </a-form-item>
                            <a-form-item label="Postal Code">
                                <a-input v-model:value="formData.postal_code" placeholder="Postal/ZIP Code" size="large" />
                            </a-form-item>
                        </div>

                        <!-- Right Column (Address & Image) -->
                        <div class="space-y-6">
                            <a-form-item label="Address" required>
                                <a-textarea v-model:value="formData.address" placeholder="Street Address" :rows="3" />
                            </a-form-item>
                            <a-form-item label="Facility Image">
                                <a-upload
                                    :before-upload="handleBeforeUpload"
                                    :show-upload-list="false"
                                    accept=".jpg,.jpeg,.png,.webp,.svg,image/*"
                                >
                                    <a-button>
                                        <template #icon><UploadOutlined /></template>
                                        Select Image
                                    </a-button>
                                </a-upload>
                                <div v-if="imagePreview" class="mt-2">
                                    <img :src="imagePreview" alt="Preview" class="max-w-48 max-h-32 rounded border object-cover" />
                                    <a-button type="link" danger size="small" @click="removeImage">Remove</a-button>
                                </div>
                                <div v-if="formData.image_url && !imagePreview" class="mt-1 text-sm text-gray-500">
                                    {{ formData.image_url.name }}
                                </div>
                            </a-form-item>
                        </div>
                    </div>

                    <div class="pt-4 border-t dark:border-gray-700 mt-6">
                        <div class="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <a-switch v-model:checked="formData.has_towers" />
                            <div>
                                <div class="font-medium">Multi-Building Complex</div>
                                <div class="text-sm text-gray-500">Enable if this facility has multiple towers/buildings.</div>
                            </div>
                        </div>
                    </div>
                </a-form>
            </div>

            <!-- Step 2: Location Details with Cascading Dropdowns -->
            <div v-show="currentStep === 1" class="max-w-3xl mx-auto space-y-8 py-8">
                <a-form layout="vertical" :model="formData">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <!-- Country Dropdown -->
                        <a-form-item label="Country" required>
                            <a-select
                                v-model:value="formData.country"
                                placeholder="Select Country"
                                size="large"
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
                                size="large"
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
                                size="large"
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
                                size="large"
                                :loading="loadingZones"
                                :disabled="!formData.city"
                                show-search
                                option-filter-prop="label"
                            >
                                <a-select-option v-for="zone in zones" :key="zone.id" :value="zone.id" :label="zone.name">
                                    {{ zone.name }}
                                </a-select-option>
                            </a-select>
                            <span v-if="formData.city && zones.length === 0 && !loadingZones" class="text-xs text-orange-500">
                                No zones found for selected city
                            </span>
                        </a-form-item>
                    </div>
                </a-form>
            </div>

            <!-- Step 3: Review -->
            <div v-show="currentStep === 2" class="max-w-4xl mx-auto py-8">
                <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
                    <h3 class="font-medium mb-4 text-lg">Summary</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div><span class="text-gray-500">Name:</span> {{ formData.name || 'Not set' }}</div>
                        <div><span class="text-gray-500">Address:</span> {{ formData.address || 'Not set' }}</div>
                        <div><span class="text-gray-500">Postal Code:</span> {{ formData.postal_code || 'N/A' }}</div>
                        <div><span class="text-gray-500">Multi-Building:</span> {{ formData.has_towers ? 'Yes' : 'No' }}</div>
                        <div><span class="text-gray-500">Country:</span> {{ selectedCountryName }}</div>
                        <div><span class="text-gray-500">State:</span> {{ selectedStateName }}</div>
                        <div><span class="text-gray-500">City:</span> {{ selectedCityName }}</div>
                        <div><span class="text-gray-500">Zone:</span> {{ selectedZoneName }}</div>
                    </div>
                </div>
                
                <div class="mt-6 text-center text-gray-500">
                    <p>Towers can be added after the facility is created from the facility detail page.</p>
                </div>
            </div>

            <!-- Actions -->
            <div class="mt-8 flex justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                <a-button v-if="currentStep > 0" @click="currentStep--">Previous</a-button>
                <div v-else></div>

                <a-button v-if="currentStep < 2" type="primary" @click="handleNextStep">Next</a-button>
                <a-button v-else type="primary" :loading="submitting" @click="handleSubmit">Create Facility</a-button>
            </div>
        </a-card>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import { useFacilityStore } from '../../../stores/facility';
import { useAuthStore } from '../../../stores/auth';
import { useLocationService, type Country, type State, type City, type Zone } from '../../../composables/locationService';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';

definePageMeta({
    middleware: 'auth'
});

const facilityStore = useFacilityStore();
const authStore = useAuthStore();
const locationService = useLocationService();

const canCreate = computed(() => authStore.hasPermission('facilities-list:create'))

if (!canCreate.value) {
    navigateTo('/facilities');
}

const currentStep = ref(0);
const submitting = ref(false);

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
    country: '' as string,
    state: '' as string,
    city: '' as string,
    zone: '' as string,
    has_towers: false,
    postal_code: '',
    image_url: undefined as File | undefined
});

// Image upload handling
const imagePreview = ref<string | null>(null);

const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
        message.error('You can only upload image files!');
        return false;
    }
    
    formData.image_url = file;
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
};

const removeImage = () => {
    formData.image_url = undefined;
    imagePreview.value = null;
};

// Computed names for display in review step
const selectedCountryName = computed(() => {
    const country = countries.value.find(c => c.id === formData.country);
    return country?.name || 'Not selected';
});

const selectedStateName = computed(() => {
    const state = states.value.find(s => s.id === formData.state);
    return state?.name || 'Not selected';
});

const selectedCityName = computed(() => {
    const city = cities.value.find(c => c.id === formData.city);
    return city?.name || 'Not selected';
});

const selectedZoneName = computed(() => {
    const zone = zones.value.find(z => z.id === formData.zone);
    return zone?.name || 'Not selected';
});

// Filter option for searchable selects
const filterOption = (input: string, option: any) => {
    return option.children?.[0]?.children?.toLowerCase().includes(input.toLowerCase());
};

// Load countries on mount
const loadCountries = async () => {
    loadingCountries.value = true;
    try {
        countries.value = await locationService.getCountries();
    } catch (e) {
        console.error('Failed to load countries', e);
        message.error('Failed to load countries');
    } finally {
        loadingCountries.value = false;
    }
};

// Handle country change - load states
const handleCountryChange = async (countryId: string) => {
    // Reset dependent fields
    formData.state = '';
    formData.city = '';
    formData.zone = '';
    states.value = [];
    cities.value = [];
    zones.value = [];

    if (!countryId) return;

    loadingStates.value = true;
    try {
        states.value = await locationService.getStatesByCountry(countryId);
    } catch (e) {
        console.error('Failed to load states', e);
        message.error('Failed to load states');
    } finally {
        loadingStates.value = false;
    }
};

// Handle state change - load cities
const handleStateChange = async (stateId: string) => {
    // Reset dependent fields
    formData.city = '';
    formData.zone = '';
    cities.value = [];
    zones.value = [];

    if (!stateId) return;

    loadingCities.value = true;
    try {
        cities.value = await locationService.getCitiesByState(stateId);
    } catch (e) {
        console.error('Failed to load cities', e);
        message.error('Failed to load cities');
    } finally {
        loadingCities.value = false;
    }
};

// Handle city change - load zones
const handleCityChange = async (cityId: string) => {
    // Reset dependent field
    formData.zone = '';
    zones.value = [];

    if (!cityId) return;

    loadingZones.value = true;
    try {
        zones.value = await locationService.getZonesByCity(cityId);
    } catch (e) {
        console.error('Failed to load zones', e);
        message.error('Failed to load zones');
    } finally {
        loadingZones.value = false;
    }
};

const handleNextStep = () => {
    if (currentStep.value === 0) {
        // Validate step 1
        if (!formData.name) {
            message.error('Please enter a facility name');
            return;
        }
        if (!formData.address) {
            message.error('Please enter an address');
            return;
        }
    } else if (currentStep.value === 1) {
        // Validate step 2
        if (!formData.country) {
            message.error('Please select a country');
            return;
        }
        if (!formData.state) {
            message.error('Please select a state');
            return;
        }
        if (!formData.city) {
            message.error('Please select a city');
            return;
        }
        if (!formData.zone) {
            message.error('Please select a zone');
            return;
        }
    }
    currentStep.value++;
};

const handleSubmit = async () => {
    submitting.value = true;
    try {
        await facilityStore.createFacility({
            name: formData.name,
            address: formData.address,
            country: formData.country,
            state: formData.state,
            city: formData.city,
            zone: formData.zone,
            has_towers: formData.has_towers,
            postal_code: formData.postal_code || undefined
        });
        message.success('Facility created successfully');
        navigateTo('/facilities');
    } catch (e: any) {
        console.error('Failed to create facility', e);
        message.error(e.message || 'Failed to create facility');
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    loadCountries();
});
</script>
