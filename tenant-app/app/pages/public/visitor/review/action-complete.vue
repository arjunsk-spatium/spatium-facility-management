<template>
    <div class="min-h-screen bg-gray-50 flex flex-col font-sans relative">
        <!-- Header -->
        <div class="bg-white px-4 py-4 flex items-center justify-center relative border-b border-gray-100 sticky top-0 z-10">
            <template v-if="status === 'approved'">
                <button class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium flex items-center text-sm" @click="router.back()">
                    <LeftOutlined class="mr-1 text-xs" /> Back
                </button>
                <h1 class="font-bold text-lg text-gray-900 !m-0 !mb-0 leading-none">Review Complete</h1>
            </template>
            <template v-else>
                <h1 class="font-bold text-lg text-gray-900 !m-0 !mb-0 leading-none">Request Rejected</h1>
                <button class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" @click="router.back()">
                    <CloseOutlined class="text-lg" />
                </button>
            </template>
        </div>

        <div class="flex-1 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <!-- Icon -->
            <div class="relative w-32 h-32 mb-6">
                <!-- Outer Glow/Circle -->
                <div :class="[
                    'absolute inset-0 rounded-full opacity-20 transform scale-125',
                    status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                ]"></div>
                
                <!-- Main Circle -->
                <div :class="[
                    'relative w-full h-full rounded-full flex items-center justify-center border-4 border-white shadow-sm',
                    status === 'approved' ? 'bg-green-100' : 'bg-red-100'
                ]">
                    <CheckOutlined v-if="status === 'approved'" class="text-5xl text-green-500" />
                    <UserDeleteOutlined v-else class="text-5xl text-red-500" />
                </div>

                <!-- Sub Badge -->
                <div class="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center">
                    <div :class="[
                        'w-8 h-8 rounded-full flex items-center justify-center text-white',
                        status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                    ]">
                        <SafetyCertificateFilled v-if="status === 'approved'" class="text-sm" />
                        <CheckOutlined v-else class="text-sm" />
                    </div>
                </div>
            </div>

            <!-- Title & Desc -->
            <h2 class="text-2xl font-bold text-gray-900 mb-3">
                {{ status === 'approved' ? 'Request Approved!' : 'Rejection Confirmed' }}
            </h2>
            <p class="text-sm text-gray-500 max-w-xs mx-auto mb-8 leading-relaxed">
                You have successfully {{ status === 'approved' ? 'approved' : 'rejected' }} <span class="font-bold text-gray-900">{{ visitorName }}'s</span> 
                {{ status === 'approved' ? 'visit. A confirmation email with access details has been sent.' : 'visitor request. An email notification has been sent to the visitor.' }}
            </p>

            <!-- Visitor Card -->
            <div v-if="status === 'rejected'" class="w-full text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1 mb-2">Rejected Visitor</div>
            
            <div class="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4 mb-4">
                <div :class="['w-12 h-12 rounded-full flex items-center justify-center bg-gray-100 text-xl overflow-hidden', status === 'rejected' ? 'grayscale opacity-50' : '']">
                     <img v-if="photoUrl" :src="photoUrl" class="w-full h-full object-cover" />
                     <UserOutlined v-else class="text-gray-400" />
                </div>
                <div class="flex-1 text-left">
                    <div :class="['font-bold text-base text-gray-900', status === 'rejected' ? 'line-through text-gray-400' : '']">{{ visitorName }}</div>
                    <div class="text-xs text-blue-500">{{ company }}</div>
                    <div v-if="status === 'rejected'" class="text-[10px] text-gray-400 mt-0.5">Fri, Oct 24 • 10:00 AM</div>
                </div>
                <div v-if="status === 'approved'" class="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded uppercase border border-green-100">
                    Approved
                </div>
                <div v-if="status === 'rejected'" class="w-6 h-6 rounded-full bg-red-50 text-red-500 flex items-center justify-center text-xs">
                    <StopOutlined />
                </div>
            </div>

            <!-- Approved Grid Details -->
            <div v-if="status === 'approved'" class="w-full grid grid-cols-2 gap-4 mb-8">
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left">
                    <div class="flex items-center gap-2 text-gray-400 mb-1">
                        <CalendarOutlined /> <span class="text-xs">Date</span>
                    </div>
                    <div class="font-bold text-gray-900">Fri, Oct 24</div>
                </div>
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-left">
                     <div class="flex items-center gap-2 text-gray-400 mb-1">
                        <ClockCircleOutlined /> <span class="text-xs">Time</span>
                    </div>
                    <div class="font-bold text-gray-900">10:00 AM</div>
                </div>
            </div>

            <div class="flex-1"></div>

            <!-- Footer Actions -->
            <div class="w-full flex flex-col gap-4">
                <button class="w-full h-12 rounded-xl bg-blue-600 !text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20">
                     <AppstoreOutlined class="!text-white" /> {{ status === 'approved' ? 'Return to Requests' : 'Return to Requests List' }}
                </button>
                <button class="w-full h-12 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                     <IdcardOutlined v-if="status === 'approved'" /> {{ status === 'approved' ? 'View Digital ID' : 'View Other Requests' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { 
    LeftOutlined, CloseOutlined, CheckOutlined, UserDeleteOutlined, 
    SafetyCertificateFilled, UserOutlined, StopOutlined,
    CalendarOutlined, ClockCircleOutlined, AppstoreOutlined, IdcardOutlined 
} from '@ant-design/icons-vue'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const router = useRouter()

const status = computed(() => route.query.status as 'approved' | 'rejected' || 'approved')
const visitorName = computed(() => route.query.name as string || 'Visitor')
const company = computed(() => route.query.company as string || 'Company')
const photoUrl = computed(() => route.query.photo as string || '')

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
