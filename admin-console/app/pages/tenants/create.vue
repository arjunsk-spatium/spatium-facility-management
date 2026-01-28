<template>
    <div class="grid grid-cols-12 gap-6 p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
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
                    <a-form :model="tenantForm" layout="vertical" @finish="handleStep1">
                        <a-form-item label="Tenant Name" name="name"
                            :rules="[{ required: true, message: 'Please input tenant name!' }]">
                            <a-input v-model:value="tenantForm.name" placeholder="Acme Corp" size="large" />
                        </a-form-item>

                        <a-form-item label="Domain" name="domain"
                            :rules="[{ required: true, message: 'Please input domain!' }]">
                            <a-input v-model:value="tenantForm.domain" placeholder="acme" addon-after=".nexspace.app"
                                size="large" />
                        </a-form-item>

                        <div class="flex justify-end mt-8">
                            <a-button type="primary" html-type="submit" :loading="loading" size="large">Next:
                                Subscription</a-button>
                        </div>
                    </a-form>
                </div>

                <!-- Step 2: Subscription -->
                <div v-if="currentStep === 1">
                    <h3 class="text-lg font-medium mb-6">Select a Plan</h3>

                    <div v-if="registryPending" class="flex justify-center p-12">
                        <a-spin size="large" />
                    </div>

                    <a-radio-group v-else v-model:value="subscriptionForm.plan" class="w-full mb-8">
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
                                        {{ parseFloat(plan.price) === 0 ? 'Free' : `₹${plan.price}` }}
                                        <span class="text-sm font-normal text-gray-400">/mo</span>
                                    </span>
                                </div>
                                <a-tag v-if="plan.is_custom" color="orange" class="mt-3">Custom</a-tag>
                            </div>
                        </div>
                    </a-radio-group>

                    <div
                        class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                        <a-form-item label="Billing Cycle" required>
                            <a-select v-model:value="subscriptionForm.billing_cycle" class="w-full" size="large">
                                <a-select-option value="monthly">Monthly</a-select-option>
                                <a-select-option value="yearly">Yearly</a-select-option>
                            </a-select>
                        </a-form-item>

                        <a-form-item v-if="isCustomPlan" label="Max Users" required>
                            <a-input-number v-model:value="subscriptionForm.max_users" class="w-full" :min="1"
                                size="large" />
                        </a-form-item>

                        <a-form-item label="Subscription Start" required>
                            <a-date-picker v-model:value="subscriptionForm.start_date" class="w-full"
                                value-format="YYYY-MM-DD" size="large" placeholder="Select Start Date" />
                        </a-form-item>
                        <a-form-item label="Subscription End" required>
                            <a-date-picker v-model:value="subscriptionForm.end_date" class="w-full"
                                value-format="YYYY-MM-DD" size="large" placeholder="Select End Date" />
                        </a-form-item>
                    </div>

                    <div class="flex justify-between pt-4 border-t dark:border-gray-700">
                        <a-button @click="currentStep--" size="large">Back</a-button>
                        <a-button type="primary" @click="handleStep2" size="large"
                            :disabled="!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date">
                            Next: Configuration
                        </a-button>
                    </div>
                </div>

                <!-- Step 3: Configuration (Modules) -->
                <div v-if="currentStep === 2">
                    <h3 class="text-lg font-medium mb-2">Select Modules</h3>
                    <p class="text-gray-500 mb-6">Choose additional modules to enable for this tenant.</p>

                    <div v-if="registryPending" class="flex justify-center p-12">
                        <a-spin size="large" />
                    </div>

                    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <div v-for="mod in modules" :key="mod.id"
                            class="p-4 border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer flex items-start space-x-3 bg-white dark:bg-gray-800"
                            :class="subscriptionForm.selectedModules.includes(mod.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'">
                            <a-checkbox :checked="subscriptionForm.selectedModules.includes(mod.id)" @change="(e: any) => {
                                if (e.target.checked) subscriptionForm.selectedModules.push(mod.id);
                                else subscriptionForm.selectedModules = subscriptionForm.selectedModules.filter(id => id !== mod.id);
                            }" class="mt-1" />
                            <div>
                                <span class="font-medium block text-gray-900 dark:text-gray-100">{{ mod.name }}</span>
                                <span class="text-sm text-gray-500 mt-1 block">{{ mod.description }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-between pt-4 border-t dark:border-gray-700">
                        <a-button @click="currentStep--" size="large">Back</a-button>
                        <a-button type="primary" @click="handleStep3" :loading="loading" size="large">
                            Next: Branding
                        </a-button>
                    </div>
                </div>

                <!-- Step 4: Branding -->
                <div v-if="currentStep === 3">
                    <h3 class="text-lg font-medium mb-6">Branding Configuration</h3>
                    <a-form layout="vertical">
                        <a-form-item label="Brand Color">
                            <div class="flex items-center space-x-4">
                                <a-input type="color" v-model:value="brandingForm.primary_color"
                                    class="h-12 w-20 p-1 cursor-pointer" />
                                <span class="text-gray-500">{{ brandingForm.primary_color }}</span>
                            </div>
                        </a-form-item>

                        <a-divider />

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a-form-item label="Light Logo">
                                <div
                                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800">
                                    <div class="mb-2 text-gray-400"><span class="text-2xl">☀️</span></div>
                                    <div class="relative">
                                        <input type="file" accept="image/*"
                                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            @change="(e: any) => brandingForm.logo = e.target.files[0]" />
                                        <div class="text-sm text-primary-600 font-medium">Click to Upload</div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 truncate" v-if="brandingForm.logo">{{
                                        brandingForm.logo.name }}
                                    </p>
                                    <p class="text-xs text-gray-400 mt-2" v-else>PNG/JPG</p>
                                </div>
                            </a-form-item>

                            <a-form-item label="Dark Logo">
                                <div
                                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800">
                                    <div class="mb-2 text-gray-400"><span class="text-2xl">🌙</span></div>
                                    <div class="relative">
                                        <input type="file" accept="image/*"
                                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            @change="(e: any) => brandingForm.dark_logo = e.target.files[0]" />
                                        <div class="text-sm text-primary-600 font-medium">Click to Upload</div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 truncate" v-if="brandingForm.dark_logo">{{
                                        brandingForm.dark_logo.name }}</p>
                                    <p class="text-xs text-gray-400 mt-2" v-else>PNG/JPG</p>
                                </div>
                            </a-form-item>

                            <a-form-item label="Favicon">
                                <div
                                    class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors bg-white dark:bg-gray-800">
                                    <div class="mb-2 text-gray-400"><span class="text-2xl">ℹ️</span></div>
                                    <div class="relative">
                                        <input type="file" accept="image/*"
                                            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            @change="(e: any) => brandingForm.favicon = e.target.files[0]" />
                                        <div class="text-sm text-primary-600 font-medium">Click to Upload</div>
                                    </div>
                                    <p class="text-xs text-gray-500 mt-2 truncate" v-if="brandingForm.favicon">{{
                                        brandingForm.favicon.name }}</p>
                                    <p class="text-xs text-gray-400 mt-2" v-else>.ICO</p>
                                </div>
                            </a-form-item>
                        </div>
                    </a-form>

                    <div class="flex justify-between pt-4 mt-6 border-t dark:border-gray-700">
                        <a-button @click="currentStep--" size="large">Back</a-button>
                        <a-button type="primary" @click="handleStep4" :loading="loading" size="large">
                            Next: Organization
                        </a-button>
                    </div>
                </div>

                <!-- Step 5: Organization (PII) -->
                <div v-if="currentStep === 4">
                    <h3 class="text-lg font-medium mb-6">Organization Details</h3>
                    <a-form layout="vertical">
                        <a-form-item label="GSTIN / Tax ID" required>
                            <a-input v-model:value="piiForm.gstin" placeholder="e.g. 27AAAAA0000A1Z5" size="large" />
                        </a-form-item>
                        <a-form-item label="Full Address" required>
                            <a-textarea v-model:value="piiForm.address" placeholder="Registered office address..."
                                :rows="4" />
                        </a-form-item>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a-form-item label="Contact Person Name" required>
                                <a-input v-model:value="piiForm.contact_name" size="large" />
                            </a-form-item>
                            <a-form-item label="Contact Email" required>
                                <a-input v-model:value="piiForm.email" type="email"
                                    @change="(e: any) => piiForm.email = e.target.value.toLowerCase()" size="large" />
                            </a-form-item>
                            <a-form-item label="Contact Phone" required>
                                <a-input v-model:value="piiForm.phone" size="large" />
                            </a-form-item>
                        </div>
                    </a-form>

                    <div class="flex justify-between pt-4 mt-6 border-t dark:border-gray-700">
                        <a-button @click="currentStep--" size="large">Back</a-button>
                        <a-button type="primary" @click="handleStep5" :loading="loading" size="large">
                            Next: Review
                        </a-button>
                    </div>
                </div>

                <!-- Step 6: Review -->
                <div v-if="currentStep === 5">
                    <div class="text-center py-10">
                        <a-result status="success" title="Tenant configured successfully!"
                            :sub-title="`Tenant '${tenantForm.name}' is now active.`">
                            <template #extra>
                                <a-button type="primary" size="large" @click="finishSetup">Go to Tenant List</a-button>
                            </template>
                        </a-result>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { message } from 'ant-design-vue';
