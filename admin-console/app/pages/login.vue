<template>
    <div class="login-container">
        <!-- Left Side - Inspiration Panel -->
        <div class="inspiration-panel">
            <!-- Background Image (random from Unsplash) -->
            <div class="inspiration-bg" :style="{ backgroundImage: `url(${currentImage})` }"></div>
            <div class="inspiration-overlay"></div>

            <!-- Top Buttons - Refresh and Theme Toggle -->
            <div class="absolute top-6 left-6 z-20 flex items-center gap-3">
                <!-- Refresh Button -->
                <button @click="refreshQuote"
                    class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all"
                    title="Refresh quote">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>

                <!-- Theme Toggle Button -->
                <button @click="toggleTheme"
                    class="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/80 hover:bg-white/20 transition-all"
                    :title="`Theme: ${colorMode}`">
                    <!-- Sun Icon (Light Mode) -->
                    <svg v-if="colorMode === 'light'" class="w-5 h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <!-- Moon Icon (Dark Mode) -->
                    <svg v-else-if="colorMode === 'dark'" class="w-5 h-5" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    <!-- System Icon (Auto Mode) -->
                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </button>
            </div>

            <!-- Quote Content -->
            <div class="inspiration-content">
                <p class="quote-label">DAILY INSPIRATION</p>
                <blockquote class="quote-text">"{{ currentQuote.text }}"</blockquote>
                <p class="quote-author">{{ currentQuote.author }}</p>
            </div>

            <!-- Footer -->
            <div class="inspiration-footer">
                <p>Image via Unsplash · Quote refreshes on reload</p>
            </div>
        </div>

        <!-- Right Side - Login Form -->
        <div class="login-panel">
            <div class="login-form-container">
                <!-- Logo -->
                <div class="logo-container">
                    <img :src="isDark ? '/images/spatium-logo.png' : '/images/spatium-logo-light.png'" alt="Spatium Hub"
                        class="logo-image" />
                </div>

                <p class="subtitle">SPATIUM OFFICES</p>
                <h1 class="welcome-text">Nice to see you again</h1>

                <!-- Login Form -->
                <div class="form-container">
                    <p class="form-description">
                        Sign in with your admin credentials to access the console.
                    </p>

                    <form @submit.prevent="handleLogin" class="login-form">
                        <!-- Email Field -->
                        <div class="form-group">
                            <label class="form-label">
                                <span class="required">*</span>Email
                            </label>
                            <input v-model="form.email" type="email" placeholder="admin@spatiumoffices.com"
                                class="form-input" required />
                        </div>

                        <!-- Password Field -->
                        <div class="form-group">
                            <label class="form-label">
                                <span class="required">*</span>Password
                            </label>
                            <div class="password-input-wrapper">
                                <input v-model="form.password" :type="showPassword ? 'text' : 'password'"
                                    placeholder="Enter your password" class="form-input" required />
                                <button type="button" @click="showPassword = !showPassword" class="password-toggle">
                                    <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                    <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" class="submit-button" :disabled="isLoading">
                            <span v-if="isLoading" class="loading-spinner"></span>
                            <span v-else>Sign In</span>
                        </button>
                    </form>

                    <!-- Help Text -->
                    <p class="help-text">
                        Having trouble signing in? Contact your Spatium administrator.
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

// Theme
const { colorMode, isDark, toggleTheme } = useTheme()

// Form state
const form = reactive({
    email: '',
    password: ''
})
const showPassword = ref(false)
const isLoading = ref(false)

// Quotes collection
const quotes = [
    { text: "Do not wait to strike till the iron is hot; but make it hot by striking.", author: "WILLIAM BUTLER YEATS" },
    { text: "The only way to do great work is to love what you do.", author: "STEVE JOBS" },
    { text: "Innovation distinguishes between a leader and a follower.", author: "STEVE JOBS" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "WINSTON CHURCHILL" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", author: "ELEANOR ROOSEVELT" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "CONFUCIUS" },
    { text: "Quality is not an act, it is a habit.", author: "ARISTOTLE" },
    { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "CHINESE PROVERB" },
    { text: "Your time is limited, don't waste it living someone else's life.", author: "STEVE JOBS" },
    { text: "The only impossible journey is the one you never begin.", author: "TONY ROBBINS" }
]

// Random images from Unsplash
const images = [
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1200&q=80', // Galaxy/stars
    'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80', // Nebula
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80', // Mountain sunset
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', // Earth from space
    'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80', // Dark gradient
    'https://images.unsplash.com/photo-1475274047050-1d0c0975c63e?w=1200&q=80', // Night sky
    'https://images.unsplash.com/photo-1509773896068-7fd415d91e2e?w=1200&q=80', // Starry mountains
]

const currentQuoteIndex = ref(Math.floor(Math.random() * quotes.length))
const currentImageIndex = ref(Math.floor(Math.random() * images.length))

const currentQuote = computed(() => quotes[currentQuoteIndex.value])
const currentImage = computed(() => images[currentImageIndex.value])

const refreshQuote = () => {
    currentQuoteIndex.value = Math.floor(Math.random() * quotes.length)
    currentImageIndex.value = Math.floor(Math.random() * images.length)
}

// Login handler
const handleLogin = async () => {
    isLoading.value = true
    try {
        // TODO: Implement actual login logic
        console.log('Login attempt:', form.email)
        await new Promise(resolve => setTimeout(resolve, 1500))
        // Navigate to dashboard after successful login
        navigateTo('/dashboard')
    } catch (error) {
        console.error('Login failed:', error)
    } finally {
        isLoading.value = false
    }
}
</script>

<style scoped>
.login-container {
    display: flex;
    min-height: 100vh;
    width: 100%;
}

/* Left Panel - Inspiration */
.inspiration-panel {
    position: relative;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem;
    overflow: hidden;
}

.inspiration-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    z-index: 0;
}

