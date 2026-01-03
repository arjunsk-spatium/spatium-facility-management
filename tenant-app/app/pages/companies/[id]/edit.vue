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

        <a-card v-else :bordered="false" class="shadow-sm">
            <CompanyForm :initial-values="currentCompany" submit-text="Save Changes" :loading="loading"
                @submit="handleUpdate" @cancel="handleCancel" />
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCompanyStore } from '../../../../stores/company'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import CompanyForm from '../../../../components/companies/CompanyForm.vue'

const router = useRouter()
const route = useRoute()
const store = useCompanyStore()

const loading = computed(() => store.loading)
const currentCompany = computed(() => store.currentCompany)

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
