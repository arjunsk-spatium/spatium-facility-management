<template>
    <div v-if="visitor" class="max-w-md mx-auto min-h-screen bg-gray-50 flex flex-col font-sans">
        <!-- Header -->
        <div class="bg-white px-4 py-4 flex items-center justify-center border-b border-gray-100 sticky top-0 z-10">
            <h1 class="font-bold text-lg text-gray-900">Review Request</h1>
        </div>

        <div class="flex-1 p-4 pb-24 overflow-y-auto space-y-4">
             <!-- Status Banner -->
             <div class="bg-yellow-50 text-yellow-700 px-4 py-2 rounded-lg text-xs font-bold text-center border border-yellow-100 uppercase tracking-wide flex items-center justify-center gap-2">
                <div class="w-2 h-2 bg-yellow-400 rounded-full"></div>
                Pending Approval
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
                 <div class="text-sm font-medium text-blue-600">{{ visitor.company }}</div>
                 <div class="text-xs text-gray-400 mt-1">{{ visitor.role || 'Sr. Security Consultant' }}</div>
                 
                 <div class="grid grid-cols-2 gap-3 mt-6">
                     <button class="h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100">
                        <MailOutlined /> Email
                     </button>
                     <button class="h-10 rounded-xl bg-gray-50 border border-gray-100 text-gray-700 font-bold text-xs flex items-center justify-center gap-2 hover:bg-gray-100">
                        <PhoneOutlined /> Call
                     </button>
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
                        {{ new Date(visitor.visitDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) }}
                     </div>
                     <div class="text-xs text-gray-500 mt-0.5">10:00 AM - 11:30 AM <span class="text-gray-300 ml-1">(90 min)</span></div>
                 </div>
             </div>

             <!-- Info Card: Purpose -->
              <div class="bg-white rounded-2xl p-4 shadow-sm border border-gray-50 flex gap-4 items-start">
                 <div class="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shrink-0">
                     <FileTextFilled />
                 </div>
                 <div>
                     <div class="text-xs text-gray-400 mb-0.5">Purpose</div>
                     <div class="font-bold text-gray-900 text-sm">{{ visitor.visitPurpose || 'Meeting' }}</div>
                     <div class="text-xs text-gray-500 mt-0.5 leading-relaxed">
                        Meeting to discuss the security protocols for the upcoming release cycle.
                     </div>
                 </div>
             </div>
        </div>

        <!-- Bottom Actions -->
        <div class="fixed bottom-0 left-0 w-full bg-white p-4 border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex gap-4 z-20">
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
    FileTextFilled, CloseOutlined, CheckOutlined, LoadingOutlined 
} from '@ant-design/icons-vue'
import { useVisitorService, type Visitor } from '../../../../../composables/visitorService'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const router = useRouter()
const { getVisitors, updateVisitorStatus } = useVisitorService()

const visitor = ref<Visitor | null>(null)
const processing = ref(false)

onMounted(async () => {
    // In a real app, we would getById. Here we fetch all and find
    const visitors = await getVisitors()
    const found = visitors.find(v => v.id === route.params.id)
    if (found) {
        visitor.value = found
    } else {
        message.error('Visitor request not found')
        // Mock data for display if ID not found in mock list (since we generate random IDs)
        visitor.value = {
            id: route.params.id as string,
            name: 'Sarah Connor',
            email: 'sarah@example.com',
            phone: '555-0123',
            company: 'Cyberdyne Systems',
            visitPurpose: 'Project SkyNet Review',
            hostName: 'Miles Dyson',
            status: 'pending',
            visitDate: new Date().toISOString()
        } as Visitor
    }
})

const handleAction = async (action: 'approve' | 'reject') => {
    if (!visitor.value) return
    processing.value = true
    try {
        const newStatus = action === 'approve' ? 'approved' : 'rejected'
        await updateVisitorStatus(visitor.value.id, newStatus)
        message.success(`Request ${action}d`)
        // In real flow, maybe redirect to a list or show success state
        router.back()
    } catch (e) {
        message.error('Action failed')
    } finally {
        processing.value = false
    }
}
</script>
