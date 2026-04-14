<template>
    <div class="grid grid-cols-12 gap-6 min-h-screen">
        <!-- Left Sidebar: Stepper -->
        <div class="col-span-12 md:col-span-3 lg:col-span-3">
            <div class="sticky top-6">
                <h1 class="text-xl font-bold text-gray-900 dark:text-gray-100 mb-8 px-2">Create New Tenant</h1>
                <a-steps :current="currentStep" direction="vertical" size="small">
                    <a-step title="Basic Info" description="Details" />
                    <a-step title="Subscription" description="Plan" />
                    <a-step title="Configuration" description="Modules" />
                    <a-step title="Branding" description="Identity" />
                    <a-step title="Organization" description="PII/Contact" />
                    <a-step title="Review" description="Confirm" />
                </a-steps>
            </div>
        </div>

        <!-- Right Content: Forms -->
        <div class="col-span-12 md:col-span-9 lg:col-span-9">
            <div class="max-w-4xl pt-2">
                <!-- Step 1: Basic Info -->
                <div v-if="currentStep === 0">
                    <h3 class="text-lg font-medium mb-6 px-1">Tenant Basics</h3>
                    <a-card>
                        <a-form :model="tenantForm" layout="vertical" @finish="handleStep1">
                            <a-form-item label="Tenant Name" name="name"
                                :rules="[{ required: true, message: 'Please input tenant name!' }]">
                                <a-input v-model:value="tenantForm.name" placeholder="Acme Corp" />
                            </a-form-item>

                            <a-form-item label="Domain" name="domain"
                                :rules="[{ required: true, message: 'Please input domain!' }]">
                                <a-input v-model:value="tenantForm.domain" placeholder="acme"
                                    addon-after=".nexspace.app" />
                            </a-form-item>

                            <div class="flex justify-end mt-8">
                                <a-button type="primary" html-type="submit" :loading="loading">Next:
                                    Subscription</a-button>
                            </div>
                        </a-form>
                    </a-card>
                </div>

                <!-- Step 2: Subscription -->
                <div v-if="currentStep === 1">
                    <h3 class="text-lg font-medium mb-6">Select a Plan</h3>

                    <a-card>
                        <div v-if="registryPending" class="flex justify-center p-12">
                            <a-spin />
                        </div>

                        <template v-else>
                            <a-radio-group v-model:value="subscriptionForm.plan" class="w-full mb-8">
                                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div v-for="plan in plans" :key="plan.id"
                                        class="border rounded-xl p-5 cursor-pointer hover:border-primary-500 hover:shadow-md transition-all relative overflow-hidden bg-white dark:bg-gray-800"
                                        :class="{ 'border-primary-500 ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-900/10': subscriptionForm.plan === plan.id, 'border-gray-200 dark:border-gray-700': subscriptionForm.plan !== plan.id }"
                                        @click="subscriptionForm.plan = plan.id">
                                        <div class="flex justify-between items-start mb-3">
                                            <h4 class="font-bold text-gray-900 dark:text-white">{{ plan.name }}</h4>
                                            <a-radio :value="plan.id" class="absolute top-4 right-4" />
                                        </div>
                                        <p class="text-sm text-gray-500 mb-4 line-clamp-2">{{ plan.description }}</p>
                                        <div class="flex flex-col">
                                            <span class="text-2xl font-bold text-primary-600">
                                                {{ Number(plan.price) === 0 ? 'Free' : `₹${plan.price}` }}
                                                <span class="text-sm font-normal text-gray-400">/mo</span>
                                            </span>
                                        </div>
                                        <a-tag v-if="plan.is_custom" color="orange" class="mt-3">Custom</a-tag>
                                    </div>
                                </div>
                            </a-radio-group>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 rounded-lg">
                                <a-form-item label="Billing Cycle" required>
                                    <a-select v-model:value="subscriptionForm.billing_cycle" class="w-full">
                                        <a-select-option value="monthly">Monthly</a-select-option>
                                        <a-select-option value="yearly">Yearly</a-select-option>
                                    </a-select>
                                </a-form-item>

                                <a-form-item v-if="isCustomPlan" label="Max Users" required>
                                    <a-input-number v-model:value="subscriptionForm.max_users" class="w-full"
                                        :min="1" />
                                </a-form-item>
 
                                 <a-form-item v-if="isCustomPlan" label="Max Client Users" required>
                                     <a-input-number v-model:value="subscriptionForm.max_client_users" class="w-full"
                                         :min="0" />
                                 </a-form-item>

                                <a-form-item v-if="isCustomPlan" label="Price" required>
                                    <a-input-number v-model:value="subscriptionForm.price" class="w-full" :min="0"
                                        :formatter="(value: any) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                                        :parser="(value: string) => value.replace(/₹\s?|(,*)/g, '')" />
                                </a-form-item>

                                <a-form-item label="Subscription Start" required>
                                    <a-date-picker v-model:value="subscriptionForm.start_date" class="w-full"
                                        value-format="YYYY-MM-DD" placeholder="Select Start Date" />
                                </a-form-item>
                                <a-form-item label="Subscription End" required>
                                    <a-date-picker v-model:value="subscriptionForm.end_date" class="w-full"
                                        value-format="YYYY-MM-DD" placeholder="Select End Date" />
                                </a-form-item>
                            </div>

                            <div class="flex justify-between pt-4 border-t dark:border-gray-700">
                                <a-button @click="currentStep--">Back</a-button>
                                <a-button type="primary" @click="handleStep2"
                                    :disabled="!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date">
                                    Next: Configuration
                                </a-button>
                            </div>
                        </template>
                    </a-card>
                </div>

                <!-- Step 3: Configuration (Modules) -->
                <div v-if="currentStep === 2">
                    <h3 class="text-lg font-medium mb-2">Select Modules</h3>
                    <p class="text-gray-500 mb-6">Choose additional modules to enable for this tenant.</p>

                    <a-card>
                        <div v-if="registryPending" class="flex justify-center p-12">
                            <a-spin size="large" />
                        </div>

                        <template v-else>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div v-for="mod in modules" :key="mod.id"
                                    class="p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-start space-x-3 bg-white dark:bg-gray-800"
                                    :class="subscriptionForm.selectedModules.includes(mod.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'">
                                    <a-checkbox :checked="subscriptionForm.selectedModules.includes(mod.id)" @change="(e: any) => {
                                        if (e.target.checked) subscriptionForm.selectedModules.push(mod.id);
                                        else subscriptionForm.selectedModules = subscriptionForm.selectedModules.filter(id => id !== mod.id);
                                    }" class="mt-1" />
                                    <div>
                                        <span class="font-medium block text-gray-900 dark:text-gray-100">{{ mod.name
                                            }}</span>
                                        <span class="text-sm text-gray-500 mt-1 block">{{ mod.description }}</span>
                                    </div>
                                </div>
                            </div>

                            <div class="flex justify-between pt-4 border-t dark:border-gray-700">
                                <a-button @click="currentStep--">Back</a-button>
                                <a-button type="primary" @click="handleStep3" :loading="loading">
                                    Next: Branding
                                </a-button>
                            </div>
                        </template>
                    </a-card>
                </div>

                <!-- Step 4: Branding -->
                <div v-if="currentStep === 3">
                    <h3 class="text-lg font-medium mb-6">Branding Configuration</h3>
                    <a-card>
                        <a-form layout="vertical">
                            <div class="grid grid-cols-1 gap-8">
                                <ColorPicker label="Brand Color" v-model="brandingForm.primary_color" />

                                <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <!-- Light Logo -->
                                    <a-form-item label="Light background logo" class="mb-0">
                                        <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                            @click="$refs.lightLogoInput.click()">

                                            <input type="file" ref="lightLogoInput" style="display: none"
                                                accept=".jpg,.jpeg,.png,.svg" @change="(e: any) => handleFileSelect(e, 'logo')" />

                                            <img v-if="brandingForm.logoPreview" :src="brandingForm.logoPreview"
                                                class="h-32 w-auto object-contain mb-4 transition-transform group-hover:scale-105" />
                                            <div v-else
                                                class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                                <FileImageOutlined class="text-5xl" />
                                            </div>

                                            <div class="text-center">
                                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {{ brandingForm.logo?.name || 'Choose Light Logo' }}
                                                </p>
                                                <p class="text-xs text-gray-400" v-if="!brandingForm.logo">JPG, PNG, or
                                                    SVG (Max 300KB)
                                                </p>
                                            </div>

                                            <div
                                                class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                                <div
                                                    class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <CloudUploadOutlined /> Change Image
                                                </div>
                                            </div>
                                        </div>
                                    </a-form-item>

                                    <!-- Dark Logo -->
                                    <a-form-item label="Dark background logo" class="mb-0">
                                        <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                            @click="$refs.darkLogoInput.click()">

                                            <input type="file" ref="darkLogoInput" style="display: none"
                                                accept=".jpg,.jpeg,.png,.svg"
                                                @change="(e: any) => handleFileSelect(e, 'dark_logo')" />

                                            <img v-if="brandingForm.darkLogoPreview" :src="brandingForm.darkLogoPreview"
                                                class="h-32 w-auto object-contain mb-4 transition-transform group-hover:scale-105" />
                                            <div v-else
                                                class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                                <FileImageOutlined class="text-5xl" />
                                            </div>

                                            <div class="text-center">
                                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {{ brandingForm.dark_logo?.name || 'Choose Dark Logo' }}
                                                </p>
                                                <p class="text-xs text-gray-400" v-if="!brandingForm.dark_logo">JPG,
                                                    PNG, or
                                                    SVG (Max 300KB)</p>
                                            </div>

                                            <div
                                                class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                                <div
                                                    class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <CloudUploadOutlined /> Change Image
                                                </div>
                                            </div>
                                        </div>
                                    </a-form-item>

                                    <!-- Favicon -->
                                    <a-form-item label="Favicon" class="mb-0">
                                        <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                            @click="$refs.faviconInput.click()">

                                            <input type="file" ref="faviconInput" style="display: none" accept=".jpg,.jpeg,.png,.svg,.ico"
                                                @change="(e: any) => handleFileSelect(e, 'favicon')" />

                                            <img v-if="brandingForm.faviconPreview" :src="brandingForm.faviconPreview"
                                                class="h-16 w-16 object-contain mb-4 transition-transform group-hover:scale-105" />
                                            <div v-else
                                                class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                                <InfoCircleOutlined class="text-5xl" />
                                            </div>

                                            <div class="text-center">
                                                <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {{ brandingForm.favicon?.name || 'Choose Favicon' }}
                                                </p>
                                                <p class="text-xs text-gray-400" v-if="!brandingForm.favicon">ICO or PNG (Max 300KB)
                                                </p>
                                            </div>

                                            <div
                                                class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                                <div
                                                    class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                    <CloudUploadOutlined /> Change Image
                                                </div>
                                            </div>
                                        </div>
                                    </a-form-item>
                                </div>
                            </div>
                        </a-form>

                        <div class="flex justify-between pt-4 mt-6 border-t dark:border-gray-700">
                            <div class="flex items-center">
                                <a-button @click="currentStep--">Back</a-button>
                                <a-button @click="showBrandingPreview = true" class="ml-4">
                                    <EyeOutlined /> Preview Branding
                                </a-button>
                            </div>
                            <a-button type="primary" @click="handleStep4" :loading="loading">
                                Next: Organization
                            </a-button>
                        </div>
                    </a-card>
                </div>

                <!-- Step 5: Organization (PII) -->
                <div v-if="currentStep === 4">
                    <h3 class="text-lg font-medium mb-6">Organization Details</h3>
                    <a-card>
                        <a-form layout="vertical">
                            <a-form-item label="GSTIN / Tax ID" required>
                                <a-input v-model:value="piiForm.gstin" placeholder="e.g. 27AAAAA0000A1Z5" />
                            </a-form-item>
                            <a-form-item label="Full Address" required>
                                <a-textarea v-model:value="piiForm.address" placeholder="Registered office address..."
                                    :rows="4" />
                            </a-form-item>

                            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <a-form-item label="Contact Person Name" required>
                                    <a-input v-model:value="piiForm.contact_name" />
                                </a-form-item>
                                <a-form-item label="Contact Email" required>
                                    <a-input v-model:value="piiForm.email" type="email"
                                        @change="(e: any) => piiForm.email = e.target.value.toLowerCase()" />
                                </a-form-item>
                                <a-form-item label="Contact Phone" required>
                                    <a-input v-model:value="piiForm.phone" />
                                </a-form-item>
                            </div>
                        </a-form>

                        <div class="flex justify-between pt-4 mt-6 border-t dark:border-gray-700">
                            <a-button @click="currentStep--">Back</a-button>
                            <a-button type="primary" @click="handleStep5" :loading="loading">
                                Next: Review
                            </a-button>
                        </div>
                    </a-card>
                </div>

                <!-- Step 6: Review -->
                <div v-if="currentStep === 5">
                    <a-card>
                        <div class="text-center py-10">
                            <a-result status="success" title="Tenant configured successfully!"
                                :sub-title="`Tenant '${tenantForm.name}' is now active.`">
                                <template #extra>
                                    <a-button type="primary" @click="finishSetup">Go to Tenant List</a-button>
                                </template>
                            </a-result>
                        </div>
                    </a-card>
                </div>
            </div>
        </div>
    </div>

    <BrandingPreviewModal v-model:visible="showBrandingPreview" :primary-color="brandingForm.primary_color"
        :logo="brandingForm.logoPreview || brandingForm.logo"
        :dark-logo="brandingForm.darkLogoPreview || brandingForm.dark_logo" />
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, CloudUploadOutlined, FileImageOutlined, InfoCircleOutlined, EyeOutlined } from '@ant-design/icons-vue';
import BrandingPreviewModal from '../../components/tenants/BrandingPreviewModal.vue';
import { useModuleRegistry, type RegistryModule } from '../../composables/useModuleRegistry';
import { usePlanService, type Plan } from '../../composables/planService';

