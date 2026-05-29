<template>
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

        <!-- Status -->
        <a-form-item label="Status" name="is_active">
            <a-switch v-model:checked="formState.is_active" checked-children="Active"
                un-checked-children="Inactive" />
        </a-form-item>

        <!-- Banner Image -->
        <a-form-item label="Banner Image" name="image">
            <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="1" list-type="picture-card"
                accept="image/*">
                <div v-if="fileList.length < 1">
                    <PlusOutlined />
                    <div style="margin-top: 8px">Upload</div>
                </div>
            </a-upload>
        </a-form-item>

        <!-- Actions -->
        <a-form-item>
            <div class="flex justify-end gap-4">
                <a-button @click="$emit('cancel')">Cancel</a-button>
                <a-button type="primary" html-type="submit" :loading="loading">
                    {{ submitText }}
                </a-button>
            </div>
        </a-form-item>
    </a-form>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance, FormRules } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

interface FormState {
    title: string
    description: string
    category: string
    link: string
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
    is_active: true,
    image: null
})

const rules: FormRules = {
    title: [{ required: true, message: 'Please input banner title!' }],
    category: [{ required: true, message: 'Please select category!' }],
    link: [{ type: 'url', message: 'Please enter a valid URL!', trigger: 'blur' }]
}

const fileList = ref<UploadProps['fileList']>([])

const populateForm = () => {
    if (props.initialValues) {
        formState.value = {
            ...formState.value,
            title: props.initialValues.title || '',
            description: props.initialValues.description || '',
            category: props.initialValues.category || 'general',
            link: props.initialValues.link || '',
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
