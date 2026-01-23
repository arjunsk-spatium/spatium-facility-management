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
            <a-card v-if="currentStep === 0" class="shadow-sm">
                <a-form :model="tenantForm" layout="vertical" @finish="handleStep1">
                    <a-form-item label="Tenant Name" name="name"
                        :rules="[{ required: true, message: 'Please input tenant name!' }]">
                        <a-input v-model:value="tenantForm.name" placeholder="Acme Corp" />
                    </a-form-item>

                    <a-form-item label="Domain" name="domain"
                        :rules="[{ required: true, message: 'Please input domain!' }]">
                        <a-input v-model:value="tenantForm.domain" placeholder="acme.spatium.app" />
                    </a-form-item>

                    <div class="flex justify-end mt-6">
                        <a-button type="primary" html-type="submit" :loading="loading">Next: Subscription</a-button>
                    </div>
                </a-form>
            </a-card>

            <!-- Step 2: Subscription -->
            <a-card v-if="currentStep === 1" class="shadow-sm">
                <h3 class="text-lg font-medium mb-4">Select a Plan</h3>

                <div v-if="plansPending" class="flex justify-center p-8">
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
                    <a-button type="primary" @click="handleStep2" :loading="loading"
                        :disabled="!subscriptionForm.plan || !subscriptionForm.start_date || !subscriptionForm.end_date">
                        Next: Configuration
                    </a-button>
                </div>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';

const currentStep = ref(0);
const loading = ref(false);
const tenantId = ref<string | null>(null);

const { createTenant, updateTenant, assignPlan } = useTenantService();
const { getPlans } = usePlanService();

// Step 1 Data
const tenantForm = reactive({
    name: '',
    domain: ''
});

// Step 2 Data
const plans = ref<any[]>([]);
const plansPending = ref(false);

const fetchPlans = async () => {
    plansPending.value = true;
    try {
        const response: any = await getPlans();
        if (response && response.success) {
            plans.value = response.data || [];
        }
    } catch (e) {
        console.error('Failed to fetch plans', e);
    } finally {
        plansPending.value = false;
    }
};

fetchPlans();

const subscriptionForm = reactive({
    plan: '',
    start_date: '',
    end_date: ''
});

const handleStep1 = async () => {
    loading.value = true;
    try {
        let response;
        if (tenantId.value) {
            // Update existing if already created in this session
            await updateTenant(tenantId.value, tenantForm);
            message.success('Tenant details updated');
            currentStep.value++;
        } else {
            // Create new
            const newTenant = await createTenant(tenantForm);
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

const handleStep2 = async () => {
    if (!tenantId.value) return;

    loading.value = true;
    try {
        const payload = {
            tenant: tenantId.value,
            plan: subscriptionForm.plan,
            start_date: subscriptionForm.start_date,
            end_date: subscriptionForm.end_date
        };

        const response: any = await assignPlan(payload);

        if (response && response.success) {
            message.success('Plan assigned successfully');
            // Move to next step (Steps 3 & 4 not implemented yet as per request)
            message.info('Steps 3 and 4 are under construction');
        } else {
            throw new Error('Failed to assign plan');
        }
    } catch (error: any) {
        message.error('Failed to assign plan');
        console.error(error);
    } finally {
        loading.value = false;
    }
};
</script>
