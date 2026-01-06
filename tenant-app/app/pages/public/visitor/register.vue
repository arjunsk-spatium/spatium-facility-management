<template>
    <div class="w-full flex-1 flex flex-col relative min-h-[400px]">
        <!-- Back Button (visible except Step 1/Success) -->
        <!-- Back Button (visible except Step 1/Success) -->
        <div v-if="step > 1 && step < 5" class="absolute top-0 left-0 z-10 w-full">
            <button @click="step--" class="flex items-center text-gray-800 hover:text-gray-900 font-bold text-base bg-transparent p-2 -ml-2">
                <ArrowLeftOutlined class="mr-2" /> Back
            </button>
        </div>

        <!-- Step 1: Phone Number -->
        <div v-if="step === 1" class="space-y-8 animate-fade-in pt-12">
             <div class="text-center space-y-2">
                <h1 class="text-2xl font-bold text-gray-900">Welcome Visitor</h1>
                <p class="text-gray-500 text-sm">Enter your mobile number to receive a verification code for secure access.</p>
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">Phone Number</label>
                <div class="flex h-14 rounded-xl border border-blue-500 ring-2 ring-blue-100 overflow-hidden bg-white">
                    <div class="w-24 border-r border-gray-100 flex items-center justify-center bg-gray-50 px-2 cursor-pointer hover:bg-gray-100">
                         <span class="mr-2 text-xl">🇺🇸</span>
                         <span class="font-medium text-gray-700">+1</span>
                         <DownOutlined class="ml-2 text-xs text-gray-400" />
                    </div>
                    <input type="tel" v-model="formState.phone" placeholder="(555) 000-0000" 
                        class="flex-1 px-4 text-lg outline-none w-full bg-transparent text-gray-900 placeholder:text-gray-400"
                         @keyup.enter="sendOtp"
                         autofocus />
                     <div v-if="formState.phone" @click="formState.phone = ''" class="flex items-center px-4 cursor-pointer text-gray-400 hover:text-gray-600">
                        <CloseCircleFilled />
                     </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">
                    We will send a 4-digit code to verify your identity. Standard message and data rates may apply.
                </p>
            </div>

            <a-button type="primary" block size="large" class="h-12 text-lg font-medium rounded-xl shadow-lg shadow-blue-500/20" 
                :loading="loading" @click="sendOtp">
                Send Verification Code
            </a-button>
        </div>

        <!-- Step 2: OTP Verification -->
        <div v-else-if="step === 2" class="space-y-8 text-center animate-fade-in pt-12">
            <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-6">
                <LockFilled class="text-2xl" />
            </div>

            <div class="space-y-2">
                <h1 class="text-2xl font-bold text-gray-900">Verify Phone Number</h1>
                 <p class="text-gray-500 text-sm">
                    We've sent a 4-digit code to <br/>
                    <span class="font-bold text-gray-900">{{ formState.phone }}</span> 
                    <a @click="step=1" class="ml-1 text-blue-600 font-bold cursor-pointer">Edit</a>
                </p>
            </div>

            <div class="flex justify-center gap-4 py-4">
                 <input v-for="i in 4" :key="i" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1" 
                    class="w-14 h-14 rounded-xl border border-gray-200 text-center text-2xl font-bold outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-100 transition-all caret-blue-500 bg-white text-gray-900"
                    :value="otpDigits[i-1]"
                    @input="e => handleOtpInput(e, i-1)"
                    @keydown.delete="e => handleOtpBackspace(e, i-1)"
                    ref="otpInputs"
                 />
            </div>

            <p class="text-sm text-gray-400">
                Didn't receive a code? <a class="text-gray-400 cursor-not-allowed">Resend in 00:30</a>
            </p>

            <button 
                class="w-full h-12 rounded-xl bg-green-500 !text-white font-bold text-lg hover:bg-green-600 transition-colors shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
                :disabled="loading"
                @click="verifyOtpCode">
                <span v-if="loading"><LoadingOutlined class="!text-white" /></span>
                <span v-else class="!text-white">Verify <CheckCircleFilled class="ml-1 !text-white" /></span>
            </button>
        </div>

        <!-- Step 3: Visitor Details Form -->
        <div v-else-if="step === 3" class="space-y-6 animate-fade-in pt-12">
             <div class="text-center space-y-2 mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Welcome to Innovation Corp</h1>
                <p class="text-gray-500 text-sm">Please enter your details to obtain your visitor badge.</p>
            </div>



             <!-- Photo Upload -->
            <div class="text-center mb-6">
                 <div class="relative w-24 h-24 mx-auto mb-2">
                     <div class="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden"
                        @click="showCamera = true">
                        <img v-if="profilePhoto" :src="profilePhoto" class="w-full h-full object-cover" />
                        <CameraFilled v-else class="text-2xl text-gray-400" />
                     </div>
                     <div class="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
                         <PlusOutlined class="text-xs text-blue-500" />
                     </div>
                 </div>
                 <span class="text-xs text-gray-500 font-medium">Add Profile Photo</span>
            </div>

            <div class="space-y-4">
                <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Full Name</label>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <UserOutlined class="text-gray-400" />
                        </div>
                        <input v-model="formState.name" type="text" placeholder="e.g. Sarah Williams" autocomplete="off"
                            class="block w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none input-no-icon" />
                     </div>
                </div>

                 <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Email Address</label>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MailOutlined class="text-gray-400" />
                        </div>
                        <input v-model="formState.email" type="email" placeholder="sarah@example.com" 
                            class="block w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                     </div>
                </div>

                <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Company / Organization</label>
                     <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BankOutlined class="text-gray-400" />
                        </div>
                        <input v-model="formState.company" type="text" placeholder="Where are you visiting from?" 
                            class="block w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                     </div>
                </div>
                
                 <div>
                     <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Purpose of Visit</label>
                     <div class="relative">
                        <select v-model="formState.visitPurpose" 
                            class="block w-full px-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                            <option :value="undefined" disabled selected>Select purpose...</option>
                            <option v-for="option in purposeOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                        <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <DownOutlined class="text-xs" />
                        </div>
                     </div>
                </div>
            </div>

            <div v-if="hasPrePopulatedData" class="flex justify-center items-center gap-2 mb-4">
                <span class="text-sm text-gray-500">Not you?</span> 
                <button @click="clearForm" class="text-sm text-gray-900 font-bold hover:underline transition-all">
                     Clear form
                </button>
            </div>

            <a-button type="primary" block size="large" class="h-12 text-lg font-medium rounded-xl shadow-lg shadow-blue-500/20" 
                @click="step = 4">
                Continue &rarr;
            </a-button>

            <div class="text-center text-xs text-gray-400 px-4 mt-6">
                By checking in, you agree to our <a class="text-blue-600">Privacy Policy</a> and <a class="text-blue-600">Visitor Terms</a>.
            </div>
        </div>

        <!-- Step 4: Host Selection -->
        <div v-else-if="step === 4" class="animate-fade-in">
             <HostSelection 
                v-model="formState.selectedHost" 
                @confirm="handleFinish"
                @manual-entry="message.info('Manual entry not implemented')"
                @change-company="message.info('Change company not implemented')"
            />
        </div>

        <!-- Camera Modal -->
        <a-modal v-model:open="showCamera" :footer="null" :closable="false" width="100%" wrap-class-name="full-screen-modal" destroy-on-close>
            <div class="h-[80vh] bg-black relative rounded-2xl overflow-hidden">
                 <CameraCapture @capture="handleCapture" @close="showCamera = false" />
                 <button @click="showCamera = false" class="absolute top-4 right-4 text-white hover:text-gray-300 z-50 bg-black/50 rounded-full p-2">
                    <CloseCircleFilled class="text-2xl" />
                 </button>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
    ArrowLeftOutlined, DownOutlined, CloseCircleFilled, LockFilled, 
    CheckCircleFilled, CameraFilled, PlusOutlined, UserOutlined, 
    MailOutlined, BankOutlined, LoadingOutlined 
} from '@ant-design/icons-vue'

