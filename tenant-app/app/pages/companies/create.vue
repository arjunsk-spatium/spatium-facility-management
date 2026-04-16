<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Company</h1>
        </div>
        <div class="flex justify-center">
        <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
            <CompanyForm submit-text="Create Company" :loading="loading" @submit="handleCreate"
                @cancel="handleCancel" />
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '../../../stores/company'
import { message } from 'ant-design-vue'
import CompanyForm from '../../../components/companies/CompanyForm.vue'

const router = useRouter()
const store = useCompanyStore()
const loading = computed(() => store.loading)

const handleCancel = () => {
    router.push('/companies')
}

const handleCreate = async (formData: any) => {
    try {
        await store.createCompanyAction(formData)
        message.success('Company created successfully')
        router.push('/companies')
    } catch (error) {
        message.error('Failed to create company')
    }
}
</script>