import { useModuleRegistry, type RegistryModule } from '../../composables/useModuleRegistry';
import { usePlanService, type Plan } from '../../composables/planService';

const currentStep = ref(0);
const loading = ref(false);
const tenantId = ref<string | null>(null);

const { createTenant, updateTenant, assignPlan, assignModules, getTenantModules, updateBranding, updatePii } = useTenantService();
const { getRegistry } = useModuleRegistry();
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
        const modulesResponse = await getRegistry();
        if (modulesResponse && modulesResponse.success && modulesResponse.data) {
            modules.value = modulesResponse.data.results || [];
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
    selectedModules: [] as string[]
});

// Branding Data
const brandingForm = reactive({
    primary_color: '#ffffff',
    logo: null as File | null,
    dark_logo: null as File | null,
    favicon: null as File | null
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
        // Find selected plan details
        const selectedPlan = plans.value.find(p => p.id === subscriptionForm.plan);
        const price = selectedPlan?.price ? parseFloat(selectedPlan.price) : 0;

        const payload = {
            tenant: tenantId.value,
            plan: subscriptionForm.plan,
            start_date: subscriptionForm.start_date,
            end_date: subscriptionForm.end_date,
            max_users: subscriptionForm.max_users,
            billing_cycle: subscriptionForm.billing_cycle,
            price: price,
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
        message.error('Failed to update organization details');
        console.error('Step 5 Error:', error);
    } finally {
        loading.value = false;
    }
};

const finishSetup = () => {
    // Navigate back to list or show success
    navigateTo('/tenants');
};
</script>