const currentStep = ref(0);
const loading = ref(false);
const showBrandingPreview = ref(false);
const tenantId = ref<string | null>(null);

const { createTenant, updateTenant, assignPlan, assignModules, getTenantModules, updateBranding, updatePii } = useTenantService();
const { getRegistry, getActiveRegistry } = useModuleRegistry();
const { getPlans } = usePlanService();

// Step 1 Data
const tenantForm = reactive({
    name: '',
    domain: ''
});

// Registry & Plans Data
const plans = ref<Plan[]>([]);
const modules = ref<RegistryModule[]>([]);
const registryPending = ref(false);
const plansPending = ref(false);

const fetchData = async () => {
    registryPending.value = true;
    plansPending.value = true;

    // Fetch Plans
    try {
        const plansResponse: any = await getPlans();
        if (plansResponse && plansResponse.success) {
            // Support both flat list and paginated results
            plans.value = plansResponse.data?.results || plansResponse.data || [];
        }
    } catch (e) {
        console.error('Failed to fetch plans', e);
    } finally {
        plansPending.value = false;
    }

    // Fetch Modules
    try {
        const modulesResponse = await getActiveRegistry();
        if (modulesResponse && modulesResponse.success && modulesResponse.data) {
            // Check if data is array (ActiveRegistryResponse) or object with results (RegistryResponse)
            modules.value = Array.isArray(modulesResponse.data) 
                ? modulesResponse.data 
                : (modulesResponse.data.results || []);
            // Default select all modules
            subscriptionForm.selectedModules = modules.value.map(m => m.id);
        }
    } catch (e) {
        console.error('Failed to fetch modules', e);
    } finally {
        registryPending.value = false;
    }
};

