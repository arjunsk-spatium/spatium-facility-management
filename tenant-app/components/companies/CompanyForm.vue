<template>
    <a-form :model="form" layout="vertical" @finish="handleSubmit">
        <!-- Company Name -->
        <a-form-item label="Company Name" name="name"
            :rules="[{ required: true, message: 'Please input company name!' }]">
            <a-input v-model:value="form.name" placeholder="Enter company name" :maxlength="100" />
        </a-form-item>

        <!-- Address -->
        <a-form-item label="Address" name="address" :rules="[{ required: true, message: 'Please input address!' }]">
            <a-textarea v-model:value="form.address" placeholder="Enter company address" :rows="3" :maxlength="500" />
        </a-form-item>

        <!-- SPOC Details Section -->
        <a-divider orientation="left">SPOC Details</a-divider>

        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="SPOC Name" name="spoc_name"
                    :rules="[{ required: true, message: 'Please input SPOC name!' }]">
                    <a-input v-model:value="form.spoc_name" placeholder="Enter SPOC name" :maxlength="100" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="SPOC Email" name="spoc_email"
                    :rules="[{ required: true, type: 'email', message: 'Please input a valid email!' }]">
                    <a-input v-model:value="form.spoc_email" placeholder="Enter SPOC email" :maxlength="100" />
                </a-form-item>
            </a-col>
        </a-row>

        <a-form-item label="SPOC Phone" name="spoc_phone"
            :rules="[
                { required: true, message: 'Please input SPOC phone number!' },
                { pattern: /^\d{10}$/, message: 'Please enter a valid 10-digit phone number!' }
            ]">
            <a-input v-model:value="form.spoc_phone" placeholder="Enter SPOC phone number" :maxlength="10" />
        </a-form-item>

        <!-- Business Details Section -->
        <a-divider orientation="left">Business Details</a-divider>

        <a-row :gutter="16">
            <a-col :span="12">
                <a-form-item label="GSTIN" name="gstin"
                    :rules="[
                        { pattern: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Please enter a valid GSTIN!' }
                    ]">
                    <a-input v-model:value="form.gstin" placeholder="Enter GSTIN" :maxlength="15" @input="form.gstin = form.gstin.toUpperCase()" />
                </a-form-item>
            </a-col>
            <a-col :span="12">
                <a-form-item label="Facility" name="facility"
                    :rules="[{ required: true, message: 'Please select a facility!' }]">
                    <a-select v-model:value="form.facility" placeholder="Select facility">
                        <a-select-option value="Facility 1">Facility 1</a-select-option>
                        <a-select-option value="Facility 2">Facility 2</a-select-option>
                        <a-select-option value="Facility 3">Facility 3</a-select-option>
                    </a-select>
                </a-form-item>
            </a-col>
        </a-row>

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
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

interface Props {
    initialValues?: any
    loading?: boolean
    submitText?: string
}

const props = withDefaults(defineProps<Props>(), {
    initialValues: () => ({}),
    loading: false,
    submitText: 'Save'
})

const emit = defineEmits(['submit', 'cancel'])

const form = ref({
    name: '',
    address: '',
    spoc_name: '',
    spoc_email: '',
    spoc_phone: '',
    gstin: '',
    facility: null as string | null,
    logo: ''
})

const fileList = ref<UploadProps['fileList']>([])

const populateForm = () => {
    if (props.initialValues) {
        form.value = { ...form.value, ...props.initialValues }
        if (props.initialValues.logo) {
            // If logo is a URL string, we can verify if we want to show it in fileList
            // For now we just keep the form state
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

const handleSubmit = () => {
    const formData: any = { ...form.value }

    // Attach file if present
    if (fileList.value && fileList.value.length > 0) {
        formData.logoFile = fileList.value[0].originFileObj
    }

    emit('submit', formData)
}
</script>

<style scoped>
/* Dark mode styles for dividers */
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
