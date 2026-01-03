<template>
    <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900">Create Company</h1>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-form :model="form" layout="vertical" @finish="handleSubmit">
                <a-form-item label="Company Name" name="name"
                    :rules="[{ required: true, message: 'Please input company name!' }]">
                    <a-input v-model:value="form.name" placeholder="Enter company name" />
                </a-form-item>

                <a-form-item label="Address" name="address"
                    :rules="[{ required: true, message: 'Please input address!' }]">
                    <a-input v-model:value="form.address" placeholder="Enter address" />
                </a-form-item>

                <a-form-item label="Status" name="status">
                    <a-select v-model:value="form.status">
                        <a-select-option value="active">Active</a-select-option>
                        <a-select-option value="inactive">Inactive</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item>
                    <div class="flex justify-end space-x-4">
                        <NuxtLink to="/companies">
                            <a-button>Cancel</a-button>
                        </NuxtLink>
                        <a-button type="primary" html-type="submit" :loading="loading">Create Company</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '../../../stores/company'
import { message } from 'ant-design-vue'

const router = useRouter()
const store = useCompanyStore()
const loading = computed(() => store.loading)

const form = ref({
    name: '',
    address: '',
    status: 'active'
})

const handleSubmit = async (values: any) => {
    try {
        await store.createCompanyAction(values)
        if (!store.error) {
            message.success('Company created successfully')
            router.push('/companies')
        } else {
            message.error(store.error || 'Failed to create company')
        }
    } catch (e) {
        console.error(e)
    }
}
</script>
