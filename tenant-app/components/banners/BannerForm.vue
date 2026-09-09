<template>
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        <!-- Form Fields Column -->
        <div class="xl:col-span-7">
            <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" @finish="handleSubmit">
                <!-- Title -->
                <a-form-item label="Title" name="title">
                    <a-input v-model:value="formState.title" placeholder="Enter banner title" :maxlength="200" />
                </a-form-item>

                <!-- Description -->
                <a-form-item label="Description" name="description">
                    <a-textarea v-model:value="formState.description" placeholder="Enter banner description" :rows="3"
                        :maxlength="500" />
                </a-form-item>

                <!-- Category -->
                <a-form-item label="Category" name="category">
                    <a-select v-model:value="formState.category" placeholder="Select category">
                        <a-select-option value="maintenance">Maintenance</a-select-option>
                        <a-select-option value="announcement">Announcement</a-select-option>
                        <a-select-option value="promotion">Promotion</a-select-option>
                        <a-select-option value="event">Event</a-select-option>
                        <a-select-option value="general">General</a-select-option>
                    </a-select>
                </a-form-item>

                <!-- Link -->
                <a-form-item label="Link" name="link" extra="Optional URL to redirect when banner is clicked">
                    <a-input v-model:value="formState.link" placeholder="https://example.com" :maxlength="500" />
                </a-form-item>

                <!-- Button Text (Link Title) -->
                <a-form-item label="Button Text (Link Title)" name="link_title"
                    extra="Label shown on the banner action button (e.g. Book Now, Learn More)">
                    <a-input v-model:value="formState.link_title" placeholder="e.g. Book Now" :maxlength="50" />
                </a-form-item>

                <!-- Status -->
                <a-form-item label="Status" name="is_active">
                    <a-switch v-model:checked="formState.is_active" checked-children="Active"
                        un-checked-children="Inactive" />
                </a-form-item>

                <!-- Banner Image -->
                <a-form-item label="Banner Image (16:9)" name="image"
                    extra="Recommended aspect ratio: 16:9 (e.g. 1920×1080). Max file size: 5MB.">
                    <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="1" list-type="picture-card"
                        accept="image/*">
                        <div v-if="fileList.length < 1">
                            <PlusOutlined />
                            <div style="margin-top: 8px">Upload</div>
                            <div class="text-[11px] text-neutral-400 mt-0.5">16:9</div>
                        </div>
                    </a-upload>
                </a-form-item>

                <!-- Actions -->
                <a-form-item>
                    <div class="flex justify-end gap-4 pt-2">
                        <a-button @click="$emit('cancel')">Cancel</a-button>
                        <a-button type="primary" html-type="submit" :loading="loading">
                            {{ submitText }}
                        </a-button>
                    </div>
                </a-form-item>
            </a-form>
        </div>

        <!-- Live Mobile Preview Column -->
        <div class="xl:col-span-5 flex flex-col items-center xl:sticky xl:top-6 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-200/70 dark:border-neutral-700/60">
            <div class="w-full mb-3 text-center">
                <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">Mobile Live Preview</h3>
                <p class="text-xs text-neutral-500 mt-0.5">Real-time preview of how the banner appears in Spatium</p>
            </div>
            <BannerMobilePreview
                :title="formState.title"
                :description="formState.description"
                :image-url="previewImageUrl"
                :link="formState.link"
                :link-title="formState.link_title"
                :category="formState.category"
                :tenant-name="tenantName"
                :user-name="userName"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, FormRules } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'
import BannerMobilePreview from './BannerMobilePreview.vue'
import { useTenantStore } from '../../stores/tenant'
import { useAuthStore } from '../../stores/auth'

interface FormState {
    title: string
    description: string
    category: string
    link: string
    link_title: string
    is_active: boolean
    image: string | File | null
}

interface Props {
    initialValues?: Partial<FormState>
    loading?: boolean
    submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
    initialValues: () => ({}),
    loading: false,
    submitText: 'Save'
})

const emit = defineEmits(['submit', 'cancel'])
const formRef = ref<FormInstance>()

