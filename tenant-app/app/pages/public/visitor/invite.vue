<template>
    <div class="w-full animate-fade-in text-center space-y-6">
        <!-- Back Link -->
        <div class="w-full flex justify-start mb-6">
             <NuxtLink to="/public/visitor" class="inline-flex items-center text-gray-900 hover:text-gray-600 font-bold transition-colors">
                 <LeftOutlined class="mr-1 text-xs" /> Back
             </NuxtLink>
        </div>

        <!-- OTP Entry Step -->
        <template v-if="!verifiedVisitor">
            <div class="pt-6">
                <div class="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-blue-100">
                    <MailFilled class="text-3xl" />
                </div>

                <h1 class="text-2xl font-bold text-gray-900 mb-2">Have an invite?</h1>
                <p class="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                    Enter the 6-digit visitor pass code provided by your host.
                </p>
            </div>

            <div class="py-6">
                 <div class="flex justify-center gap-2 sm:gap-4">
                       <input v-for="i in 6" :key="i" type="tel" inputmode="numeric" maxlength="1" 
                        class="w-11 h-14 sm:w-14 sm:h-16 rounded-xl border border-gray-200 text-center text-2xl font-bold outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all caret-blue-500 bg-white text-gray-900 shadow-sm"
                        :class="otpDigits[i-1] ? 'border-blue-500 bg-blue-50/10' : ''"
                        :value="otpDigits[i-1]"
                        @input="e => handleInput(e, i-1)"
                        @keydown.delete="e => handleBackspace(e, i-1)"
                        @paste="e => handlePaste(e, i-1)"
                        ref="otpInputs"
                      />
                </div>
            </div>

            <div>
                <button class="text-blue-600 font-bold text-sm hover:underline" @click="message.info('Code resent to your email')">
                    Resend Code
                </button>
            </div>

            <div class="pt-8 w-full max-w-xs mx-auto">
                 <button 
                    class="w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    :class="otpDigits.join('').length < 6 ? 'bg-gray-200 text-gray-500' : 'bg-blue-600 !text-white hover:bg-blue-700'"
                    :disabled="otpDigits.join('').length < 6 || loading"
                    @click="verify">
                    <span v-if="loading"><LoadingOutlined class="!text-white" /></span>
                    <span v-else class="!text-white">Check In <ArrowRightOutlined class="ml-1 !text-white" /></span>
                </button>
                <div class="mt-6 text-xs text-gray-400">
                    Don't have a code? <NuxtLink to="/public/visitor/register" class="text-gray-500 underline decoration-gray-300">Search for host manually</NuxtLink>
                </div>
            </div>
        </template>

        <!-- Photo Capture Step -->
        <template v-else>
            <div class="pt-4">
                <div class="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-green-100">
                    <CheckCircleFilled class="text-3xl" />
                </div>
                <h1 class="text-2xl font-bold text-gray-900 mb-2">Verify Your Details</h1>
            </div>

            <!-- Visitor Details Card -->
            <div class="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 text-left mx-4">
                <div class="flex items-center gap-4 mb-4">
                    <div class="w-16 h-16 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
                        <img v-if="capturedPhoto" :src="capturedPhoto" class="w-full h-full object-cover" />
                        <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                            <CameraOutlined class="text-2xl" />
                        </div>
                    </div>
                    <div>
                        <h2 class="font-bold text-gray-900 text-lg">{{ verifiedVisitor.name }}</h2>
                        <p class="text-gray-500 text-sm">{{ verifiedVisitor.phone_number }}</p>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Facility</span>
                        <span class="font-medium text-gray-900">{{ verifiedVisitor.facility_name }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Purpose</span>
                        <span class="font-medium text-gray-900">{{ verifiedVisitor.purpose_of_visit }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Time</span>
                        <span class="font-medium text-gray-900">{{ formatTime(verifiedVisitor.appointment_time) }}</span>
                    </div>
                </div>
            </div>

            <!-- Photo Capture -->
            <div class="py-4">
                <p class="text-gray-500 text-sm mb-4">Take a photo for your visitor pass</p>
                <div class="relative w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-blue-100 bg-gray-50">
                    <video v-if="!capturedPhoto" ref="videoRef" class="w-full h-full object-cover" autoplay playsinline></video>
                    <img v-else :src="capturedPhoto" class="w-full h-full object-cover" />
                </div>
                <button v-if="!capturedPhoto" @click="capturePhoto" class="mt-4 w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg">
                    <CameraOutlined class="text-xl" />
                </button>
                <div v-else class="mt-4 flex justify-center gap-3">
                    <button @click="retakePhoto" class="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm">
                        Retake
                    </button>
                </div>
            </div>

            <div class="pt-4 w-full max-w-xs mx-auto">
                 <button 
                    class="w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                    :disabled="submitting"
                    @click="submitPhoto">
                    <span v-if="submitting"><LoadingOutlined class="!text-white" /></span>
                    <span v-else class="!text-white">Submit & Check In <ArrowRightOutlined class="ml-1 !text-white" /></span>
                </button>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import { MailFilled, LeftOutlined, ArrowRightOutlined, LoadingOutlined, CameraOutlined, CheckCircleFilled } from '@ant-design/icons-vue'


definePageMeta({
    layout: 'public'
})

const router = useRouter()
const store = useVisitorStore()
const loading = ref(false)
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])

