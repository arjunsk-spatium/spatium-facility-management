<template>
    <div class="space-y-6">
        <div class="text-center">
            <h2 class="text-xl font-semibold dark:text-white">Have an Invite?</h2>
            <p class="text-gray-500 text-sm">Enter your 6-digit passcode.</p>
        </div>

        <div class="text-center py-4">
            <a-input-otp v-model:value="passcode" :length="6" size="large" style="gap: 8px" />
        </div>

        <a-button type="primary" block size="large" :loading="loading" @click="verify" :disabled="passcode.length < 6">
            Verify & Check In
        </a-button>

        <div class="text-center">
            <NuxtLink to="/public/visitor" class="text-gray-500 text-sm">Cancel</NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'


definePageMeta({
    layout: 'public'
})

const router = useRouter()
const store = useVisitorStore()
const passcode = ref('')
const loading = ref(false)

const verify = async () => {
    loading.value = true
    try {
        await store.verifyPasscode(passcode.value)
        message.success('Invite Verified')
        router.push('/public/visitor/pass')
    } catch (e) {
        message.error('Invalid Passcode')
    } finally {
        loading.value = false
    }
}
</script>
