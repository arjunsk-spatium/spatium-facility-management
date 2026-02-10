<template>
    <a-form ref="formRef" :model="formState" layout="vertical" :rules="rules" @finish="handleSubmit">
        <!-- Company Name -->
        <a-form-item label="Company Name" name="name">
            <a-input v-model:value="formState.name" placeholder="Enter company name" :maxlength="100" />
        </a-form-item>

        <!-- Status -->
        <a-form-item label="Status" name="status">
            <a-select v-model:value="formState.status" placeholder="Select status">
                <a-select-option value="active">Active</a-select-option>
                <a-select-option value="inactive">Inactive</a-select-option>
            </a-select>
        </a-form-item>

        <!-- Company Logo -->
        <a-form-item label="Company Logo" name="logo">
            <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="1" list-type="picture-card"
                accept="image/*">
                <div v-if="fileList.length < 1">
                    <PlusOutlined />
                    <div style="margin-top: 8px">Upload</div>
                </div>
            </a-upload>
        </a-form-item>

        <!-- Contact Details Section -->
        <a-divider orientation="left">Contact Details</a-divider>

        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Contact Name" name="contactName">
                    <a-input v-model:value="formState.contactName" placeholder="Enter contact name" :maxlength="100" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="Email" name="email">
                    <a-input v-model:value="formState.email" placeholder="Enter email" :maxlength="100" />
                </a-form-item>
            </a-col>
        </a-row>

        <a-form-item label="Address" name="address">
            <a-textarea v-model:value="formState.address" placeholder="Enter address" :rows="3" :maxlength="500" />
        </a-form-item>

        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="Phone" name="phone">
                    <a-input v-model:value="formState.phone" placeholder="Enter phone number" :maxlength="20" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="GSTIN" name="gstin">
                    <a-input v-model:value="formState.gstin" placeholder="Enter GSTIN" :maxlength="15" @input="formState.gstin = formState.gstin?.toUpperCase()" />
                </a-form-item>
            </a-col>
        </a-row>

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
    name: string
    status: 'active' | 'inactive'
    logo: string | File | null
    contactName: string
    email: string
    address: string
    phone: string
    gstin: string
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
    name: '',
    status: 'active',
    logo: null,
    contactName: '',
    email: '',
    address: '',
    phone: '',
    gstin: ''
})

const rules: FormRules = {
    name: [{ required: true, message: 'Please input company name!' }],
    status: [{ required: true, message: 'Please select status!' }],
    contactName: [{ required: true, message: 'Please input contact name!' }],
    email: [
        { required: true, message: 'Please input email!' },
        { type: 'email', message: 'Please input a valid email!' }
    ],
    address: [{ required: true, message: 'Please input address!' }],
    phone: [{ required: true, message: 'Please input phone number!' }],
    gstin: [{ pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter a valid GSTIN!' }]
}

const fileList = ref<UploadProps['fileList']>([])

const populateForm = () => {
    if (props.initialValues) {
        formState.value = {
            ...formState.value,
            name: props.initialValues.name || '',
            status: props.initialValues.status || 'active',
            logo: props.initialValues.logo || null,
            contactName: props.initialValues.contactName || '',
            email: props.initialValues.email || '',
            address: props.initialValues.address || '',
            phone: props.initialValues.phone || '',
            gstin: props.initialValues.gstin || ''
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
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
        message.error('Image must be smaller than 2MB!')
        return false
    }
    return false
}

const handleSubmit = async () => {
    try {
        await formRef.value?.validate()
        const formData: any = {
            name: formState.value.name,
            status: formState.value.status,
            contacts: {
                contact_name: formState.value.contactName,
                email: formState.value.email,
                address: formState.value.address,
                phone: formState.value.phone,
                gstin: formState.value.gstin
            }
        }

        if (fileList.value && fileList.value.length > 0) {
            formData.logo = fileList.value[0].originFileObj
        }

        emit('submit', formData)
    } catch (error) {
        console.log('Validation failed')
    }
}
</script>

<style scoped>
:deep(.ant-divider) {
    border-color: #f0f0f0;
}

.dark :deep(.ant-divider) {
    border-color: #333333;
}

:deep(.ant-divider-inner-text) {
    color: inherit;
}

.dark :deep(.ant-divider-inner-text) {
    color: #a3a3a3;
}
</style>
