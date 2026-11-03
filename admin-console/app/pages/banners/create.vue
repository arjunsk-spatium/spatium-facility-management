<template>
    <div class="max-w-4xl mx-auto">
        <div class="mb-6">
            <a-button type="link" @click="router.push('/banners')">
                <template #icon>
                    <ArrowLeftOutlined />
                </template>
                Back to Banners
            </a-button>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">Create Banner</h1>
        </div>
        <BannerForm submit-text="Create Banner" :submitting="submitting" :server-errors="serverErrors" @submit="handleCreate" @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import BannerForm from '../../components/banners/BannerForm.vue'
import { parseApiError } from '../../composables/apiError'

definePageMeta({ layout: 'default' })

const router = useRouter()
const store = useBannerStore()
const submitting = ref(false)
const serverErrors = ref<Record<string, string>>({})

const handleCancel = () => {
    router.push('/banners')
}

const handleCreate = async (payload: any) => {
    submitting.value = true
    serverErrors.value = {}
    try {
        await store.createBanner(payload)
        message.success('Banner created successfully')
        router.push('/banners')
    } catch (error: any) {
        const parsed = parseApiError(error, 'Failed to create banner')
        serverErrors.value = parsed.fields
        message.error(parsed.message)
    } finally {
        submitting.value = false
    }
}
</script>
