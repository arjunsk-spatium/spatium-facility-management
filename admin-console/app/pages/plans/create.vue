<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Plan</h1>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-form :model="form" layout="vertical" @finish="handleSubmit" class="max-w-2xl">
                <!-- Plan Name -->
                <a-form-item label="Plan Name" name="name"
                    :rules="[{ required: true, message: 'Please enter plan name' }]">
                    <a-input v-model:value="form.name" placeholder="e.g., Pro Plan" size="large" />
                </a-form-item>

                <!-- Description -->
                <a-form-item label="Description" name="description">
                    <a-textarea v-model:value="form.description" placeholder="Brief description of this plan"
                        :rows="3" />
                </a-form-item>

                <!-- Pricing -->
                <a-divider orientation="left">Pricing</a-divider>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Price (₹)" name="price"
                            :rules="[{ required: true, message: 'Please enter price' }]">
                            <a-input-number v-model:value="form.price" :min="0" :precision="0" style="width: 100%"
                                size="large" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Billing Cycle" name="billingCycle">
                            <a-select v-model:value="form.billingCycle" size="large">
                                <a-select-option value="monthly">Monthly</a-select-option>
                                <a-select-option value="yearly">Yearly</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="Max Users" name="maxUsers">
                    <a-input-number v-model:value="form.maxUsers" :min="1" style="width: 200px" size="large" />
                </a-form-item>

                <!-- Modules -->
                <a-divider orientation="left">Modules</a-divider>

                <a-form-item label="Select Modules" name="modules">
                    <a-checkbox-group v-model:value="form.modules" class="w-full">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <a-checkbox v-for="mod in availableModules" :key="mod.id" :value="mod.id"
                                class="!ml-0 p-3 border rounded-lg hover:border-primary-300 transition-colors">
                                {{ mod.name }}
                            </a-checkbox>
                        </div>
                    </a-checkbox-group>
                </a-form-item>

                <!-- Features -->
                <a-divider orientation="left">Features</a-divider>

                <a-form-item label="Plan Features">
                    <div class="space-y-2">
                        <div v-for="(feature, index) in form.features" :key="index" class="flex gap-2">
                            <a-input v-model:value="form.features[index]" placeholder="Feature description" />
                            <a-button type="text" danger @click="removeFeature(index)">
                                <DeleteOutlined />
                            </a-button>
                        </div>
                        <a-button type="dashed" @click="addFeature" block>
                            <PlusOutlined /> Add Feature
                        </a-button>
                    </div>
                </a-form-item>

                <!-- Active Status -->
                <a-form-item label="Status">
                    <a-switch v-model:checked="form.isActive" checked-children="Active"
                        un-checked-children="Inactive" />
                </a-form-item>

                <!-- Actions -->
                <a-form-item>
                    <div class="flex justify-end gap-4">
                        <a-button @click="handleCancel">Cancel</a-button>
                        <a-button type="primary" html-type="submit" :loading="loading">Create Plan</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { usePlanStore } from '../../../stores/plan'
import { availableModules } from '../../composables/planService'

const router = useRouter()
const store = usePlanStore()
const loading = computed(() => store.loading)

const form = ref({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'monthly' as 'monthly' | 'yearly',
    modules: [] as string[],
    maxUsers: 10,
    features: [''],
    isActive: true
})

const addFeature = () => {
    form.value.features.push('')
}

const removeFeature = (index: number) => {
    form.value.features.splice(index, 1)
}

const handleCancel = () => {
    router.push('/plans')
}

const handleSubmit = async () => {
    try {
        await store.createPlanAction({
            name: form.value.name,
            description: form.value.description,
            price: form.value.price,
            billingCycle: form.value.billingCycle,
            modules: form.value.modules,
            maxUsers: form.value.maxUsers,
            features: form.value.features.filter(f => f.trim()),
            isActive: form.value.isActive
        })
        message.success('Plan created successfully')
        router.push('/plans')
    } catch (error) {
        message.error('Failed to create plan')
    }
}
</script>
