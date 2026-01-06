<template>
    <div class="space-y-8 w-full">
        <!-- Hero Section -->
        <div class="relative w-full h-48 rounded-2xl overflow-hidden shadow-sm">
            <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                 alt="Office Headquarters" 
                 class="w-full h-full object-cover" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                <div class="text-white text-xs font-bold tracking-wider uppercase mb-1 opacity-80">Headquarters</div>
                <div class="text-white text-xl font-bold">San Francisco, CA</div>
            </div>
        </div>

        <!-- Welcome Text -->
        <div class="text-center space-y-2">
            <h1 class="text-3xl font-bold text-gray-900 leading-tight">
                Welcome to <br/>
                <span class="text-blue-600">Innovation Corp.</span>
            </h1>
            <p class="text-gray-500 text-sm max-w-xs mx-auto">
                Please select an option below to begin your check-in process.
            </p>
        </div>

        <!-- Action Cards -->
        <div class="space-y-4">
            <NuxtLink to="/public/visitor/register" class="block group">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <UserAddOutlined class="text-xl" />
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-gray-900">Walk-in Visitor</h3>
                            <p class="text-xs text-gray-500">Register at the front desk</p>
                        </div>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                        <RightOutlined />
                    </div>
                </div>
            </NuxtLink>

            <NuxtLink to="/public/visitor/invite" class="block group">
                <div class="bg-white p-4 rounded-xl shadow-sm border border-transparent hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                            <QrcodeOutlined class="text-xl" />
                        </div>
                        <div class="text-left">
                            <h3 class="font-bold text-gray-900">Pre-invited Visitor</h3>
                            <p class="text-xs text-gray-500">Scan QR code or enter ID</p>
                        </div>
                    </div>
                    <div class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-purple-50 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                        <RightOutlined />
                    </div>
                </div>
            </NuxtLink>
        </div>

        <!-- Help Link -->
        <div class="text-center">
            <a href="#" class="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
                <span class="bg-blue-100 p-1 rounded-full"><CustomerServiceOutlined /></span>
                Need help? Contact Reception
            </a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { UserAddOutlined, QrcodeOutlined, RightOutlined, CustomerServiceOutlined } from '@ant-design/icons-vue'

definePageMeta({
    layout: 'public'
})
</script>
