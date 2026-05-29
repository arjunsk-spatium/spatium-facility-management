<template>
    <div class="space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Banner</h1>
        </div>
        <div class="flex justify-center">
            <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
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
    } catch (error) {
        message.error('Failed to create banner')
    }
}
</script>