const verifiedVisitor = ref<any>(null)
const capturedPhoto = ref<string>('')
const videoRef = ref<HTMLVideoElement | null>(null)
const submitting = ref(false)
const accessToken = ref<string>('')
let mediaStream: MediaStream | null = null

const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
    })
}

const startCamera = async () => {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user' } 
        })
        if (videoRef.value) {
            videoRef.value.srcObject = mediaStream
        }
    } catch (err) {
        message.error('Failed to access camera')
    }
}

const stopCamera = () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
        mediaStream = null
    }
}

const capturePhoto = () => {
    if (!videoRef.value) return
    
    const canvas = document.createElement('canvas')
    canvas.width = videoRef.value.videoWidth
    canvas.height = videoRef.value.videoHeight
    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.drawImage(videoRef.value, 0, 0)
        capturedPhoto.value = canvas.toDataURL('image/jpeg', 0.8)
        stopCamera()
    }
}

const retakePhoto = () => {
    capturedPhoto.value = ''
    startCamera()
}

onUnmounted(() => {
    stopCamera()
})

const handleInput = (e: Event, index: number) => {
    const val = (e.target as HTMLInputElement).value
    if (!/^\d*$/.test(val)) return
    
    // Fill current digit
    otpDigits.value[index] = val.slice(-1)
    
    // Auto-focus next
    if (val && index < 5) {
        otpInputs.value[index + 1]?.focus()
    }
}

const handleBackspace = (e: KeyboardEvent, index: number) => {
    if (!otpDigits.value[index] && index > 0) {
        otpDigits.value[index - 1] = ''
        otpInputs.value[index - 1]?.focus()
    } else {
        otpDigits.value[index] = ''
    }
}

const handlePaste = (e: ClipboardEvent, index: number) => {
    e.preventDefault()
    const pasteData = e.clipboardData?.getData('text')
    if (!pasteData) return
    
    const digits = pasteData.replace(/\D/g, '').slice(0, 6)
    if (digits.length === 0) return
    
    for (let i = 0; i < digits.length; i++) {
        otpDigits.value[i] = digits[i]
    }
    
    if (digits.length < 6 && otpInputs.value[digits.length]) {
        otpInputs.value[digits.length]?.focus()
    } else if (otpInputs.value[5]) {
        otpInputs.value[5]?.focus()
    }
}

const verify = async () => {
    const code = otpDigits.value.join('')
    if (code.length < 6) return

    loading.value = true
    try {
        const { $api } = useNuxtApp()
        const response = await $api<any>('/api/portal/visitors/public/passcode/verify/', {
            method: 'POST',
            body: { passcode: code }
        })

        if (response.success && response.data) {
            verifiedVisitor.value = response.data.visitor
            accessToken.value = response.data.access
            message.success('Invite Verified')
            await startCamera()
        } else {
            throw new Error(response.message || 'Invalid Passcode')
        }
    } catch (e: any) {
        message.error(e?.response?.data?.message || 'Invalid or Expired Passcode')
        otpDigits.value = ['', '', '', '', '', '']
        otpInputs.value[0]?.focus()
    } finally {
        loading.value = false
    }
}

const submitPhoto = async () => {
    if (!capturedPhoto.value) {
        message.error('Please take a photo')
        return
    }

    submitting.value = true
    try {
        const { $api } = useNuxtApp()
        
        const base64Data = capturedPhoto.value.split(',')[1]
        const blob = await fetch(`data:image/jpeg;base64,${base64Data}`).then(r => r.blob())
        
        const formData = new FormData()
        formData.append('image', blob, 'photo.jpg')
        formData.append('status', 'Approved')

        const response = await $api<any>(`/api/portal/visitors/public/visitors/${verifiedVisitor.value.id}/`, {
            method: 'PATCH',
            body: formData,
            headers: {
                Authorization: `Bearer ${accessToken.value}`
            }
        })

        if (response.success) {
            store.currentVisitor = { ...verifiedVisitor.value, photoUrl: capturedPhoto.value }
            message.success('Check-in successful!')
            router.push('/public/visitor/pass')
        } else {
            throw new Error(response.message || 'Failed to submit')
        }
    } catch (e: any) {
        message.error(e?.response?.data?.message || 'Failed to submit photo')
    } finally {
        submitting.value = false
    }
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.4s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
