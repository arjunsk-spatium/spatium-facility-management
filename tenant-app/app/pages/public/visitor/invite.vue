<template>
    <div class="space-y-8 animate-fade-in text-center">
        <!-- Floating Back Button -->
        <div class="absolute top-4 left-4">
             <NuxtLink to="/public/visitor">
                <button class="w-10 h-10 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                    <ArrowLeftOutlined />
                </button>
             </NuxtLink>
        </div>

        <div class="pt-8">
            <div class="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                <MailFilled class="text-4xl" />
            </div>

            <h1 class="text-3xl font-bold text-gray-900 mb-3">Have an invite?</h1>
            <p class="text-gray-500 max-w-xs mx-auto text-sm leading-relaxed">
                Enter the 6-digit visitor pass code provided by your host in your invitation email or SMS.
            </p>
        </div>

        <div class="py-4">
             <div class="flex justify-center gap-2 sm:gap-4">
                 <input v-for="i in 6" :key="i" type="text" maxlength="1" 
                    class="w-10 h-14 sm:w-16 sm:h-20 rounded-xl sm:rounded-2xl border border-gray-200 text-center text-2xl sm:text-4xl font-bold outline-none ring-4 ring-transparent focus:border-blue-500 focus:ring-blue-100 transition-all caret-blue-500 shadow-sm"
                    :class="otpDigits[i-1] ? 'border-blue-500 bg-blue-50/10' : 'bg-white'"
                    :value="otpDigits[i-1]"
                    @input="e => handleInput(e, i-1)"
                    @keydown.delete="e => handleBackspace(e, i-1)"
                    ref="otpInputs"
                 />
            </div>
        </div>

        <div>
            <a-button type="link" class="text-blue-600 font-semibold" @click="message.info('Code resent to your email')">
                Resend Code
            </a-button>
        </div>

        <div class="pt-8 w-full max-w-xs mx-auto">
             <a-button type="primary" block size="large" 
                class="h-14 text-lg font-bold rounded-2xl shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2" 
                :loading="loading" 
                @click="verify" 
                :disabled="otpDigits.join('').length < 6">
                Check In <ArrowRightOutlined />
            </a-button>
            <div class="mt-6 text-xs text-gray-400">
                Don't have a code? <NuxtLink to="/public/visitor/register" class="text-gray-500 underline decoration-gray-300">Search for host manually</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { MailFilled, ArrowLeftOutlined, ArrowRightOutlined } from '@ant-design/icons-vue'


definePageMeta({
    layout: 'public'
})

const router = useRouter()
const store = useVisitorStore()
const loading = ref(false)
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref<HTMLInputElement[]>([])

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

const verify = async () => {
    const code = otpDigits.value.join('')
    if (code.length < 6) return

    loading.value = true
    try {
        await store.verifyPasscode(code)
        message.success('Invite Verified')
        // For invited guests with valid code, immediate pass is usually granted
        router.push('/public/visitor/pass')
    } catch (e) {
        message.error('Invalid or Expired Passcode')
        otpDigits.value = ['', '', '', '', '', '']
        otpInputs.value[0]?.focus()
    } finally {
        loading.value = false
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
