<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Banner</h1>
        </div>
        <div class="flex justify-center">
            <a-card class="w-full max-w-6xl" :bodyStyle="{ padding: '24px' }">
                <BannerForm submit-text="Create Banner" :loading="loading" @submit="handleCreate"
                    @cancel="handleCancel" />
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useBannerStore } from '../../../stores/banner'
import { message } from 'ant-design-vue'
import BannerForm from '../../../components/banners/BannerForm.vue'

const store = useBannerStore()
const loading = computed(() => store.loading)

const handleCancel = () => {
    navigateTo('/banners')
}

const handleCreate = async (formData: any) => {
    try {
        await store.createBannerAction(formData)
        message.success('Banner created successfully')
        navigateTo('/banners')
    } catch (error: any) {
        let errorMsg = error?.data?.message || error?.data?.error?.message || error?.data?.error
        if (!errorMsg && error?.data?.error?.fields) {
            const fields = error.data.error.fields
            const firstKey = Object.keys(fields)[0]
            if (firstKey && fields[firstKey]?.[0]?.message) {
                errorMsg = fields[firstKey][0].message
            }
        }
        message.error(typeof errorMsg === 'string' ? errorMsg : (error?.message || 'Failed to create banner'))
    }
}
</script>
