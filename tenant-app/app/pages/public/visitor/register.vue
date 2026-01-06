<template>
    <div class="space-y-6">
        <div class="text-center">
            <h2 class="text-xl font-semibold dark:text-white">Visitor Registration</h2>
            <p class="text-gray-500 text-sm">Please fill in your details to get a pass.</p>
        </div>

        <a-form layout="vertical" :model="formState" @finish="handleFinish">
            <!-- Step 1: Phone & OTP -->
            <template v-if="step === 1">
                <a-form-item label="Phone Number" name="phone"
                    :rules="[{ required: true, message: 'Please enter phone number' }]">
                    <a-input v-model:value="formState.phone" placeholder="+1234567890" size="large">
                        <template #prefix>
                            <PhoneOutlined />
                        </template>
                    </a-input>
                </a-form-item>

                <a-button type="primary" block size="large" @click="sendOtp" :loading="loading">
                    Verify Phone
                </a-button>
            </template>

            <!-- Step 2: OTP Verification -->
            <template v-else-if="step === 2">
                <a-alert type="info" message="OTP sent to your phone (Use 1234)" show-icon class="mb-4" />
                <a-form-item label="Enter OTP" name="otp" :rules="[{ required: true, message: 'Please enter OTP' }]">
                    <a-input v-model:value="formState.otp" placeholder="1234" size="large"
                        style="text-align: center; letter-spacing: 4px;" maxLength="4" />
                </a-form-item>

                <a-button type="primary" block size="large" @click="verifyOtpCode" :loading="loading">
                    Confirm OTP
                </a-button>
                <div class="text-center mt-2">
                    <a type="link" @click="step = 1">Change Number</a>
                </div>
            </template>

            <!-- Step 3: Details Form -->
            <template v-else>
                <div class="text-center mb-6">
                    <!-- Captured Image Preview -->
                    <div v-if="capturedPhoto" class="relative mx-auto w-32 h-32 mb-4">
                        <img :src="capturedPhoto"
                            class="w-full h-full object-cover rounded-full border-4 border-gray-200" />
                        <a-button type="default" shape="circle" size="small" class="absolute bottom-0 right-0 shadow-md"
                            @click="openCamera">
                            <CameraOutlined />
                        </a-button>
                    </div>

                    <!-- Take Photo Button -->
                    <div v-else class="mb-4">
                        <div class="w-24 h-24 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3 cursor-pointer hover:bg-gray-200 transition-colors"
                            @click="openCamera">
                            <CameraOutlined class="text-3xl text-gray-400" />
                        </div>
                        <a-button @click="openCamera">Take Photo</a-button>
                    </div>
                </div>

                <!-- Camera Overlay -->
                <div v-if="showCamera" class="camera-overlay">
                    <div class="absolute top-4 right-4 z-50">
                        <a-button shape="circle" size="large" @click="showCamera = false">
                            X
                        </a-button>
                    </div>
                    <CameraCapture @capture="handleCapture" />
                </div>

                <a-form-item label="Full Name" name="name" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.name" placeholder="John Doe" />
                </a-form-item>

                <a-form-item label="Email (Optional)" name="email">
                    <a-input v-model:value="formState.email" placeholder="john@example.com" />
                </a-form-item>

                <a-form-item label="Company Visiting" name="company" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.company" placeholder="Tech Corp" />
                </a-form-item>

                <a-form-item label="Host Name" name="hostName" :rules="[{ required: true }]">
                    <a-input v-model:value="formState.hostName" placeholder="Host Name" />
                </a-form-item>

                <a-form-item label="Purpose" name="visitPurpose" :rules="[{ required: true }]">
                    <a-select v-model:value="formState.visitPurpose">
                        <a-select-option value="Meeting">Meeting</a-select-option>
                        <a-select-option value="Interview">Interview</a-select-option>
                        <a-select-option value="Delivery">Delivery</a-select-option>
                        <a-select-option value="Other">Other</a-select-option>
                    </a-select>
                </a-form-item>

                <a-button type="primary" html-type="submit" block size="large" :loading="loading">
                    Get Pass
                </a-button>
            </template>
        </a-form>

        <div v-if="step === 1" class="text-center">
            <NuxtLink to="/public/visitor" class="text-gray-500 text-sm">Cancel</NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { PhoneOutlined, CameraOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'





definePageMeta({
    layout: 'public'
})

const router = useRouter()
const { verifyOtp } = useVisitorService()
const store = useVisitorStore()

const step = ref(1)
const loading = ref(false)
const formState = reactive({
    phone: '',
    otp: '',
    name: '',
    email: '',
    company: '',
    hostName: '',
    visitPurpose: 'Meeting'
})

const showCamera = ref(false)
const capturedPhoto = ref<string | null>(null)

const openCamera = () => {
    showCamera.value = true
}

const handleCapture = (image: string) => {
    capturedPhoto.value = image
    // In a real scenario, you might want to convert base64 to File for upload
    // For now, we keep it as base64 or you can add logic to convert it.
    // formState.image = image // Example if you want to store it
    showCamera.value = false
}

const sendOtp = async () => {
    if (!formState.phone) return
    loading.value = true
    // Simulate generic "sent"
    setTimeout(() => {
        loading.value = false
        step.value = 2
    }, 500)
}

const verifyOtpCode = async () => {
    if (!formState.otp) return
    loading.value = true
    const isValid = await verifyOtp(formState.phone, formState.otp)
    loading.value = false

    if (isValid) {
        step.value = 3
    } else {
        message.error('Invalid OTP')
    }
}

const handleFinish = async () => {
    loading.value = true
    try {
        // Prepare payload - usually involves uploading the image first or sending base64
        const registrationData = {
            ...formState,
            photo: capturedPhoto.value
        }
        await store.registerWalkIn(registrationData)
        message.success('Registration Successful')
        router.push('/public/visitor/pass')
    } catch (e) {
        message.error('Registration Failed')
    } finally {
        loading.value = false
    }
}
</script>

<style scoped>
/* Full screen camera overlay */
.camera-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 1000;
    background: black;
}
</style>
