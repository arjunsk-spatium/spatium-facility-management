<template>
    <div class="h-full flex flex-col animate-slide-up">
        <!-- Close Button -->
        <div class="flex justify-between items-center mb-6 px-2">
            <NuxtLink to="/public/visitor" class="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center -ml-2 transition-colors">
                <CloseOutlined class="text-xl text-gray-900" />
            </NuxtLink>
            <h1 class="text-lg font-bold text-gray-900">Visitor Pass</h1>
            <button @click="router.push('/public/visitor')" class="text-blue-600 font-bold text-sm">Done</button>
        </div>

        <template v-if="currentVisitor">
            <!-- Pass Card -->
            <div class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden relative flex-1 mb-8 flex flex-col max-w-sm mx-auto w-full">
                <!-- Header Component -->
                <div class="bg-blue-600 h-32 relative flex-shrink-0">
                     <div class="absolute top-4 right-4 bg-white/20 backdrop-blur-md px-3 py-1 rounded-lg flex items-center gap-1.5 border border-white/30">
                        <SafetyCertificateFilled class="text-white text-xs" />
                        <span class="text-white text-[10px] font-bold tracking-wide">SECURE</span>
                     </div>
                </div>

                <!-- Avatar & Info -->
                <div class="text-center relative px-6 -mt-16 pb-6 border-b border-gray-100 border-dashed">
                    <div class="relative inline-block mb-3">
                        <div class="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white">
                            <img :src="currentVisitor.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentVisitor.name}`" 
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white shadow-sm">
                            <CheckOutlined :style="{ fontSize: '14px' }" />
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ currentVisitor.name }}</h2>
                    <div class="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">VISITOR • CONTRACTOR</div>
                    
                    <div class="inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="text-green-700 text-xs font-bold">Active Pass</span>
                    </div>
                </div>

                <!-- Details List -->
                <div class="p-6 space-y-4 flex-1">
                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                            <BankFilled />
                        </div>
                        <div>
                            <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">VISITING</div>
                            <div class="font-bold text-gray-900 text-sm leading-tight">
                                {{ currentVisitor.hostName }} ({{ currentVisitor.company || 'Innovation Corp' }})
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                            <ClockCircleFilled />
                        </div>
                        <div>
                            <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">VALID UNTIL</div>
                            <div class="font-bold text-gray-900 text-sm leading-tight">
                                {{ new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) }} | 05:00 PM
                            </div>
                        </div>
                    </div>

                    <!-- QR Code -->
                     <div class="bg-gray-50 border border-gray-100 rounded-2xl p-6 mt-4 flex items-center justify-center relative group">
                        <div class="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-2xl cursor-pointer">
                            <span class="font-bold text-gray-900">View Fullscreen</span>
                        </div>
                        <div class="bg-white p-2 rounded-xl shadow-sm">
                             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=PASS-12345" class="w-32 h-32 rounded-lg" />
                        </div>
                     </div>
                     <div class="text-center text-[10px] font-mono text-gray-400 tracking-widest">ID: 8823-9912-VIS</div>
                </div>
            </div>

            <!-- Add to Wallet Button -->
            <button class="w-full bg-black text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-900 transition-transform active:scale-95 shadow-xl">
                <AppleFilled class="text-xl" />
                Add to Apple Wallet
            </button>
            <div class="flex gap-4 mt-4">
                <button class="flex-1 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                    <ShareAltOutlined /> Share Pass
                </button>
                 <button class="flex-1 h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                    <DownloadOutlined /> Save PDF
                </button>
            </div>
        </template>

         <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <LoadingOutlined class="text-3xl mb-4" />
                <p>Retrieving pass details...</p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { 
    CloseOutlined, CheckOutlined, SafetyCertificateFilled, 
    BankFilled, ClockCircleFilled, AppleFilled, ShareAltOutlined,
    DownloadOutlined, LoadingOutlined
} from '@ant-design/icons-vue'


definePageMeta({
    layout: 'public'
})

const router = useRouter()
const store = useVisitorStore()
const { currentVisitor } = storeToRefs(store)

onMounted(() => {
    if (!currentVisitor.value) {
        // Redirect if no visitor data is present (prevent direct access)
       router.push('/public/visitor')
    }
})
</script>

<style scoped>
.animate-slide-up {
    animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(40px); }
    to { opacity: 1; transform: translateY(0); }
}
</style>