.inspiration-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.6) 100%);
    z-index: 1;
}

.inspiration-content {
    position: relative;
    z-index: 10;
    max-width: 600px;
}

.quote-label {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
}

.quote-text {
    font-size: 2rem;
    font-weight: 300;
    line-height: 1.4;
    color: white;
    margin-bottom: 1.5rem;
}

.quote-author {
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.15em;
    color: rgba(255, 255, 255, 0.7);
}

.inspiration-footer {
    position: absolute;
    bottom: 2rem;
    left: 3rem;
    z-index: 10;
}

.inspiration-footer p {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.5);
}

/* Right Panel - Login Form */
.login-panel {
    flex: 0 0 480px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 3rem;
    background-color: var(--color-neutral-50);
    transition: background-color 300ms ease;
}

.dark .login-panel {
    background-color: var(--color-neutral-950);
}

.login-form-container {
    width: 100%;
    max-width: 360px;
}

.logo-container {
    margin-bottom: 1.5rem;
}

.logo-image {
    height: 48px;
    width: auto;
}

.subtitle {
    font-size: 0.75rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    color: var(--color-neutral-500);
    margin-bottom: 0.5rem;
    transition: color 300ms ease;
}

.dark .subtitle {
    color: var(--color-neutral-400);
}

.welcome-text {
    font-size: 1.75rem;
    font-weight: 600;
    color: var(--color-neutral-900);
    margin-bottom: 2rem;
    transition: color 300ms ease;
}

.dark .welcome-text {
    color: white;
}

.form-container {
    background-color: var(--color-neutral-100);
    border-radius: var(--radius-xl);
    padding: 1.5rem;
    transition: background-color 300ms ease;
}

.dark .form-container {
    background-color: var(--color-neutral-900);
}

.form-description {
    font-size: 0.875rem;
    color: var(--color-neutral-600);
    margin-bottom: 1.5rem;
    line-height: 1.5;
    transition: color 300ms ease;
}

.dark .form-description {
    color: var(--color-neutral-400);
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-700);
    transition: color 300ms ease;
}

.dark .form-label {
    color: var(--color-neutral-200);
}

.form-label .required {
    color: var(--color-primary-500);
    margin-right: 0.25rem;
}

.dark .form-label .required {
    color: var(--color-primary-400);
}

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    font-size: 0.875rem;
    color: var(--color-neutral-900);
    background-color: white;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-lg);
    transition: all 150ms ease;
}

.dark .form-input {
    color: white;
    background-color: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
}

.form-input::placeholder {
    color: var(--color-neutral-400);
}

.dark .form-input::placeholder {
    color: var(--color-neutral-500);
}

.form-input:focus {
    outline: none;
    border-color: var(--color-primary-500);
    box-shadow: 0 0 0 3px rgba(51, 120, 255, 0.15);
}

.password-input-wrapper {
    position: relative;
}

.password-input-wrapper .form-input {
    padding-right: 3rem;
}

.password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--color-neutral-500);
    background: none;
    border: none;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 150ms ease;
}

.dark .password-toggle {
    color: var(--color-neutral-400);
}

.password-toggle:hover {
    color: var(--color-neutral-700);
}

.dark .password-toggle:hover {
    color: var(--color-neutral-200);
}

.submit-button {
    width: 100%;
    padding: 0.875rem 1.5rem;
    font-size: 0.9375rem;
    font-weight: 600;
    color: white;
    background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition: all 200ms ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.submit-button:hover:not(:disabled) {
    background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary-500) 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(51, 120, 255, 0.3);
}

.submit-button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.loading-spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

.help-text {
    font-size: 0.8125rem;
    color: var(--color-neutral-500);
    text-align: center;
    margin-top: 1.5rem;
    transition: color 300ms ease;
}

.dark .help-text {
    color: var(--color-neutral-500);
}

/* Responsive */
@media (max-width: 1024px) {
    .login-container {
        flex-direction: column;
    }

    .inspiration-panel {
        min-height: 300px;
        flex: none;
    }

    .login-panel {
        flex: 1;
    }

    .quote-text {
        font-size: 1.5rem;
    }
}

@media (max-width: 640px) {
    .inspiration-panel {
        display: none;
    }

    .login-panel {
        flex: 0 0 100%;
        padding: 2rem 1.5rem;
    }
}
</style>
