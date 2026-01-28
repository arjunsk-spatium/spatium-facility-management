<template>
    <div class="p-6 max-w-4xl mx-auto">
        <div class="mb-8">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">Create New Tenant</h1>
            <a-steps :current="currentStep">
                <a-step title="Basic Info" description="Tenant details" />
                <a-step title="Subscription" description="Select plan" />
                <a-step title="Configuration" description="Setup modules" />
                <a-step title="Review" description="Confirm details" />
            </a-steps>
        </div>

        <div class="mt-8">
            <!-- Step 1: Basic Info -->
            <a-card v-if="currentStep === 0">
                <a-form :model="tenantForm" layout="vertical" @finish="handleStep1">
                    <a-form-item label="Tenant Name" name="name"
                        :rules="[{ required: true, message: 'Please input tenant name!' }]">
                        <a-input v-model:value="tenantForm.name" placeholder="Acme Corp" />
                    </a-form-item>

                    <a-form-item label="Domain" name="domain"
                        :rules="[{ required: true, message: 'Please input domain!' }]">
                        <a-input v-model:value="tenantForm.domain" placeholder="acme" addon-after=".nexspace.app" />
                    </a-form-item>

                    <div class="flex justify-end mt-6">
                        <a-button type="primary" html-type="submit" :loading="loading">Next: Subscription</a-button>
                    </div>
                </a-form>
            </a-card>

            <!-- Step 2: Subscription -->
            <a-card v-if="currentStep === 1">
                <h3 class="text-lg font-medium mb-4">Select a Plan</h3>

                <div v-if="registryPending" class="flex justify-center p-8">
                    <a-spin />
                </div>

                <a-radio-group v-else v-model:value="subscriptionForm.plan" class="w-full mb-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div v-for="plan in plans" :key="plan.id"
                            class="border rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors"
                            :class="{ 'border-primary-500 bg-primary-50 dark:bg-primary-900/10': subscriptionForm.plan === plan.id, 'border-gray-200 dark:border-gray-700': subscriptionForm.plan !== plan.id }"
                            @click="subscriptionForm.plan = plan.id">
                            <div class="flex justify-between items-start mb-2">
                                <h4 class="font-semibold">{{ plan.name }}</h4>
                                <a-radio :value="plan.id" />
                            </div>
                            <p class="text-sm text-gray-500 mb-2">{{ plan.description }}</p>
                            <div class="text-lg font-bold">
                                {{ plan.price === 0 ? 'Free' : `$${plan.price}/mo` }}
                            </div>
                        </div>
                    </div>
                </a-radio-group>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a-form-item label="Start Date" required>
                        <a-date-picker v-model:value="subscriptionForm.start_date" class="w-full"
                            value-format="YYYY-MM-DD" />
                    </a-form-item>
                    <a-form-item label="End Date" required>
                        <a-date-picker v-model:value="subscriptionForm.end_date" class="w-full"
                            value-format="YYYY-MM-DD" />
                    </a-form-item>
                </div>

                <div class="flex justify-between mt-6">
                    <a-button @click="currentStep--">Back</a-button>
                    <a-button type="primary" @click="handleStep2"
                        :disabled="!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date">
                        Next: Configuration
                    </a-button>
                </div>
            </a-card>

            <!-- Step 3: Configuration (Modules) -->
            <a-card v-if="currentStep === 2">
                <h3 class="text-lg font-medium mb-4">Select Modules</h3>
                <p class="text-gray-500 mb-6">Choose additional modules for this tenant.</p>

                <div v-if="registryPending" class="flex justify-center p-8">
                    <a-spin />
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div v-for="mod in modules" :key="mod.id"
                        class="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        :class="subscriptionForm.selectedModules.includes(mod.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'">
                        <a-checkbox :checked="subscriptionForm.selectedModules.includes(mod.id)" @change="(e: any) => {
                            if (e.target.checked) subscriptionForm.selectedModules.push(mod.id);
                            else subscriptionForm.selectedModules = subscriptionForm.selectedModules.filter(id => id !== mod.id);
                        }">
                            <span class="font-medium ml-2">{{ mod.name }}</span>
                        </a-checkbox>
                        <p class="text-sm text-gray-500 mt-2 ml-6">{{ mod.description }}</p>
                        <!-- 'is_core' is not in the new response, using 'is_active' or checking key if needed.
                             Based on response, there is no 'is_core' field. We'll simply show the module.
                             'is_active' seems to be true for all available modules. -->
                    </div>
                </div>

                <div class="flex justify-between mt-6">
                    <a-button @click="currentStep--">Back</a-button>
                    <a-button type="primary" @click="handleStep3" :loading="loading">
                        Next: Review
                    </a-button>
                </div>
            </a-card>

            <!-- Step 4: Review -->
            <a-card v-if="currentStep === 3">
                <a-result status="success" title="Tenant configured successfully!">
                    <template #extra>
                        <a-button type="primary" @click="finishSetup">Go to Tenant List</a-button>
                    </template>
                </a-result>
            </a-card>
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

const { createTenant, updateTenant, assignPlan } = useTenantService();
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
    selectedModules: [] as string[]
});

const handleStep1 = async () => {
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
            const newTenant = await createTenant(payload);
            if (newTenant) {
                // @ts-ignore
                tenantId.value = newTenant.id;
                message.success('Tenant created successfully');
                currentStep.value++;
            }
        }
    } catch (error: any) {
        console.error('Create error:', error);
        const errorData = error.data || error.response?._data; // $fetch error structure

        if (errorData && errorData.code === 'VALIDATION_ERROR' && errorData.error?.fields) {
            // Handle field-specific validation errors
            const fields = errorData.error.fields;
            Object.keys(fields).forEach(key => {
                const fieldErrors = fields[key];
                fieldErrors.forEach((err: any) => {
                    message.error(`${key}: ${err.message}`);
                });
            });
        } else {
            // Fallback for other errors
            message.error(errorData?.message || 'Failed to save tenant details');
        }
    } finally {
        loading.value = false;
    }
};

const handleStep2 = () => {
    if (!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date) {
        message.warning('Please complete all subscription fields');
        return;
    }
    // Pre-select core modules or modules included in the plan if logic existed
    // For now, allow manual selection in next step
    currentStep.value++;
};

const handleStep3 = async () => {
    if (!tenantId.value) return;

    loading.value = true;
    try {
        // Find selected plan details
        const selectedPlan = plans.value.find(p => p.id === subscriptionForm.plan);

        // Map billing cycle to expected format if needed, defaulting to monthly
        const billingCycle = selectedPlan?.billing_cycle || 'monthly';
        const price = selectedPlan?.price || 0;
        const maxUsers = selectedPlan?.max_users || 100; // Default or from plan

        const payload = {
            tenant: tenantId.value,
            plan: subscriptionForm.plan,
            start_date: subscriptionForm.start_date,
            end_date: subscriptionForm.end_date,
            max_users: maxUsers,
            billing_cycle: billingCycle,
            price: price,
            status: 'active',
            modules: subscriptionForm.selectedModules
        };

        // Note: The original assignPlan type doesn't have modules, we might need to extend it.
        // For this task, we assume assignPlan is the final step.
        const response: any = await assignPlan(payload as any);

        if (response && response.success) {
            message.success('Plan and modules assigned successfully');
            currentStep.value++;
        } else {
            throw new Error('Failed to assign plan');
        }
    } catch (error: any) {
        message.error('Failed to configure tenant');
        console.error(error);
    } finally {
        loading.value = false;
    }
};

const finishSetup = () => {
    // Navigate back to list or show success
    navigateTo('/tenants');
};
</script>
