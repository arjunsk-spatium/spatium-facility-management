<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Tenant</h1>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-steps :current="currentStep" class="!mb-10">
                <a-step title="Basic Info" />
                <a-step title="Select Plan" />
                <a-step title="Configure Modules" />
                <a-step title="Review" />
            </a-steps>

            <a-divider class="!my-8" />

            <!-- Step 1: Basic Info -->
            <div v-show="currentStep === 0" class="mt-6">
                <a-form :model="form" layout="vertical" class="max-w-xl">
                    <a-form-item label="Tenant Name" name="name"
                        :rules="[{ required: true, message: 'Please enter tenant name' }]">
                        <a-input v-model:value="form.name" placeholder="Enter tenant name" size="large" />
                    </a-form-item>

                    <a-form-item label="Domain" name="domain"
                        :rules="[{ required: true, message: 'Please enter domain' }]">
                        <a-input v-model:value="form.domain" placeholder="tenant-name" size="large"
                            addon-after=".spatium.app" />
                    </a-form-item>

                    <a-form-item label="Admin Email" name="adminEmail"
                        :rules="[{ required: true, type: 'email', message: 'Please enter valid email' }]">
                        <a-input v-model:value="form.adminEmail" placeholder="admin@company.com" size="large" />
                    </a-form-item>
                </a-form>
            </div>

            <!-- Step 2: Select Plan -->
            <div v-show="currentStep === 1">
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div v-for="plan in plans" :key="plan.id" @click="form.planId = plan.id" :class="[
                        'cursor-pointer p-4 rounded-lg border-2 transition-all',
                        form.planId === plan.id
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    ]">
                        <h3 class="font-semibold text-lg">{{ plan.name }}</h3>
                        <p class="text-gray-500 text-sm mb-2">{{ plan.description }}</p>
                        <div class="text-2xl font-bold text-primary-600" v-if="plan.price > 0">
                            ₹{{ plan.price }}<span class="text-sm font-normal">/mo</span>
                        </div>
                        <div class="text-2xl font-bold text-primary-600" v-else>Contact Us</div>
                        <div class="mt-2 text-sm text-gray-500">
                            {{ plan.modules.length }} modules · {{ plan.maxUsers }} users
                        </div>
                    </div>
                </div>
            </div>

            <!-- Step 3: Configure Modules -->
            <div v-show="currentStep === 2">
                <p class="mb-4 text-gray-600 dark:text-gray-400">
                    Select modules to enable for this tenant. The selected plan includes:
                    <strong>{{ selectedPlan?.modules.join(', ') || 'None' }}</strong>
                </p>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="mod in modules" :key="mod.id" @click="toggleModule(mod.id)" :class="[
                        'cursor-pointer p-4 rounded-lg border-2 transition-all text-center',
                        form.modules.includes(mod.id)
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-primary-300'
                    ]">
                        <div class="text-2xl mb-2">
                            <CheckCircleFilled v-if="form.modules.includes(mod.id)" class="text-primary-500" />
                            <span v-else class="text-gray-400">○</span>
                        </div>
                        <div class="font-medium">{{ mod.name }}</div>
                    </div>
                </div>
            </div>

            <!-- Step 4: Review -->
            <div v-show="currentStep === 3">
                <a-descriptions title="Tenant Details" bordered :column="1">
                    <a-descriptions-item label="Name">{{ form.name }}</a-descriptions-item>
                    <a-descriptions-item label="Domain">{{ form.domain }}.spatium.app</a-descriptions-item>
                    <a-descriptions-item label="Admin Email">{{ form.adminEmail }}</a-descriptions-item>
                    <a-descriptions-item label="Plan">{{ selectedPlan?.name }}</a-descriptions-item>
                    <a-descriptions-item label="Modules">
                        <a-tag v-for="mod in form.modules" :key="mod" color="blue">{{ mod }}</a-tag>
                    </a-descriptions-item>
                </a-descriptions>
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-4 mt-8 pt-4 border-t">
                <a-button v-if="currentStep > 0" @click="prevStep">Previous</a-button>
                <a-button @click="handleCancel">Cancel</a-button>
                <a-button v-if="currentStep < 3" type="primary" @click="nextStep"
                    :disabled="!isStepValid">Next</a-button>
                <a-button v-else type="primary" @click="handleSubmit" :loading="loading">Create Tenant</a-button>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { useTenantStore } from '../../../stores/tenant'
import { usePlanStore } from '../../../stores/plan'

const router = useRouter()
const tenantStore = useTenantStore()
const planStore = usePlanStore()

const loading = computed(() => tenantStore.loading)
const plans = computed(() => planStore.plans)
const modules = computed(() => planStore.modules)

const currentStep = ref(0)

const form = ref({
    name: '',
    domain: '',
    adminEmail: '',
    planId: '',
    modules: [] as string[]
})

const selectedPlan = computed(() => plans.value.find(p => p.id === form.value.planId))

const isStepValid = computed(() => {
    switch (currentStep.value) {
        case 0:
            return form.value.name && form.value.domain && form.value.adminEmail
        case 1:
            return form.value.planId
        case 2:
            return form.value.modules.length > 0
        default:
            return true
    }
})

const toggleModule = (moduleId: string) => {
    const index = form.value.modules.indexOf(moduleId)
    if (index === -1) {
        form.value.modules.push(moduleId)
    } else {
        form.value.modules.splice(index, 1)
    }
}

const nextStep = () => {
    if (currentStep.value === 1 && selectedPlan.value) {
        // Pre-select modules from plan
        form.value.modules = [...selectedPlan.value.modules]
    }
    currentStep.value++
}

const prevStep = () => {
    currentStep.value--
}

const handleCancel = () => {
    router.push('/tenants')
}

const handleSubmit = async () => {
    try {
        await tenantStore.createTenantAction({
            name: form.value.name,
            domain: `${form.value.domain}.spatium.app`,
            adminEmail: form.value.adminEmail,
            planId: form.value.planId,
            planName: selectedPlan.value?.name || '',
            status: 'trial',
            modules: form.value.modules,
            userCount: 0
        })
        message.success('Tenant created successfully')
        router.push('/tenants')
    } catch (error) {
        message.error('Failed to create tenant')
    }
}

onMounted(() => {
    planStore.fetchPlans()
})
</script>
