<template>
    <div class="min-h-screen flex items-center justify-center p-4 bg-neutral-50 dark:bg-neutral-900">
        <a-card class="w-full max-w-md shadow-card">
            <div class="text-center mb-6">
                <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 mb-4">
                    <SafetyOutlined class="text-3xl text-primary-600 dark:text-primary-400" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Privacy Verification</h1>
                <p class="text-neutral-500 mt-2">Please wait while we verify your request.</p>
            </div>

            <!-- Loading -->
            <div v-if="status === 'loading'" class="flex flex-col items-center py-8">
                <a-spin size="large" />
                <p class="mt-4 text-neutral-600 dark:text-neutral-300">Verifying your information...</p>
            </div>

            <!-- Success -->
            <div v-else-if="status === 'success'" class="text-center py-4">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-success-100 dark:bg-success-900 mb-4">
                    <CheckCircleOutlined class="text-2xl text-success-600 dark:text-success-400" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Verified</h2>
                <p class="text-neutral-600 dark:text-neutral-300 mt-2">
                    {{ resultMessage }}
                </p>
                <div v-if="resultDetails" class="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg text-left text-sm">
                    <p v-if="resultDetails.task_type_display">
                        <span class="text-neutral-500">Task:</span> {{ resultDetails.task_type_display }}
                    </p>
                    <p v-if="resultDetails.status_display">
                        <span class="text-neutral-500">Status:</span> {{ resultDetails.status_display }}
                    </p>
                    <div v-if="resultDetails.current" class="mt-2">
                        <span class="text-neutral-500">Updated:</span>
                        <ul class="mt-1 ml-4 list-disc">
                            <li v-for="(value, key) in resultDetails.current" :key="key">
                                {{ key }}: {{ value }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Input Required -->
            <div v-else-if="status === 'input_required'" class="py-4">
                <a-alert v-if="errorMessage" type="error" :message="errorMessage" class="mb-4" show-icon />

                <a-form layout="vertical" @finish="submitWithInput">
                    <a-form-item v-if="requiredField === 'email'" label="New Email Address" name="email"
                        :rules="[{ required: true, type: 'email', message: 'Please enter a valid email' }]">
                        <a-input v-model:value="inputForm.email" placeholder="Enter your new email address" />
                    </a-form-item>

                    <a-form-item v-if="requiredField === 'phone_number'" label="New Phone Number" name="phone_number"
                        :rules="[{ required: true, message: 'Please enter your new phone number' }]">
                        <a-input v-model:value="inputForm.phone_number" placeholder="Enter your new phone number" />
                    </a-form-item>

                    <a-button type="primary" html-type="submit" :loading="submitting" block>
                        Submit
                    </a-button>
                </a-form>
            </div>

            <!-- Error -->
            <div v-else-if="status === 'error'" class="text-center py-4">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-danger-100 dark:bg-danger-900 mb-4">
                    <CloseCircleOutlined class="text-2xl text-danger-600 dark:text-danger-400" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Verification Failed</h2>
                <p class="text-neutral-600 dark:text-neutral-300 mt-2">
                    {{ errorMessage }}
                </p>
                <a-button type="primary" class="mt-6" @click="retry">
                    Try Again
                </a-button>
            </div>

            <!-- Invalid Token -->
            <div v-else-if="status === 'invalid'" class="text-center py-4">
                <div class="inline-flex items-center justify-center w-14 h-14 rounded-full bg-danger-100 dark:bg-danger-900 mb-4">
                    <CloseCircleOutlined class="text-2xl text-danger-600 dark:text-danger-400" />
                </div>
                <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Invalid Link</h2>
                <p class="text-neutral-600 dark:text-neutral-300 mt-2">
                    This verification link is invalid or has expired.
                </p>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
    SafetyOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
} from '@ant-design/icons-vue'

definePageMeta({ layout: 'auth' })

const route = useRoute()
const { submitPublicTask } = usePrivacyRequestService()

type Status = 'loading' | 'success' | 'input_required' | 'error' | 'invalid'

const status = ref<Status>('loading')
const resultMessage = ref('')
const resultDetails = ref<Record<string, any> | null>(null)
const errorMessage = ref('')
const requiredField = ref<'email' | 'phone_number' | null>(null)
const submitting = ref(false)

const inputForm = ref({
    email: '',
    phone_number: '',
})

const getToken = () => {
    return (route.params.token as string) || ''
}

const getQueryPayload = (): { email?: string; phone_number?: string } => {
    const query = route.query
    const payload: { email?: string; phone_number?: string } = {}
    if (query.email) payload.email = String(query.email)
    if (query.phone) payload.phone_number = String(query.phone)
    if (query.phone_number) payload.phone_number = String(query.phone_number)
    return payload
}

const detectRequiredField = (error: any): 'email' | 'phone_number' | null => {
    const details = error?.data?.error?.details || error?.data?.error?.fields
    if (!details) return null
    if (details.email) return 'email'
    if (details.phone_number || details.phone) return 'phone_number'
    return null
}

const extractErrorMessage = (error: any): string => {
    if (error?.data?.message) return error.data.message
    if (error?.data?.error?.details) {
        const details = error.data.error.details
        return Object.values(details).flat().join('. ')
    }
    if (error?.data?.error?.fields) {
        const fields = error.data.error.fields
        return Object.values(fields)
            .flat()
            .map((item: any) => item.message || item)
            .join('. ')
    }
    return 'Something went wrong. Please try again.'
}

const submitTask = async (payload: Record<string, any>) => {
    const token = getToken()
    if (!token) {
        status.value = 'invalid'
        return
    }

    status.value = 'loading'
    errorMessage.value = ''

    try {
        const response = await submitPublicTask(token, payload as any)

        if (response?.success && response.data) {
            status.value = 'success'
            resultMessage.value = response.message || 'Your request has been verified successfully.'
            resultDetails.value = response.data
        } else {
            throw new Error(response?.message || 'Verification failed')
        }
    } catch (error: any) {
        if (error?.response?.status === 404) {
            status.value = 'invalid'
            return
        }

        const field = detectRequiredField(error)
        if (field && status.value !== 'input_required') {
            requiredField.value = field
            status.value = 'input_required'
            errorMessage.value = extractErrorMessage(error)
        } else {
            status.value = 'error'
            errorMessage.value = extractErrorMessage(error)
        }
    }
}

const attemptAutoSubmit = () => {
    const queryPayload = getQueryPayload()

    if (queryPayload.email) {
        submitTask({ email: queryPayload.email })
    } else if (queryPayload.phone_number) {
        submitTask({ phone_number: queryPayload.phone_number })
    } else {
        // Try a confirmation-only payload first; backend will tell us if email/phone is required.
        submitTask({ confirmed: true })
    }
}

const submitWithInput = async () => {
    submitting.value = true
    try {
        if (requiredField.value === 'email') {
            await submitTask({ email: inputForm.value.email })
        } else if (requiredField.value === 'phone_number') {
            await submitTask({ phone_number: inputForm.value.phone_number })
        }
    } finally {
        submitting.value = false
    }
}

const retry = () => {
    inputForm.value = { email: '', phone_number: '' }
    attemptAutoSubmit()
}

onMounted(() => {
    attemptAutoSubmit()
})
</script>
