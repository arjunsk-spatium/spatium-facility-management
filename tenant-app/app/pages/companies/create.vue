<template>
    <div class="max-w-3xl space-y-6">
        <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Create Company</h1>
        </div>

        <a-card :bordered="false" class="shadow-sm">
            <a-form :model="form" layout="vertical" @finish="handleSubmit">
                <!-- Company Name -->
                <a-form-item label="Company Name" name="name"
                    :rules="[{ required: true, message: 'Please input company name!' }]">
                    <a-input v-model:value="form.name" placeholder="Enter company name" />
                </a-form-item>

                <!-- Address -->
                <a-form-item label="Address" name="address"
                    :rules="[{ required: true, message: 'Please input address!' }]">
                    <a-textarea v-model:value="form.address" placeholder="Enter company address" :rows="3" />
                </a-form-item>

                <!-- SPOC Details Section -->
                <a-divider orientation="left">SPOC Details</a-divider>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="SPOC Name" name="spoc_name"
                            :rules="[{ required: true, message: 'Please input SPOC name!' }]">
                            <a-input v-model:value="form.spoc_name" placeholder="Enter SPOC name" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="SPOC Email" name="spoc_email"
                            :rules="[{ required: true, type: 'email', message: 'Please input a valid email!' }]">
                            <a-input v-model:value="form.spoc_email" placeholder="Enter SPOC email" />
                        </a-form-item>
                    </a-col>
                </a-row>

                <a-form-item label="SPOC Phone" name="spoc_phone"
                    :rules="[{ required: true, message: 'Please input SPOC phone number!' }]">
                    <a-input v-model:value="form.spoc_phone" placeholder="Enter SPOC phone number" />
                </a-form-item>

                <!-- Business Details Section -->
                <a-divider orientation="left">Business Details</a-divider>

                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="GSTIN" name="gstin">
                            <a-input v-model:value="form.gstin" placeholder="Enter GSTIN" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Facility" name="facility"
                            :rules="[{ required: true, message: 'Please select a facility!' }]">
                            <a-select v-model:value="form.facility" placeholder="Select facility">
                                <a-select-option value="facility-1">Facility 1</a-select-option>
                                <a-select-option value="facility-2">Facility 2</a-select-option>
                                <a-select-option value="facility-3">Facility 3</a-select-option>
                            </a-select>
                        </a-form-item>
                    </a-col>
                </a-row>

                <!-- Company Logo -->
                <a-form-item label="Company Logo" name="logo">
                    <a-upload v-model:file-list="fileList" :before-upload="beforeUpload" :max-count="1"
                        list-type="picture-card" accept="image/*">
                        <div v-if="fileList.length < 1">
                            <PlusOutlined />
                            <div style="margin-top: 8px">Upload</div>
                        </div>
                    </a-upload>
                </a-form-item>

                <!-- Actions -->
                <a-form-item>
                    <div class="flex justify-end space-x-4">
                        <NuxtLink to="/companies">
                            <a-button>Cancel</a-button>
                        </NuxtLink>
                        <a-button type="primary" html-type="submit" :loading="loading">Create Company</a-button>
                    </div>
                </a-form-item>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCompanyStore } from '../../../stores/company'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import type { UploadProps } from 'ant-design-vue'

const router = useRouter()
const store = useCompanyStore()
const loading = computed(() => store.loading)

const form = ref({
    name: '',
    address: '',
    spoc_name: '',
    spoc_email: '',
    spoc_phone: '',
    gstin: '',
    facility: null as string | null,
})

const fileList = ref<UploadProps['fileList']>([])

// Prevent auto upload - we'll handle it manually
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
    return false // Return false to prevent auto upload
}

const handleSubmit = async () => {
    try {
        // Create FormData for file upload
        const formData = new FormData()
        formData.append('name', form.value.name)
        formData.append('address', form.value.address)
        formData.append('spoc_name', form.value.spoc_name)
        formData.append('spoc_email', form.value.spoc_email)
        formData.append('spoc_phone', form.value.spoc_phone)
        if (form.value.gstin) {
            formData.append('gstin', form.value.gstin)
        }
        if (form.value.facility) {
            formData.append('facility', form.value.facility)
        }

        // Add logo file if exists
        if (fileList.value && fileList.value.length > 0) {
            const logoFile = fileList.value[0].originFileObj
            if (logoFile) {
                formData.append('logo', logoFile)
            }
        }

        await store.createCompanyAction(formData as any)
        if (!store.error) {
            message.success('Company created successfully')
            router.push('/companies')
        } else {
            message.error(store.error || 'Failed to create company')
        }
    } catch (e) {
        console.error(e)
        message.error('An error occurred while creating the company')
    }
}
</script>

<style scoped>
/* Dark mode styles for dividers */
:deep(.ant-divider) {
    border-color: #333333;
}

:deep(.ant-divider-inner-text) {
    color: #a3a3a3;
}
</style>
