<template>
    <div class="space-y-6">
        <div class="flex items-center space-x-4">
            <NuxtLink :to="`/companies/${route.params.id}`">
                <a-button type="text">
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                </a-button>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Company</h1>
        </div>

        <div v-if="loading && !currentCompany" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <a-card v-else-if="currentCompany">
            <CompanyForm :initial-values="formInitialValues" submit-text="Save Changes" :loading="loading"
                @submit="handleUpdate" @cancel="handleCancel" />
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCompanyStore } from '../../../../stores/company'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import CompanyForm from '../../../../components/companies/CompanyForm.vue'

interface FormInitialValues {
    name: string
    status: 'active' | 'inactive'
    logo: string | null
    contactName: string
    email: string
    address: string
    phone: string
    gstin: string
}

const router = useRouter()
const route = useRoute()
const store = useCompanyStore()

const loading = computed(() => store.loading)

const currentCompany = computed(() => store.currentCompany)

const formInitialValues = computed<FormInitialValues>(() => {
    const company = store.currentCompany
    if (!company || !company.contacts) {
        return {
            name: '',
            status: 'active',
            logo: null,
            contactName: '',
            email: '',
            address: '',
            phone: '',
            gstin: ''
        }
    }
    const contact = (Array.isArray(company.contacts) ? company.contacts[0] : null) || {}
    return {
        name: company.name,
        status: company.status,
        logo: company.logo || null,
        contactName: contact.contact_name || '',
        email: contact.email || '',
        address: contact.address || '',
        phone: contact.phone || '',
        gstin: contact.gstin || ''
    }
})

onMounted(async () => {
    const id = route.params.id as string
    if (id) {
        await store.fetchCompany(id)
    }
})

const handleCancel = () => {
    router.push(`/companies/${route.params.id}`)
}

const handleUpdate = async (formData: any) => {
    try {
        const id = route.params.id as string
        await store.updateCompanyAction(id, formData)
        message.success('Company updated successfully')
        router.push(`/companies/${id}`)
    } catch (e) {
        message.error('Failed to update company')
    }
}
</script>
