<template>
    <div class="w-full flex-1 flex flex-col relative min-h-[400px]">
        <!-- Back Button (Step 1 to 3) -->
        <div v-if="step > 0 && step < 4" class="w-full flex justify-start mb-4 mt-6">
            <button @click="step--"
                class="inline-flex items-center text-gray-900 hover:text-gray-600 font-bold text-base transition-colors">
                <LeftOutlined class="mr-1 text-xs" /> Back
            </button>
        </div>

        <!-- Step 0: Visitor Type Selection -->
        <div v-if="step === 0" class="space-y-8 animate-fade-in pt-8">
            <div class="text-center space-y-2 mb-8">
                <h1 class="text-3xl font-bold text-gray-900 leading-tight">
                    Welcome to <br />
                    <span class="text-blue-600">{{ tenantStore.tenantName || 'Our Facility' }}</span>
                </h1>
                <p class="text-gray-500 text-sm max-w-xs mx-auto">
                    Please select an option below to begin your check-in process.
                </p>
            </div>

            <div class="space-y-4 max-w-sm mx-auto">
                <button @click="step = 1" class="w-full relative group block text-left">
                    <div
                        class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <UserAddOutlined class="text-xl" />
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900">Walk-in Visitor</h3>
                                <p class="text-xs text-gray-500">Register at the front desk</p>
                            </div>
                        </div>
                        <div
                            class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                            <RightOutlined />
                        </div>
                    </div>
                </button>

                <NuxtLink :to="`/public/visitor/invite?facility_id=${facilityId}&tenant=${tenantId}`"
                    class="block w-full text-left group">
                    <div
                        class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-purple-100 hover:shadow-md transition-all flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div
                                class="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <QrcodeOutlined class="text-xl" />
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900">Pre-invited Visitor</h3>
                                <p class="text-xs text-gray-500">Have an invite code?</p>
                            </div>
                        </div>
                        <div
                            class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-purple-50 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                            <RightOutlined />
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </div>

        <!-- Step 1: Phone Number -->
        <div v-if="step === 1" class="space-y-8 animate-fade-in">
            <div class="text-center space-y-2">
                <h1 class="text-2xl font-bold text-gray-900">Welcome Visitor</h1>
                <p class="text-gray-500 text-sm">Enter your mobile number to receive a verification code.</p>
            </div>

            <div class="space-y-2">
                <label class="block text-sm font-bold text-gray-700">Phone Number</label>
                <div class="flex h-14 rounded-xl border border-blue-500 ring-2 ring-blue-100 overflow-hidden bg-white">
                    <div class="w-24 flex items-center justify-center bg-gray-50 px-2 cursor-default shrink-0">
                        <span class="mr-2 text-xl">🇮🇳</span>
                        <span class="font-bold text-gray-700">+91</span>
                    </div>
                    <div class="w-px h-full bg-gray-100 my-auto py-2 bg-clip-content shrink-0"></div>
                    <input type="tel" v-model="formState.phone" placeholder="98xxx xxxxx"
                        class="flex-1 px-4 text-lg outline-none w-full bg-transparent text-gray-900 placeholder:text-gray-400"
                        @keyup.enter="sendOtp" autofocus />
                    <div v-if="formState.phone" @click="formState.phone = ''"
                        class="flex items-center px-4 cursor-pointer text-gray-400 hover:text-gray-600 shrink-0">
                        <CloseCircleFilled />
                    </div>
                </div>
                <p class="text-xs text-gray-400 mt-2">
                    We will send a verification code to your phone. Standard message and data rates may apply.
                </p>
            </div>

            <button class="w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg 
                       bg-blue-600 !text-white shadow-blue-500/20 hover:bg-blue-700 
                       disabled:bg-gray-100 disabled:!text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                :disabled="loading || !formState.phone || formState.phone.length < 10" @click="sendOtp">
                <span v-if="loading">
                    <LoadingOutlined class="text-inherit" />
                </span>
                <span v-else>Send Verification Code</span>
            </button>
        </div>

        <!-- Step 2: OTP Verification -->
        <div v-else-if="step === 2" class="space-y-8 text-center animate-fade-in pt-12">
            <div class="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto text-blue-600 mb-6">
                <LockFilled class="text-2xl" />
            </div>

            <div class="space-y-2">
                <h1 class="text-2xl font-bold text-gray-900">Verify Phone Number</h1>
                <p class="text-gray-500 text-sm">
                    We've sent a verification code to <br />
                    <span class="font-bold text-gray-900">+91 {{ formState.phone }}</span>
                    <a @click="step = 1" class="ml-1 text-blue-600 font-bold cursor-pointer">Edit</a>
                </p>
            </div>

            <div class="flex justify-center gap-4 py-4">
                <input v-for="i in 6" :key="i" type="tel" inputmode="numeric" pattern="[0-9]*" maxlength="1"
                    class="w-12 h-14 rounded-xl border border-gray-200 text-center text-2xl font-bold outline-none ring-2 ring-transparent focus:border-blue-500 focus:ring-blue-100 transition-all caret-blue-500 bg-white text-gray-900"
                    :value="otpDigits[i - 1]" @input="e => handleOtpInput(e, i - 1)"
                    @keydown.delete="e => handleOtpBackspace(e, i - 1)" @paste="handleOtpPaste" ref="otpInputs" />
            </div>

            <p class="text-sm text-gray-400">
                Didn't receive a code?
                <button :disabled="!canResendOtp" @click="resendOtp"
                    :class="canResendOtp ? 'text-blue-600 hover:underline cursor-pointer font-medium' : 'text-gray-400 cursor-not-allowed'">
                    {{ canResendOtp ? 'Resend Code' : `Resend in ${formatResendTimer}` }}
                </button>
            </p>

            <button class="w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg 
                       bg-blue-600 !text-white shadow-blue-500/20 hover:bg-blue-700 
                       disabled:bg-gray-100 disabled:!text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                :disabled="loading || otpDigits.join('').length < 6" @click="verifyOtpCode">
                <span v-if="loading">
                    <LoadingOutlined class="text-inherit" />
                </span>
                <span v-else class="flex items-center">
                    Verify
                    <CheckCircleFilled class="ml-1 text-inherit" />
                </span>
            </button>
        </div>

        <!-- Step 3: Visitor Details Form -->
        <div v-else-if="step === 3" class="space-y-6 animate-fade-in pt-4">
            <div class="text-center space-y-2 mb-6">
                <h1 class="text-2xl font-bold text-gray-900">Welcome to {{ tenantStore.tenantName }}</h1>
                <p class="text-gray-500 text-sm">Please enter your details to obtain your visitor badge.</p>
            </div>

            <!-- Photo Upload -->
            <div class="text-center mb-6">
                <div class="relative w-24 h-24 mx-auto mb-2" @click="showCamera = true">
                    <div class="w-full h-full rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors overflow-hidden">
                        <img v-if="profilePhotoPreview" :src="profilePhotoPreview" class="w-full h-full object-cover" />
                        <CameraFilled v-else class="text-2xl text-gray-400" />
                    </div>
                    <div
                        class="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center border border-gray-100">
                        <PlusOutlined class="text-xs text-blue-500" />
                    </div>
                </div>
                <span class="text-xs text-gray-500 font-medium">Add Profile Photo</span>
            </div>

            <div class="space-y-4">
                <!-- Full Name -->
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

                <!-- Email -->
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

                <!-- Visitor's Company (from_company) -->
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Your Company /
                        Organization</label>
                    <div class="relative">
                        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <BankOutlined class="text-gray-400" />
                        </div>
                        <input v-model="formState.fromCompany" type="text" placeholder="Where are you visiting from?"
                            class="block w-full pl-10 pr-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all" />
                    </div>
                </div>

                <!-- Purpose of Visit -->
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Purpose of Visit</label>
                    <div class="relative">
                        <select v-model="formState.purposeOfVisitId"
                            class="block w-full px-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                            <option :value="''" disabled selected>Select purpose...</option>
                            <option v-for="purpose in purposes" :key="purpose.id" :value="purpose.id">
                                {{ purpose.name }}
                            </option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <DownOutlined class="text-xs" />
                        </div>
                    </div>
                </div>

                <!-- Company to Visit -->
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Company to Visit</label>
                    <div class="relative">
                        <select v-model="formState.companyId"
                            class="block w-full px-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none">
                            <option :value="''" disabled selected>Select company...</option>
                            <option v-for="company in companies" :key="company.id" :value="company.id">
                                {{ company.name }}
                            </option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <DownOutlined class="text-xs" />
                        </div>
                    </div>
                </div>

                <!-- Host / Person to Meet -->
                <div>
                    <label class="block text-xs font-bold text-gray-700 uppercase mb-1">Person to Meet</label>
                    <div class="relative">
                        <select v-model="formState.hostUserId" :disabled="!formState.companyId || loadingHosts"
                            class="block w-full px-4 h-12 rounded-lg border border-gray-200 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all appearance-none disabled:bg-gray-50 disabled:text-gray-400">
                            <option :value="''" disabled selected>{{ loadingHosts ? 'Loading...' : (formState.companyId
                                ? 'Select person...' : 'Select company first') }}</option>
                            <option v-for="user in companyUsers" :key="user.id" :value="user.id">
                                {{ user.full_name }} ({{ user.email }})
                            </option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
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

            <button class="w-full h-12 rounded-xl font-bold text-lg flex items-center justify-center transition-all shadow-lg 
                       bg-blue-600 !text-white shadow-blue-500/20 hover:bg-blue-700 
                       disabled:bg-gray-100 disabled:!text-gray-400 disabled:shadow-none disabled:cursor-not-allowed"
                :disabled="loading || !isFormValid" @click="handleSubmit">
                <span v-if="loading">
                    <LoadingOutlined class="text-inherit" />
                </span>
                <span v-else>Submit Registration &rarr;</span>
            </button>

            <div class="text-center text-xs text-gray-400 px-4 mt-6">
                By checking in, you agree to our <a class="text-blue-600">Privacy Policy</a> and <a
                    class="text-blue-600">Visitor Terms</a>.
            </div>
        </div>

        <!-- Step 4: Success -->
        <div v-else-if="step === 4" class="space-y-6 text-center animate-fade-in pt-16">
            <div
                class="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 mb-4">
                <CheckCircleFilled class="text-4xl" />
            </div>
            <h1 class="text-2xl font-bold text-gray-900">Registration Submitted!</h1>
            <p class="text-gray-500 text-sm max-w-xs mx-auto">
                Your walk-in request has been submitted. Please wait while we process your registration.
            </p>
            <NuxtLink to="/public/visitor/status">
                <a-button type="primary" block size="large" class="h-12 text-lg font-medium rounded-xl mt-4">
                    View Status
                </a-button>
            </NuxtLink>
        </div>

        <!-- Camera Modal -->
        <Teleport to="body">
            <div v-if="showCamera"
                class="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
                <ClientOnly>
                    <CameraCapture @capture="handlePhotoCapture" @close="showCamera = false" />
                </ClientOnly>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
    LeftOutlined, DownOutlined, CloseCircleFilled, LockFilled,
    CheckCircleFilled, CameraFilled, PlusOutlined, UserOutlined,
    MailOutlined, BankOutlined, LoadingOutlined, UserAddOutlined,
    QrcodeOutlined, RightOutlined
} from '@ant-design/icons-vue'
import CameraCapture from '../../../../components/common/CameraCapture.vue'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const router = useRouter()
const tenantStore = useTenantStore()
const {
    requestOtp, verifyOtp, getMe,
    getPurposesOfVisit, getCompanies, getCompanyUsers, createWalkIn
} = usePublicVisitorService()