fetchData();

// Step 2 & 3 Data
const subscriptionForm = reactive({
    plan: '',
    start_date: '',
    end_date: '',
    billing_cycle: 'monthly',
    max_users: 100,
    max_client_users: 100,
    price: 0,
    selectedModules: [] as string[]
});

// Branding Data
// Branding Data
const brandingForm = reactive({
    primary_color: '#ffffff',
    logo: null as File | null,
    dark_logo: null as File | null,
    favicon: null as File | null,
    logoPreview: '',
    darkLogoPreview: '',
    faviconPreview: ''
});

// PII Data
const piiForm = reactive({
    gstin: '',
    address: '',
    contact_name: '',
    email: '',
    phone: ''
});

const isCustomPlan = computed(() => {
    const p = plans.value.find(plan => plan.id === subscriptionForm.plan);
    return p?.is_custom || false;
});

// Watch for plan changes to set defaults
import { watch } from 'vue';
watch(() => subscriptionForm.plan, (newPlanId) => {
    const p = plans.value.find(plan => plan.id === newPlanId);
    if (p) {
        subscriptionForm.billing_cycle = p.billing_cycle || 'monthly';
        // Only override max_users if it's not custom (or set to default custom value)
        // If it is custom, we might want to let them edit, so maybe set a default but allow change
        subscriptionForm.max_users = p.max_users || 100;
        subscriptionForm.max_client_users = p.max_client_users || 100;
        subscriptionForm.price = p.price ? Number(p.price) : 0;
    }
});

