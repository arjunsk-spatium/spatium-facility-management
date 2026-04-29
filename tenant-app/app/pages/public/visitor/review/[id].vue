<template>
    <div v-if="visitor" class="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans">
        <!-- Header -->
        <div class="bg-white px-4 py-4 flex items-center justify-center border-b border-gray-100 sticky top-0 z-10">
            <h1 class="font-bold text-lg text-gray-900">Review Request</h1>
        </div>

        <div class="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
             <!-- Status Banner -->
             <div class="px-4 py-2 rounded-lg text-xs font-bold text-center border uppercase tracking-wide flex items-center justify-center gap-2"
                :class="{
                    'bg-yellow-50 text-yellow-700 border-yellow-100': visitor.status === 'Pending',
                    'bg-green-50 text-green-700 border-green-100': visitor.status === 'Approved',
                    'bg-red-50 text-red-700 border-red-100': visitor.status === 'Rejected' || visitor.status === 'Denied'
                }">
                <div class="w-2 h-2 rounded-full"
                    :class="{
                        'bg-yellow-400': visitor.status === 'Pending',
                        'bg-green-400': visitor.status === 'Approved',
                        'bg-red-400': visitor.status === 'Rejected' || visitor.status === 'Denied'
                    }"></div>
                {{ visitor.status }}
             </div>

             <!-- Visitor Profile Card -->
             <div class="bg-white rounded-3xl p-6 text-center shadow-sm border border-orange-100 relative overflow-hidden">
                 <!-- Background Decoration -->
                 <div class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-orange-50 to-transparent opacity-50"></div>

                 <div class="mb-4 relative z-10">
                     <div class="w-24 h-24 rounded-full mx-auto border-4 border-white shadow-sm overflow-hidden bg-orange-100 mb-3">
                         <img :src="visitor.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${visitor.name}`" class="w-full h-full object-cover" />
                     </div>
                     <span class="bg-white border border-gray-100 px-2 py-0.5 rounded-md text-[10px] font-bold text-blue-600 shadow-sm">
                        <SafetyCertificateFilled class="mr-1" /> VERIFIED
                     </span>
                 </div>

                 <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ visitor.name }}</h2>
                 <div class="text-sm font-medium text-blue-600">{{ visitor.company || visitor.from_company }}</div>
                 <div class="text-xs text-gray-400 mt-1">{{ visitor.role || 'Visitor' }}</div>
                 
                 <div class="grid grid-cols-2 gap-3 mt-6">
                     <a :href="`mailto:${visitor.email}`" class="h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100">
                        <MailOutlined /> Email
                     </a>
                     <a :href="`tel:${visitor.phone}`" class="h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100">
                        <PhoneOutlined /> Call
                     </a>
                 </div>
             </div>

             <div class="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-2">Visit Information</div>

             <!-- Info Card: Date -->
             <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-4 items-start">
                 <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                     <CalendarFilled />
                 </div>
                 <div>
                     <div class="text-xs text-gray-400 mb-0.5">Date & Time</div>
                     <div class="font-bold text-gray-900 text-sm">
                        {{ visitor.checkin_date }}
                     </div>
                     <div class="text-xs text-gray-500 mt-0.5">
                        {{ visitor.checkin_time }}
                     </div>
                 </div>
             </div>

             <!-- Info Card: Purpose -->
              <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-4 items-start">
                 <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                     <FileTextFilled />
                 </div>
                 <div>
                     <div class="text-xs text-gray-400 mb-0.5">Purpose</div>
                     <div class="font-bold text-gray-900 text-sm">{{ visitor.purpose_of_visit || 'Meeting' }}</div>
                     <div class="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Meeting with {{ visitor.host_name }} at {{ visitor.facility_name }}.
                     </div>
                 </div>
             </div>
        </div>

        <div v-if="visitor.status === 'Pending'" class="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex gap-4 z-20">
            <button @click="handleAction('reject')" :disabled="processing"
                class="flex-1 h-12 rounded-xl border border-red-100 text-red-600 font-bold hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                <CloseOutlined class="text-sm" /> Reject
            </button>
            <button @click="handleAction('approve')" :disabled="processing"
                class="flex-1 h-12 rounded-xl bg-blue-600 !text-white font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30">
                <CheckOutlined class="text-sm !text-white" /> Approve
            </button>
        </div>
    </div>
    
    <div v-else class="flex items-center justify-center min-h-screen text-gray-400 bg-gray-50">
        <LoadingOutlined class="text-2xl" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { 
    MailOutlined, PhoneOutlined, CalendarFilled, 
    FileTextFilled, CloseOutlined, CheckOutlined, LoadingOutlined, SafetyCertificateFilled
} from '@ant-design/icons-vue'
import { useNuxtApp } from '#app'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const router = useRouter()
const { $api } = useNuxtApp()

const visitor = ref<any>(null)
const processing = ref(false)

onMounted(async () => {
    try {
        const id = route.params.id as string
        const response = await $api<any>(`/api/portal/visitors/public/review/${id}/`)
        
        if (response.success) {
            visitor.value = response.data
            
            // Auto action
            const action = route.query.action as string
            if (action === 'approve' || action === 'reject') {
                await handleAction(action)
            }
        } else {
            message.error(response.message || 'Visitor request not found')
        }
    } catch (e: any) {
        message.error(e.message || 'Failed to load visitor details')
    }
})

const handleAction = async (action: 'approve' | 'reject') => {
    if (!visitor.value) return
    processing.value = true
    try {
        const id = route.params.id as string
        const response = await $api<any>(`/api/portal/visitors/public/review/${id}/`, {
            method: 'POST',
            body: { action }
        })
        
        if (response.success) {
            // Redirect to success page
            await router.push({
                path: '/public/visitor/review/action-complete',
                query: {
                    status: action === 'approve' ? 'approved' : 'rejected',
                    name: visitor.value.name,
                    company: visitor.value.company || visitor.value.from_company,
                    photo: visitor.value.photoUrl
                }
            })
        } else {
            message.error(response.message || 'Action failed')
        }
    } catch (e: any) {
        message.error(e.message || 'Action failed')
    } finally {
        processing.value = false
    }
}
</script>
