<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4">
            <NuxtLink :to="`/tenants/${route.params.id}`">
                <a-button type="text">
                    <ArrowLeftOutlined /> Back
                </a-button>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Tenant</h1>
        </div>

        <div v-if="loading && !tenant" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <a-card v-else-if="tenant" :bordered="false" class="shadow-sm">
            <a-form :model="form" layout="vertical" @finish="handleSubmit" class="max-w-xl">
                <a-form-item label="Tenant Name" name="name"
                    :rules="[{ required: true, message: 'Please enter tenant name' }]">
                    <a-input v-model:value="form.name" size="large" />
                </a-form-item>

                <a-form-item label="Domain" name="domain">
                    <a-input v-model:value="form.domain" size="large" disabled />
                </a-form-item>



                <a-form-item label="Status" name="status">
                    <a-select v-model:value="form.status" size="large">
                        <a-select-option value="active">Active</a-select-option>
                        <a-select-option value="trial">Trial</a-select-option>
                        <a-select-option value="suspended">Suspended</a-select-option>
                        <a-select-option value="inactive">Inactive</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item>
                    <div class="flex justify-end gap-4">
                        <a-button @click="handleCancel">Cancel</a-button>
                        <a-button type="primary" html-type="submit" :loading="loading">Save Changes</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import { useTenantStore } from '../../../../stores/tenant'

const route = useRoute()
const router = useRouter()
const store = useTenantStore()

const tenant = computed(() => store.currentTenant)
const loading = computed(() => store.loading)

const form = ref({
    name: '',
    domain: '',
    status: 'active' as 'active' | 'trial' | 'suspended' | 'inactive'
})

watch(tenant, (t) => {
    if (t) {
        form.value = {
            name: t.name,
            domain: t.domain,
            status: t.status
        }
    }
}, { immediate: true })

const handleCancel = () => {
    router.back()
}

const handleSubmit = async () => {
    try {
        await store.updateTenantAction(route.params.id as string, form.value)
        message.success('Tenant updated successfully')
        router.back()
    } catch (error: any) {
        console.error(error)
        const errorData = error.data || error.response?._data
        if (errorData?.message) {
            message.error(errorData.message)
        } else {
            message.error('Failed to update tenant')
        }
    }
}

onMounted(() => {
    const id = route.params.id as string
    store.fetchTenant(id)
})
</script>
