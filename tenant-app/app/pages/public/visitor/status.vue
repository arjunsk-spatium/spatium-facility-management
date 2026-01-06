<template>
    <div class="space-y-6 pt-10 animate-fade-in relative pb-20">
        <!-- Close Button -->
        <div class="absolute top-0 right-0">
             <NuxtLink to="/public/visitor" class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <CloseOutlined class="text-lg text-gray-500" />
            </NuxtLink>
        </div>

        <!-- Status Circle -->
        <div class="text-center relative mb-8">
            <div class="relative inline-block">
                <!-- Outer Ring -->
                <div class="w-32 h-32 rounded-full border-4 border-gray-100 flex items-center justify-center">
                    <div class="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <ClockCircleFilled class="text-4xl" />
                    </div>
                </div>
                 <!-- Loading Arc (Simulated with CSS) -->
                 <div class="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent border-r-transparent rotate-45 opacity-20"></div>

                 <!-- Warning Icon -->
                 <div class="absolute bottom-1 right-2 w-8 h-8 rounded-full bg-yellow-400 border-4 border-white flex items-center justify-center text-white shadow-sm">
                    <span class="font-bold text-lg">!</span>
                 </div>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mt-6 mb-2">Approval Pending</h1>
            <p class="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                Thanks, {{ currentVisitor?.name || 'Visitor' }}. Your request has been sent. Please wait while we verify your details.
            </p>
        </div>

        <!-- Host Card -->
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
            <div class="flex items-center gap-4">
                <div class="relative">
                    <img :src="hostAvatar" class="w-12 h-12 rounded-full border-2 border-white shadow-sm" />
                    <div class="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                <div>
                   <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">AWAITING APPROVAL FROM</div>
                   <div class="font-bold text-gray-900">{{ currentVisitor?.hostName || 'Host' }}</div>
                   <div class="text-xs text-blue-600 font-medium">Marketing Department</div> 
                </div>
            </div>
            <CommentOutlined class="text-gray-400 text-lg" />
        </div>

        <!-- Timeline -->
        <div>
            <h3 class="font-bold text-gray-900 mb-4 text-sm">Request Timeline</h3>
            <div class="space-y-0 relative pl-4 border-l-2 border-blue-100 ml-4 pb-2">
                
                <!-- Item 1: Submitted -->
                <div class="relative pl-8 pb-8">
                    <div class="absolute -left-[21px] top-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10">
                        <CheckOutlined :style="{ fontSize: '12px' }" />
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">Registration Submitted</h4>
                    <span class="text-xs text-gray-400">Today, {{ formatTime(new Date()) }}</span>
                </div>

                <!-- Item 2: Host Approval (Active) -->
                <div class="relative pl-8 pb-8">
                    <div class="absolute -left-[21px] top-0 w-8 h-8 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center text-blue-600 shadow-sm z-10">
                         <LoadingOutlined :style="{ fontSize: '14px' }" />
                    </div>
                    <h4 class="font-bold text-blue-600 text-sm">Host Approval</h4>
                    <span class="text-xs text-gray-500">Pending response from {{ currentVisitor?.hostName }}</span>
                </div>

                <!-- Item 3: Access Granted -->
                <div class="relative pl-8 opacity-50">
                    <div class="absolute -left-[21px] top-0 w-8 h-8 bg-gray-100 rounded-full border-4 border-white flex items-center justify-center text-gray-400 shadow-sm z-10">
                        <KeyOutlined :style="{ fontSize: '12px' }" />
                    </div>
                    <h4 class="font-bold text-gray-900 text-sm">Access Granted</h4>
                    <span class="text-xs text-gray-400">QR Code generation</span>
                </div>
            </div>
        </div>

        <!-- Modify Button -->
        <a-button block size="large" class="h-12 rounded-xl border border-gray-200 text-gray-600 font-bold hover:border-gray-300 hover:text-gray-900 flex items-center justify-center gap-2">
            <EditOutlined /> Modify Request
        </a-button>

        <div class="text-center mt-4">
             <a href="#" class="text-xs text-gray-400 font-medium">Need help? <span class="text-gray-500 underline">Contact Reception</span></a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { 
    CloseOutlined, ClockCircleFilled, CommentOutlined, 
    CheckOutlined, LoadingOutlined, KeyOutlined, EditOutlined 
} from '@ant-design/icons-vue'


definePageMeta({
    layout: 'public'
})

const store = useVisitorStore()
const { currentVisitor } = storeToRefs(store)

const hostAvatar = computed(() => 
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentVisitor.value?.hostName || 'Host'}`
)

const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.5s ease-out;
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
