<template>
    <div class="flex h-screen w-full overflow-hidden bg-surface dark:bg-neutral-950">
        <!-- Left Side - Image & Quote -->
        <div class="relative hidden lg:block lg:w-[71.428%]">
            <!-- Background Image -->
            <img :src="currentImage" alt="Login background"
                class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-in-out"
                :class="{ 'opacity-0': isImageLoading, 'opacity-100': !isImageLoading }" @load="onImageLoad" />

            <!-- Gradient Overlay -->
            <div class="absolute inset-0 bg-gradient-to-t from-neutral-900/90 via-neutral-900/40 to-transparent"></div>

            <!-- Quote Section -->
            <div class="absolute bottom-12 left-12 right-12 z-10 text-white">
                <div class="mb-4 text-xs font-semibold uppercase tracking-wider opacity-80">Daily Inspiration</div>
                <h2 class="mb-4 text-3xl font-bold leading-tight md:text-4xl text-white">
                    "{{ currentQuote.text }}"
                </h2>
                <p class="text-sm font-medium tracking-wide opacity-90">
                    {{ currentQuote.author }}
                </p>
            </div>

            <!-- Footer Info -->
            <div class="absolute bottom-4 left-12 z-10 text-[10px] text-white/50">
                Image via Unsplash · Quote refreshes on reload
            </div>
        </div>

        <!-- Right Side - Login Form -->
        <div
            class="flex w-full flex-col items-center justify-center p-8 lg:w-[28.572%] bg-surface dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-300">
            <div class="w-full max-w-md space-y-8">
                <!-- Logo & Header -->
                <div class="text-center">
                    <!-- Logo -->
                    <div v-if="currentLogo"
                        class="mx-auto mb-6 flex h-16 w-auto items-center justify-center">
                        <img :src="currentLogo" :alt="tenantStore.tenantName"
                            class="h-12 w-auto object-contain" />
                    </div>
                    <div v-else
                        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg shadow-primary-500/30">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>

                    <h2 v-if="!currentLogo" class="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
                        {{ tenantStore.tenantName }}
                    </h2>
                    <p class="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Admin Access
                    </p>
                </div>

                <div
                    class="bg-surface dark:bg-neutral-900 shadow-card p-8 rounded-2xl border border-neutral-200 dark:border-neutral-800">
                    <h3 class="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
                        Sign in with your email and code
                    </h3>

                    <div class="transition-all duration-300">
                        <!-- Step 1: Email -->
                        <form v-if="step === 'email'" @submit.prevent="handleEmailSubmit" class="space-y-4">
                            <!-- Email Input -->
                            <div>
                                <label for="email" class="label">Email</label>
                                <input id="email" v-model="form.email" type="email" required class="input"
                                    placeholder="admin@company.com" autofocus />
                            </div>

                            <!-- Submit Button -->
                            <div class="mb-6">
                                <button type="submit"
                                    class="btn btn-primary w-full shadow-lg shadow-primary-500/20 !text-white"
                                    :disabled="loading">
                                    <span v-if="loading">Processing...</span>
                                    <span v-else>Next</span>
                                </button>
                            </div>
                        </form>

                        <!-- Step 2: OTP -->
                        <form v-else @submit.prevent="handleLogin" class="space-y-6">
                            <!-- OTP Input -->
                            <div>
                                <div class="flex items-center justify-between mb-2">
                                    <label for="otp" class="label mb-0">One-Time Password</label>
                                    <button type="button" @click="goBack"
                                        class="text-xs text-primary-600 hover:text-primary-700 font-medium">
                                        Change Email
                                    </button>
                                </div>
                                <div class="text-xs text-neutral-500 mb-2">
                                    Code sent to <span class="font-medium text-neutral-900 dark:text-neutral-200">{{
                                        form.email }}</span>
                                </div>
                                <input id="otp" v-model="form.otp" type="text" required
                                    class="input text-center tracking-widest text-lg font-mono"
                                    placeholder="Enter 6-digit code" maxlength="6" autofocus />
                            </div>

                            <!-- Submit Button -->
                            <div class="mb-6">
                                <button type="submit"
                                    class="btn btn-primary w-full shadow-lg shadow-primary-500/20 !text-white"
                                    :disabled="loading">
                                    <span v-if="loading">Signing in...</span>
                                    <span v-else>Log In</span>
                                </button>
                            </div>
                        </form>
                    </div>

                    <!-- Error Message -->
                    <div v-if="errorMsg"
                        class="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center">
                        {{ errorMsg }}
                    </div>

                    <p class="mt-12 text-center text-xs text-neutral-500 dark:text-neutral-500">
                        Having trouble signing in? Contact your administrator.
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    layout: 'auth'
})

// Types
interface Quote {
    text: string
    author: string
}

const loading = ref(false)
const isImageLoading = ref(true)
const tenantStore = useTenantStore()
const authStore = useAuthStore()
const { isDark } = useTheme()
const config = useRuntimeConfig()
const errorMsg = ref('')

// State
const step = ref<'email' | 'otp'>('email')
const form = reactive({
    email: '',
    otp: ''
})

// Data
const images = [
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', // Office
    'https://images.unsplash.com/photo-1497215842964-222b430dc094?auto=format&fit=crop&w=1600&q=80', // Meeting room
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1600&q=80', // Skyscraper
    'https://images.unsplash.com/photo-1554200876-56c2f25224fa?auto=format&fit=crop&w=1600&q=80', // Startup
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1600&q=80'  // Coffee & Work
]

const quotes: Quote[] = [
    { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "William Butler Yeats" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", author: "Winston Churchill" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
    { text: "Architecture is a visual art, and the buildings speak for themselves.", author: "Julia Morgan" }
]

const currentImage = ref('')
const currentQuote = ref<Quote>({ text: '', author: '' })
const currentLogo = computed(() => isDark.value ? tenantStore.darkLogo : tenantStore.tenantLogo);

// Methods
const onImageLoad = () => {
    isImageLoading.value = false
}

const getRandomItem = <T>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)]
}

const handleEmailSubmit = async () => {
    if (!form.email) return
    loading.value = true
    errorMsg.value = ''
    try {
        await authStore.requestOtp(form.email)
        step.value = 'otp'
    } catch (error: any) {
        console.error('Error sending OTP:', error)
        errorMsg.value = error?.data?.message || 'Failed to send OTP. Please try again.'
    } finally {
        loading.value = false
    }
}

const handleLogin = async () => {
    if (!form.otp) return
    loading.value = true
    errorMsg.value = ''

    try {
        // USING TENANT ADMIN APP ID
        await authStore.login(form.email, form.otp, config.public.tenantAdminAppId)
        navigateTo('/dashboard') // Or /admin/dashboard if it exists, but user said "same login page replica"
    } catch (error: any) {
        console.error('Login failed', error)
        errorMsg.value = error?.data?.message || 'Login failed. Please check your credentials.'
    } finally {
        loading.value = false
    }
}

const goBack = () => {
    step.value = 'email'
    form.otp = ''
    errorMsg.value = ''
}

// Lifecycle
onMounted(() => {
    currentImage.value = getRandomItem(images)
    currentQuote.value = getRandomItem(quotes)

    // If already logged in, redirect to dashboard
    if (authStore.isAuthenticated) {
        navigateTo('/dashboard');
    }
})
</script>

<style scoped>
/* Ensure full height */
</style>