const handleStep1 = async () => {
    // ... existing logic ...
    loading.value = true;
    try {
        if (tenantId.value) {
            // Update existing if already created in this session
            const payload = {
                ...tenantForm,
                domain: `${tenantForm.domain}.nexspace.app`
            };
            await updateTenant(tenantId.value, payload);
            message.success('Tenant details updated');
            currentStep.value++;
        } else {  // Create new
            // Append suffix for backend
            const payload = {
                ...tenantForm,
                domain: `${tenantForm.domain}.nexspace.app`
            };
            const newTenant: any = await createTenant(payload);
            console.log('Create Tenant Response:', newTenant);

            const newId = newTenant?.id || newTenant?.data?.id;

            if (newId) {
                tenantId.value = newId;
                message.success('Tenant created successfully');
                currentStep.value++;
            } else {
                console.error('Could not extract Tenant ID from response', newTenant);
                message.error('Tenant created but ID missing');
            }
        }
    } catch (error: any) {
        console.error('Create error:', error);
        const errorData = error.data || error.response?._data;

        if (errorData && errorData.code === 'VALIDATION_ERROR' && errorData.error?.fields) {
            const fields = errorData.error.fields;
            Object.keys(fields).forEach(key => {
                const fieldErrors = fields[key];
                fieldErrors.forEach((err: any) => {
                    message.error(`${key}: ${err.message}`);
                });
            });
        } else {
            message.error(errorData?.message || 'Failed to save tenant details');
        }
    } finally {
        loading.value = false;
    }
};