const facilityId = computed(() => (route.query.facility_id as string) || '')
const tenantId = computed(() => (route.query.tenant as string) || '')

const step = ref(0)
const loading = ref(false)
const loadingHosts = ref(false)
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])
const profilePhotoFile = ref<File | null>(null)
const profilePhotoPreview = ref<string | null>(null)
const showCamera = ref(false)

// Dropdown data
const purposes = ref<PurposeOfVisit[]>([])
const companies = ref<PublicCompany[]>([])
const companyUsers = ref<CompanyUser[]>([])

// OTP Resend Timer
const resendCooldown = ref(0)
let resendInterval: ReturnType<typeof setInterval> | null = null

const canResendOtp = computed(() => resendCooldown.value === 0)

const formatResendTimer = computed(() => {
    const minutes = Math.floor(resendCooldown.value / 60)
    const seconds = resendCooldown.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
})

const startResendTimer = () => {
    resendCooldown.value = 30
    if (resendInterval) clearInterval(resendInterval)
    resendInterval = setInterval(() => {
        if (resendCooldown.value > 0) {
            resendCooldown.value--
        } else {
            if (resendInterval) clearInterval(resendInterval)
        }
    }, 1000)
}

const formState = reactive({
    phone: '',
    name: '',
    email: '',
    fromCompany: '',
    purposeOfVisitId: '',
    companyId: '',
    hostUserId: '',
})

