<template>
    <div class="w-full animate-fade-in text-center space-y-6">
        <!-- Back Link -->
        <div class="w-full flex justify-start mb-6">
             <NuxtLink to="/public/visitor" class="inline-flex items-center text-gray-900 hover:text-gray-600 font-bold transition-colors">
                 <LeftOutlined class="mr-1 text-xs" /> Back
             </NuxtLink>
        </div>

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
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { MailFilled, LeftOutlined, ArrowRightOutlined, LoadingOutlined } from '@ant-design/icons-vue'


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
