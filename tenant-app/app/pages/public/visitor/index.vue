<template>
    <div class="space-y-6 py-4">
        <div class="text-center mb-8">
            <h2 class="text-xl font-semibold mb-2 dark:text-white">Welcome!</h2>
            <p class="text-gray-600 dark:text-gray-400">Please select an option to check in.</p>
        </div>

        <NuxtLink to="/public/visitor/register" class="block">
            <a-card hoverable
                class="text-center border-primary-200 hover:border-primary-500 transition-colors cursor-pointer">
                <div class="py-4">
                    <UserAddOutlined class="text-4xl text-primary-500 mb-2" />
                    <h3 class="font-medium text-lg">I'm a Walk-in Visitor</h3>
                    <p class="text-xs text-gray-500">Register at the desk</p>
                </div>
            </a-card>
        </NuxtLink>

        <NuxtLink to="/public/visitor/invite" class="block">
            <a-card hoverable
                class="text-center border-green-200 hover:border-green-500 transition-colors cursor-pointer">
                <div class="py-4">
                    <QrcodeOutlined class="text-4xl text-green-500 mb-2" />
                    <h3 class="font-medium text-lg">I have an Invite</h3>
                    <p class="text-xs text-gray-500">Enter passcode or scan QR</p>
                </div>
            </a-card>
        </NuxtLink>
    </div>
</template>

<script setup lang="ts">
import { UserAddOutlined, QrcodeOutlined } from '@ant-design/icons-vue'

definePageMeta({
    layout: 'public'
})
</script>
