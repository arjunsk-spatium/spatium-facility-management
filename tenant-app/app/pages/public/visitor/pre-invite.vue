<template>
    <div class="w-full flex-1 flex flex-col relative min-h-[400px]">
        <div class="w-full flex justify-start mb-4 mt-6">
            <NuxtLink to="/public/visitor" class="inline-flex items-center text-gray-900 hover:text-gray-600 font-bold text-base transition-colors">
                <LeftOutlined class="mr-1 text-xs" /> Back
            </NuxtLink>
        </div>

        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <LoadingOutlined class="text-3xl text-blue-600 mb-4" />
            <p class="text-gray-500 text-sm">Processing your pre-invite...</p>
        </div>

        <div v-else-if="success" class="space-y-8 animate-fade-in pt-8">
            <div class="text-center">
                <div class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-6">
                    <CheckCircleFilled class="text-4xl" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900">Pre-Invite Created!</h1>
                <p class="text-gray-500 text-sm max-w-xs mx-auto mt-2">
                    Your visitor pass has been sent to your email.
                </p>
            </div>

            <div class="bg-white p-6 rounded-xl border border-gray-100 shadow-sm max-w-sm mx-auto">
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Name</span>
                        <span class="font-medium text-gray-900">{{ formData.name }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Phone</span>
                        <span class="font-medium text-gray-900">+91 {{ formData.phone }}</span>
                    </div>
                    <div v-if="formData.email" class="flex justify-between">
                        <span class="text-gray-500">Email</span>
                        <span class="font-medium text-gray-900">{{ formData.email }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Date</span>
                        <span class="font-medium text-gray-900">{{ formData.appointment_date }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Time</span>
                        <span class="font-medium text-gray-900">{{ formData.appointment_time }}</span>
                    </div>
                </div>
            </div>

            <div class="text-center">
                <NuxtLink to="/public/visitor" class="text-blue-600 font-bold hover:underline">
                    Back to Home
                </NuxtLink>
            </div>
        </div>

        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <ExclamationCircleOutlined class="text-3xl" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">Error</h2>
            <p class="text-gray-500 text-sm text-center max-w-xs">{{ error }}</p>
            <button @click="retry" class="text-blue-600 font-bold hover:underline">
                Try Again
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { LeftOutlined, LoadingOutlined, CheckCircleFilled, ExclamationCircleOutlined } from '@ant-design/icons-vue'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const { preInvite } = usePublicVisitorService()

const loading = ref(false)
const success = ref(false)
const error = ref<string | null>(null)

const formData = reactive({
    facility_id: '',
    purpose_of_visit_id: '',
    name: '',
    phone: '',
    email: '',
    appointment_date: '',
    appointment_time: ''
})

onMounted(() => {
    formData.facility_id = route.query.facility_id as string || ''
    formData.purpose_of_visit_id = route.query.purpose_of_visit_id as string || ''
    formData.name = route.query.name as string || ''
    formData.phone = route.query.phone as string || ''
    formData.email = route.query.email as string || ''
    formData.appointment_date = route.query.appointment_date as string || ''
    formData.appointment_time = route.query.appointment_time as string || ''

    if (!formData.facility_id || !formData.name || !formData.phone || !formData.appointment_date || !formData.appointment_time) {
        error.value = 'Missing required parameters. Please check your link.'
        return
    }

    submitPreInvite()
})

const submitPreInvite = async () => {
    loading.value = true
    error.value = null
    try {
        await preInvite({
            facility_id: formData.facility_id,
            purpose_of_visit_id: formData.purpose_of_visit_id || '00000000-0000-0000-0000-000000000001',
            name: formData.name,
            phone: formData.phone,
            email: formData.email || undefined,
            appointment_date: formData.appointment_date,
            appointment_time: formData.appointment_time
        })
        success.value = true
    } catch (e: any) {
        error.value = e?.data?.message || e?.message || 'Failed to create pre-invite. Please try again.'
    } finally {
        loading.value = false
    }
}

const retry = () => {
    submitPreInvite()
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(5px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>