const isFormValid = computed(() => {
    return !!(
        formState.name &&
        formState.purposeOfVisitId &&
        formState.companyId &&
        formState.hostUserId &&
        profilePhotoFile.value
    )
})

const hasPrePopulatedData = computed(() => {
    return !!(formState.name || formState.email || formState.fromCompany)
})

// Load dropdown data on mount
onMounted(async () => {
    // API calls moved to verifyOtpCode since they require OTP token
})

// Reload company users when company changes
watch(() => formState.companyId, async (newCompanyId) => {
    formState.hostUserId = ''
    companyUsers.value = []
    if (!newCompanyId) return

    loadingHosts.value = true
    try {
        companyUsers.value = await getCompanyUsers(newCompanyId)
    } catch {
        console.error('Failed to load company users')
    } finally {
        loadingHosts.value = false
    }
})

// OTP Input Handling
const handleOtpPaste = (e: ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData?.getData('text')
    if (!pastedData) return

    const digits = pastedData.replace(/\D/g, '').slice(0, 6).split('')

    digits.forEach((digit, index) => {
        if (index < 6) {
            otpDigits.value[index] = digit
        }
    })

    // Focus the next empty input or the last one if full
    const nextIndex = Math.min(digits.length, 5)
    setTimeout(() => {
        otpInputs.value[nextIndex]?.focus()
    }, 10)
}

