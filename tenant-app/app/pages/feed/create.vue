<template>
    <div class="max-w-4xl mx-auto">
        <FeedForm submit-text="Create Post" :submitting="submitting" @submit="handleCreate" @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import FeedForm from '../../components/feed/FeedForm.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const router = useRouter()
const store = useFeedStore()
const submitting = ref(false)

const handleCancel = () => {
    router.push('/feed')
}

const handleCreate = async (payload: any) => {
    submitting.value = true
    try {
        await store.createAdminPost(payload)
        message.success('Post created successfully')
        router.push('/feed')
    } catch (error: any) {
        message.error(error.message || 'Failed to create post')
    } finally {
        submitting.value = false
    }
}
</script>
