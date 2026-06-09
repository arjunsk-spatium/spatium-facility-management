<template>
    <div class="max-w-2xl mx-auto space-y-6">
        <a-button type="link" @click="router.push('/feed-hub')">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Back to Feed Hub
        </a-button>

        <a-form layout="vertical" :model="formState" @finish="handleSubmit">
            <a-card title="Create Post">
                <a-form-item label="Category" name="category_id"
                    :rules="[{ required: true, message: 'Please select a category' }]">
                    <a-select v-model:value="formState.category_id" placeholder="Select category"
                        :loading="categoriesLoading">
                        <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                            {{ cat.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Title" name="title"
                    :rules="[{ required: true, message: 'Please enter a title' }]">
                    <a-input v-model:value="formState.title" placeholder="What's on your mind?" />
                </a-form-item>

                <a-form-item label="Description" name="description"
                    :rules="[{ required: true, message: 'Please enter a description' }]">
                    <a-textarea v-model:value="formState.description" rows="4" placeholder="Share more details..." />
                </a-form-item>

                <a-form-item label="Post Image">
                    <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="image/*">
                        <a-button>
                            <template #icon>
                                <UploadOutlined />
                            </template>
                            {{ imagePreview ? 'Change Image' : 'Upload Image' }}
                        </a-button>
                    </a-upload>
                    <div v-if="imagePreview" class="mt-3">
                        <img :src="imagePreview" alt="Preview" class="max-h-48 rounded-lg border" />
                        <a-button type="link" danger size="small" @click="clearImage" class="mt-1">
                            Remove Image
                        </a-button>
                    </div>
                </a-form-item>

                <a-form-item>
                    <a-checkbox v-model:checked="formState.allow_likes">Allow Likes</a-checkbox>
                </a-form-item>

                <div class="flex justify-end gap-3 pt-4 border-t">
                    <a-button @click="router.push('/feed-hub')">Cancel</a-button>
                    <a-button type="primary" html-type="submit" :loading="submitting">
                        Post
                    </a-button>
                </div>
            </a-card>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined, UploadOutlined } from '@ant-design/icons-vue'
import { useFeedService, type FeedCategory } from '../../../composables/feedService'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const router = useRouter()
const store = useFeedStore()
const { getCategories } = useFeedService()

const categories = ref<FeedCategory[]>([])
const categoriesLoading = ref(false)
const submitting = ref(false)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const formState = reactive({
    category_id: '',
    title: '',
    description: '',
    allow_likes: true,
})

const beforeUpload = (file: File) => {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    return false
}

const clearImage = () => {
    imageFile.value = null
    imagePreview.value = null
}

const handleSubmit = async () => {
    submitting.value = true
    try {
        const formData = new FormData()
        formData.append('category_id', formState.category_id)
        formData.append('title', formState.title)
        formData.append('description', formState.description)
        formData.append('allow_likes', String(formState.allow_likes))
        if (imageFile.value) {
            formData.append('image', imageFile.value)
        }

        await store.createClientPost({
            category_id: formState.category_id,
            title: formState.title,
            description: formState.description,
            allow_likes: formState.allow_likes,
            image: imageFile.value || undefined,
        })
        message.success('Post created successfully')
        router.push('/feed-hub')
    } catch (error: any) {
        message.error(error.message || 'Failed to create post')
    } finally {
        submitting.value = false
    }
}

const fetchCategories = async () => {
    categoriesLoading.value = true
    try {
        categories.value = await getCategories()
    } catch (err) {
        console.error('Failed to fetch categories:', err)
    } finally {
        categoriesLoading.value = false
    }
}

onMounted(() => {
    fetchCategories()
})
</script>