const handleOtpInput = (e: Event, index: number) => {
    const val = (e.target as HTMLInputElement).value
    if (!/^\d*$/.test(val)) return

    otpDigits.value[index] = val.slice(-1)

    if (val && index < 5) {
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

const getFullPhone = () => `+91${formState.phone}`

const sendOtp = async () => {
    if (!formState.phone || formState.phone.length < 10) return
    loading.value = true
    try {
        await requestOtp(getFullPhone())
        step.value = 2
        startResendTimer()
        nextTick(() => otpInputs.value[0]?.focus())
    } catch (e: any) {
        message.error(e?.data?.message || 'Failed to send OTP. Please try again.')
    } finally {
        loading.value = false
    }
}

const resendOtp = async () => {
    if (!canResendOtp.value) return
    loading.value = true
    try {
        await requestOtp(getFullPhone())
        message.success('OTP resent successfully!')
        startResendTimer()
    } catch {
        message.error('Failed to resend OTP')
    } finally {
        loading.value = false
    }
}

const verifyOtpCode = async () => {
    const code = otpDigits.value.join('')
    if (code.length < 6) return

    loading.value = true
    try {
        const isValid = await verifyOtp(getFullPhone(), code)
        if (isValid) {
            // Fetch dropdown data now that we have the token
            try {
                purposes.value = await getPurposesOfVisit()
                companies.value = await getCompanies(facilityId.value || undefined)
            } catch (e) {
                console.error('Failed to load dropdown data', e)
            }

            // Fetch visitor data to prefill form
            try {
                const meData = await getMe()
                if (meData?.visitor) {
                    const v = meData.visitor
                    formState.name = v.name || ''
                    formState.email = v.email || ''
                    formState.fromCompany = v.from_company || ''
                    if (v.purpose_of_visit_id) formState.purposeOfVisitId = v.purpose_of_visit_id
                    if (v.company_id) formState.companyId = v.company_id
                }
            } catch (e) {
                console.error('Failed to load visitor profile', e)
            }

            step.value = 3
        } else {
            message.error('Invalid OTP. Please try again.')
        }
    } catch (e: any) {
        message.error(e?.data?.message || 'OTP verification failed. Please try again.')
    } finally {
        loading.value = false
    }
}

// Photo handling
const handlePhotoCapture = (imageDataUrl: string) => {
    profilePhotoPreview.value = imageDataUrl
    
    // Convert data URL to File
    const base64Response = fetch(imageDataUrl)
        .then(res => res.blob())
        .then(blob => {
            profilePhotoFile.value = new File([blob], 'photo.jpg', { type: 'image/jpeg' })
        })
    
    showCamera.value = false
}

const clearForm = () => {
    formState.name = ''
    formState.email = ''
    formState.fromCompany = ''
    formState.purposeOfVisitId = ''
    formState.companyId = ''
    formState.hostUserId = ''
    profilePhotoFile.value = null
    profilePhotoPreview.value = null
}

const handleSubmit = async () => {
    if (!isFormValid.value) return

    loading.value = true
    try {
        const fd = new FormData()
        fd.append('facility_id', facilityId.value)
        fd.append('host_user_id', formState.hostUserId)
        fd.append('company_id', formState.companyId)
        fd.append('purpose_of_visit_id', formState.purposeOfVisitId)
        fd.append('name', formState.name)
        fd.append('phone', getFullPhone())
        if (formState.email) fd.append('email', formState.email)
        if (formState.fromCompany) fd.append('from_company', formState.fromCompany)
        if (profilePhotoFile.value) fd.append('image', profilePhotoFile.value)

        await createWalkIn(fd)
        message.success('Registration submitted successfully!')
        step.value = 4
    } catch (e: any) {
        message.error(e?.data?.message || e?.message || 'Registration failed. Please try again.')
    } finally {
        loading.value = false
    }
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