const handleStep2 = async () => {
    if (!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date) {
        message.warning('Please complete all subscription fields');
        return;
    }

    if (!tenantId.value) {
        message.error('Tenant ID missing. Please go back to Step 1.');
        return;
    }

    loading.value = true;
    try {
        const payload = {
            tenant: tenantId.value,
            plan: subscriptionForm.plan,
            start_date: subscriptionForm.start_date,
            end_date: subscriptionForm.end_date,
            max_users: subscriptionForm.max_users,
            max_client_users: subscriptionForm.max_client_users,
            billing_cycle: subscriptionForm.billing_cycle,
            price: subscriptionForm.price,
            status: 'active'
        };

        console.log('Assigning plan (Step 2) with payload:', payload);
        const planResponse: any = await assignPlan(payload as any);

        // Relaxed check
        if (planResponse && (planResponse.success || planResponse.id || planResponse.tenant)) {
            message.success('Plan assigned successfully');
            currentStep.value++;
        } else {
            console.error('Plan assignment response invalid:', planResponse);
            throw new Error('Failed to assign plan - invalid response');
        }
    } catch (error: any) {
        message.error('Failed to assign plan');
        console.error('Step 2 Error:', error);
    } finally {
        loading.value = false;
    }
};

const handleStep3 = async () => {
    console.log('handleStep3 called. TenantId:', tenantId.value);
    if (!tenantId.value) {
        console.error('Tenant ID missing in handleStep3');
        return;
    }

    loading.value = true;
    try {
        // 2. Assign Modules
        if (subscriptionForm.selectedModules.length > 0) {
            const modulePayload = {
                tenant: tenantId.value,
                modules: subscriptionForm.selectedModules.map((moduleId, index) => ({
                    module: moduleId,
                    priority: 10 - index
                }))
            };
            console.log('Assigning modules (Step 3):', modulePayload);
            await assignModules(modulePayload);
        }

        message.success('Modules assigned successfully');
        currentStep.value++;

    } catch (error: any) {
        message.error('Failed to assign modules');
        console.error('Step 3 Error:', error);
    } finally {
        loading.value = false;
    }
};



