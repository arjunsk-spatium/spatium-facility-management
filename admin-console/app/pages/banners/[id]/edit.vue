<template>
    <div class="max-w-4xl mx-auto">
        <div class="mb-6">
            <a-button type="link" @click="router.push('/banners')">
                <template #icon>
                    <ArrowLeftOutlined />
                </template>
                Back to Banners
            </a-button>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white mt-2">Edit Banner</h1>
        </div>

        <div v-if="loading && !banner" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <BannerForm v-else
            is-editing
            submit-text="Update Banner"
            :submitting="submitting"
            :loading="loading"
            :initial-values="initialValues"
            @submit="handleUpdate"
            @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import BannerForm from '../../../components/banners/BannerForm.vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const store = useBannerStore()
const submitting = ref(false)

const banner = computed(() => store.currentBanner)
const loading = computed(() => store.loading)

const initialValues = computed(() => {
    if (!banner.value) return null
    return {
        title: banner.value.title,
        description: banner.value.description,
        category: banner.value.category,
        link: banner.value.link || '',
        is_active: banner.value.is_active,
        is_global: banner.value.is_global,
        image_url: banner.value.image_url,
        tenant: banner.value.tenant,
    }
})

const handleCancel = () => {
    router.push('/banners')
}

const handleUpdate = async (payload: any) => {
    submitting.value = true
    try {
        await store.updateBanner(route.params.id as string, payload)
        message.success('Banner updated successfully')
        router.push(`/banners/${route.params.id}`)
    } catch (error: any) {
        message.error(error.message || 'Failed to update banner')
    } finally {
        submitting.value = false
    }
}

onMounted(() => {
    store.fetchBanner(route.params.id as string)
})
</script>
