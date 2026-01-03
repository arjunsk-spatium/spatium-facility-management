<template>
    <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center space-x-4">
            <NuxtLink :to="`/companies/${route.params.id}`">
                <a-button type="text">
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                </a-button>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Edit Company</h1>
        </div>

        <div v-if="loading && !form.name" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <a-card v-else :bordered="false" class="shadow-sm">
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
                        <NuxtLink :to="`/companies/${route.params.id}`">
                            <a-button>Cancel</a-button>
                        </NuxtLink>
                        <a-button type="primary" html-type="submit" :loading="loading">Save Changes</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCompanyStore } from '../../../../stores/company'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useCompanyStore()
const loading = computed(() => store.loading)
const currentCompany = computed(() => store.currentCompany)

const form = ref({
    name: '',
    address: '',
    status: 'active'
})

onMounted(async () => {
    const id = route.params.id as string
    if (id) {
        await store.fetchCompany(id)
        if (currentCompany.value) {
            form.value = {
                name: currentCompany.value.name,
                address: currentCompany.value.address,
                status: currentCompany.value.status
            }
        }
    }
})

const handleSubmit = async (values: any) => {
    try {
        const id = route.params.id as string
        await store.updateCompanyAction(id, values)
        if (!store.error) {
            message.success('Company updated successfully')
            router.push(`/companies/${id}`)
        } else {
            message.error(store.error || 'Failed to update company')
        }
    } catch (e) {
        console.error(e)
    }
}
</script>