const handleFileSelect = (event: any, field: 'logo' | 'dark_logo' | 'favicon') => {
    const file = event.target.files[0];
    if (file) {
        // Validation: Max 300KB
        if (file.size > 300 * 1024) {
            message.error('File size too large. Maximum size is 300KB.');
            event.target.value = ''; // Reset input
            return;
        }

        if (field === 'logo') {
            brandingForm.logo = file;
            brandingForm.logoPreview = URL.createObjectURL(file);
        } else if (field === 'dark_logo') {
            brandingForm.dark_logo = file;
            brandingForm.darkLogoPreview = URL.createObjectURL(file);
        } else if (field === 'favicon') {
            brandingForm.favicon = file;
            brandingForm.faviconPreview = URL.createObjectURL(file);
        }
    }
};

const handleStep4 = async () => {
    if (!tenantId.value) return;

    loading.value = true;
    try {
        const formData = new FormData();
        formData.append('tenant', tenantId.value);
        if (brandingForm.primary_color) formData.append('primary_color', brandingForm.primary_color);
        if (brandingForm.logo) formData.append('logo', brandingForm.logo);
        if (brandingForm.dark_logo) formData.append('dark_logo', brandingForm.dark_logo);
        if (brandingForm.favicon) formData.append('favicon', brandingForm.favicon);

        await updateBranding(formData);
        message.success('Branding updated successfully');
        currentStep.value++;
    } catch (error: any) {
        message.error('Failed to update branding');
        console.error('Step 4 Error:', error);
    } finally {
        loading.value = false;
    }
};

const handleStep5 = async () => {
    if (!tenantId.value) return;

    loading.value = true;
    try {
        const payload = {
            tenant: tenantId.value,
            ...piiForm
        };
        await updatePii(payload);
        message.success('Organization details updated successfully');
        currentStep.value++;
    } catch (error: any) {
        console.error('Step 5 Error:', error);
        const errorData = error.data || error.response?._data || error;

        if (errorData && (errorData.code === 'VALIDATION_ERROR' || errorData.error?.type === 'VALIDATION') && errorData.error?.fields) {
            const fields = errorData.error.fields;
            Object.keys(fields).forEach(key => {
                const fieldErrors = fields[key];
                const errors = Array.isArray(fieldErrors) ? fieldErrors : [fieldErrors];
                errors.forEach((err: any) => {
                    const msg = err.message || err.code || 'Invalid value';
                    const label = key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' ');
                    message.error(`${label}: ${msg}`);
                });
            });
        } else {
            message.error(errorData?.message || 'Failed to update organization details');
        }
    } finally {
        loading.value = false;
    }
};

const finishSetup = () => {
    // Navigate back to list or show success
    navigateTo('/tenants');
};
</script>