const formState = ref<FormState>({
    title: '',
    description: '',
    category: 'general',
    link: '',
    link_title: '',
    is_active: true,
    image: null
})

const rules: FormRules = {
    title: [{ required: true, message: 'Please input banner title!' }],
    category: [{ required: true, message: 'Please select category!' }],
    link: [{ type: 'url', message: 'Please enter a valid URL!', trigger: 'blur' }]
}

const fileList = ref<UploadProps['fileList']>([])
const previewImageUrl = ref<string>('')
let currentObjectUrl: string | null = null

const updatePreviewImage = () => {
    if (fileList.value && fileList.value.length > 0) {
        const fileItem = fileList.value[0]
        if (fileItem.originFileObj && typeof URL !== 'undefined' && URL.createObjectURL) {
            if (currentObjectUrl && URL.revokeObjectURL) {
                URL.revokeObjectURL(currentObjectUrl)
            }
            currentObjectUrl = URL.createObjectURL(fileItem.originFileObj)
            previewImageUrl.value = currentObjectUrl
            return
        }
        if (fileItem.url) {
            previewImageUrl.value = fileItem.url
            return
        }
        if (fileItem.thumbUrl) {
            previewImageUrl.value = fileItem.thumbUrl
            return
        }
    }
    if (typeof formState.value.image === 'string' && formState.value.image) {
        previewImageUrl.value = formState.value.image
        return
    }
    previewImageUrl.value = ''
}

watch(fileList, updatePreviewImage, { deep: true })
watch(() => formState.value.image, updatePreviewImage)

onBeforeUnmount(() => {
    if (currentObjectUrl && typeof URL !== 'undefined' && URL.revokeObjectURL) {
        URL.revokeObjectURL(currentObjectUrl)
    }
})

const tenantName = computed(() => {
    try {
        const tenantStore = useTenantStore()
        return tenantStore?.tenant?.name || tenantStore?.tenant?.company_name || 'Spatium Commercio'
    } catch {
        return 'Spatium Commercio'
    }
})

const userName = computed(() => {
    try {
        const authStore = useAuthStore()
        return authStore?.user?.name || authStore?.user?.first_name || 'Dafiya'
    } catch {
        return 'Dafiya'
    }
})

const populateForm = () => {
    if (props.initialValues) {
        formState.value = {
            ...formState.value,
            title: props.initialValues.title || '',
            description: props.initialValues.description || '',
            category: props.initialValues.category || 'general',
            link: props.initialValues.link || '',
            link_title: props.initialValues.link_title || '',
            is_active: props.initialValues.is_active !== undefined ? props.initialValues.is_active : true,
            image: props.initialValues.image || null
        }

        const existingImage = props.initialValues.image
        if (existingImage && typeof existingImage === 'string') {
            fileList.value = [
                {
                    uid: '-1',
                    name: 'current-image',
                    status: 'done',
                    url: existingImage,
                    thumbUrl: existingImage,
                }
            ]
        } else {
            fileList.value = []
        }
        updatePreviewImage()
    }
}

onMounted(populateForm)
watch(() => props.initialValues, populateForm, { deep: true })

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
    const isImage = file.type.startsWith('image/')
    if (!isImage) {
        message.error('You can only upload image files!')
        return false
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
        message.error('Image must be smaller than 5MB!')
        return false
    }
    return false
}

const handleSubmit = async () => {
    try {
        await formRef.value?.validate()
        const formData: any = {
            title: formState.value.title,
            description: formState.value.description || undefined,
            category: formState.value.category,
            link: formState.value.link || undefined,
            link_title: formState.value.link_title || undefined,
            is_active: formState.value.is_active,
        }

        if (fileList.value && fileList.value.length > 0) {
            const fileItem = fileList.value[0]
            if (fileItem.originFileObj) {
                formData.image = fileItem.originFileObj
            }
        }

        emit('submit', formData)
    } catch (error) {
        console.log('Validation failed')
    }
}
</script>

<style scoped>
:deep(.ant-form-item) {
    margin-bottom: 16px;
}
</style>