import HostSelection from '../../../../components/visitors/HostSelection.vue'
import CameraCapture from '../../../../components/common/CameraCapture.vue'

definePageMeta({
    layout: 'public'
})

const router = useRouter()
const { verifyOtp } = useVisitorService()
const store = useVisitorStore()

const step = ref(1)
const loading = ref(false)
const otpDigits = ref(['', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const showCamera = ref(false)
const profilePhoto = ref<string | null>(null)

const formState = reactive({
    phone: '',
    name: '',
    email: '',
    company: '',
    visitPurpose: undefined,
    selectedHost: null as any
})

const purposeOptions = [
    { value: 'Meeting', label: 'Meeting' },
    { value: 'Interview', label: 'Interview' },
    { value: 'Delivery', label: 'Delivery' },
    { value: 'Site Visit', label: 'Site Visit' },
    { value: 'Other', label: 'Other' },
]

// OTP Input Handling
const handleOtpInput = (e: Event, index: number) => {
    const val = (e.target as HTMLInputElement).value
    if (!/^\d*$/.test(val)) return
    
    otpDigits.value[index] = val.slice(-1)
    
    if (val && index < 3) {
        otpInputs.value[index + 1]?.focus()
    }
}

const handleOtpBackspace = (e: KeyboardEvent, index: number) => {
    if (!otpDigits.value[index] && index > 0) {
        otpDigits.value[index - 1] = ''
        otpInputs.value[index - 1]?.focus()
    } else {
        otpDigits.value[index] = ''
    }
}

const sendOtp = async () => {
    if (!formState.phone) return
    loading.value = true
    setTimeout(() => {
        loading.value = false
        step.value = 2
        nextTick(() => otpInputs.value[0]?.focus())
    }, 800)
}

const verifyOtpCode = async () => {
    const code = otpDigits.value.join('')
    if (code.length < 4) return
    
    loading.value = true
    const isValid = await verifyOtp(formState.phone, code) // Mocking 1234
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
        await store.registerWalkIn({
            phone: formState.phone,
            name: formState.name,
            email: formState.email,
            company: formState.company,
            visitPurpose: formState.visitPurpose,
            hostName: formState.selectedHost?.name || 'Reception'
        })
        message.success('Registration Submitted')
        router.push('/public/visitor/status')
    } catch (e) {
        message.error('Registration Failed')
    } finally {
        loading.value = false
    }
}

const hasPrePopulatedData = computed(() => {
    return !!(formState.name || formState.email || formState.company)
})

const clearForm = () => {
    formState.name = ''
    formState.email = ''
    formState.company = ''
    formState.visitPurpose = undefined
    profilePhoto.value = null
}

const handleCapture = (image: string) => {
    profilePhoto.value = image
    showCamera.value = false
}
</script>

<style scoped>
/* WebKit (Chrome/Safari/Edge) specific fix for auto-fill icon */
input::-webkit-calendar-picker-indicator {
    display: none !important;
    opacity: 0;
}

.input-no-icon::-webkit-calendar-picker-indicator,
.input-no-icon::-webkit-list-button {
    display: none !important;
}

.animate-fade-in {
    animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
