<template>
    <div class="space-y-6 pt-10 animate-fade-in relative pb-20">
        <!-- Loading State -->
        <div v-if="loading" class="flex items-center justify-center py-20">
            <a-spin size="large" />
        </div>

        <!-- No Visitor ID -->
        <div v-else-if="!visitorId" class="text-center py-20">
            <p class="text-gray-500">No visitor registration found.</p>
            <NuxtLink to="/public/visitor" class="text-blue-600 underline">Register as visitor</NuxtLink>
        </div>

        <!-- Status Content -->
        <template v-else>
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
                    <div :class="[
                        'w-24 h-24 rounded-full flex items-center justify-center text-white shadow-lg',
                        statusColorClass
                    ]">
                        <ClockCircleFilled v-if="visitorStatus?.status === 'Pending'" class="text-4xl" />
                        <CheckCircleFilled v-else-if="visitorStatus?.status === 'Approved'" class="text-4xl" />
                        <CloseCircleFilled v-else-if="visitorStatus?.status === 'Rejected'" class="text-4xl" />
                        <ClockCircleFilled v-else class="text-4xl" />
                    </div>
                </div>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mt-6 mb-2">{{ visitorStatus?.status || 'Unknown' }}</h1>
            <p class="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                Your request has been sent. Please wait while we verify your details.
            </p>
        </div>

        <!-- Visitor Details Card -->
        <div class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Visitor Type</span>
                <span class="font-medium text-gray-900">{{ visitorStatus?.visitor_type || '-' }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Facility</span>
                <span class="font-medium text-gray-900">{{ visitorStatus?.facility_name || '-' }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Purpose of Visit</span>
                <span class="font-medium text-gray-900">{{ visitorStatus?.purpose_of_visit || '-' }}</span>
            </div>
        </div>

        <!-- QR Code / Pass - Only show when approved -->
        <div v-if="visitorStatus?.visitor_pass_url && visitorStatus?.status === 'Approved'" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
            <p class="text-gray-500 text-sm mb-3">Your Visitor Pass</p>
            <img :src="visitorStatus.visitor_pass_url" alt="Visitor Pass" class="max-w-[200px] mx-auto rounded-lg" />
            <a-button type="link" :href="visitorStatus.visitor_pass_url" target="_blank" class="mt-2">
                Download Pass
            </a-button>
        </div>

        <!-- Check-in / Check-out Info -->
        <div v-if="visitorStatus?.check_in_time" class="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm space-y-3">
            <div class="flex justify-between">
                <span class="text-gray-500 text-sm">Check-in Time</span>
                <span class="font-medium text-gray-900">{{ formatDateTime(visitorStatus.check_in_time) }}</span>
            </div>
            <div v-if="visitorStatus?.check_out_time" class="flex justify-between">
                <span class="text-gray-500 text-sm">Check-out Time</span>
                <span class="font-medium text-gray-900">{{ formatDateTime(visitorStatus.check_out_time) }}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-gray-500 text-sm">On Premises</span>
                <span :class="visitorStatus?.is_on_premises ? 'text-green-600' : 'text-gray-600'" class="font-medium">
                    {{ visitorStatus?.is_on_premises ? 'Yes' : 'No' }}
                </span>
            </div>
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
                    <span class="text-xs text-gray-400">Submitted</span>
                </div>

                <!-- Item 2: Host Approval -->
                <div class="relative pl-8 pb-8">
                    <div v-if="visitorStatus?.status === 'Pending'" class="absolute -left-[21px] top-0 w-8 h-8 bg-white rounded-full border-4 border-blue-600 flex items-center justify-center text-blue-600 shadow-sm z-10 animate-spin">
                        <LoadingOutlined :style="{ fontSize: '14px' }" />
                    </div>
                    <div v-else-if="visitorStatus?.status === 'Approved'" class="absolute -left-[21px] top-0 w-8 h-8 bg-green-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10">
                        <CheckOutlined :style="{ fontSize: '12px' }" />
                    </div>
                    <div v-else class="absolute -left-[21px] top-0 w-8 h-8 bg-red-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10">
                        <CloseOutlined :style="{ fontSize: '12px' }" />
                    </div>
                    <h4 :class="{
                        'text-blue-600': visitorStatus?.status === 'Pending',
                        'text-green-600': visitorStatus?.status === 'Approved',
                        'text-red-600': visitorStatus?.status === 'Rejected'
                    }" class="font-bold text-sm">{{ visitorStatus?.status === 'Rejected' ? 'Request Rejected' : 'Host Approval' }}</h4>
                    <span v-if="visitorStatus?.status === 'Pending'" class="text-xs text-gray-500">Pending response</span>
                    <span v-else-if="visitorStatus?.status === 'Approved'" class="text-xs text-green-600">Approved</span>
                    <span v-else class="text-xs text-red-600">Rejected</span>
                </div>

                <!-- Item 3: Access Granted -->
                <div :class="visitorStatus?.status === 'Approved' ? '' : 'opacity-50'">
                    <div class="relative pl-8">
                        <div v-if="visitorStatus?.status === 'Approved'" class="absolute -left-[21px] top-0 w-8 h-8 bg-green-600 rounded-full border-4 border-white flex items-center justify-center text-white shadow-sm z-10">
                            <CheckOutlined :style="{ fontSize: '12px' }" />
                        </div>
                        <div v-else class="absolute -left-[21px] top-0 w-8 h-8 bg-gray-100 rounded-full border-4 border-white flex items-center justify-center text-gray-400 shadow-sm z-10">
                            <KeyOutlined :style="{ fontSize: '12px' }" />
                        </div>
                        <h4 class="font-bold text-gray-900 text-sm">Access Granted</h4>
                        <span v-if="visitorStatus?.status === 'Approved'" class="text-xs text-green-600">QR Code generated</span>
                        <span v-else class="text-xs text-gray-400">Waiting for approval</span>
                    </div>
                </div>
            </div>
        </div>

        <div class="text-center mt-4">
             <a href="#" class="text-xs text-gray-400 font-medium">Need help? <span class="text-gray-500 underline">Contact Reception</span></a>
        </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useVisitorStore } from '~/stores/visitor'
import { 
    CloseOutlined, ClockCircleFilled, 
    CheckCircleFilled, CloseCircleFilled,
    CheckOutlined, LoadingOutlined, KeyOutlined
} from '@ant-design/icons-vue'


definePageMeta({
    layout: 'public'
})

const { getVisitorStatus } = usePublicVisitorService()
const visitorId = ref<string | null>(null)
const visitorStatus = ref<any>(null)
const loading = ref(true)
const store = useVisitorStore()

const statusColorClass = computed(() => {
    const status = visitorStatus.value?.status
    if (status === 'Approved') return 'bg-green-600 shadow-green-200'
    if (status === 'Rejected') return 'bg-red-600 shadow-red-200'
    return 'bg-blue-600 shadow-blue-200'
})

onMounted(async () => {
    visitorId.value = localStorage.getItem('visitor_id')
    if (visitorId.value) {
        try {
            visitorStatus.value = await getVisitorStatus(visitorId.value)
            store.currentVisitor = visitorStatus.value
        } catch (e) {
            console.error('Failed to fetch visitor status', e)
        }
    }
    loading.value = false
})

const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', { 
        dateStyle: 'medium', 
        timeStyle: 'short' 
    })
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
.animate-spin {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
</style>
