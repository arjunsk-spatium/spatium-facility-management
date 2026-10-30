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
                        <div class="w-28 h-28 rounded-full border-4 border-white shadow-md overflow-hidden bg-white cursor-pointer" @click.stop="openImagePreview">
                            <img :src="currentVisitor.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentVisitor.name}`" 
                                class="w-full h-full object-cover" />
                        </div>
                        <div class="absolute bottom-1 right-1 w-8 h-8 rounded-full bg-green-500 border-4 border-white flex items-center justify-center text-white shadow-sm">
                            <CheckOutlined :style="{ fontSize: '14px' }" />
                        </div>
                    </div>

                    <h2 class="text-2xl font-bold text-gray-900 mb-1">{{ currentVisitor.name }}</h2>
                    <div class="text-xs font-bold text-gray-400 tracking-widest uppercase mb-4">{{ visitorTypeLabel }}</div>
                    
                    <div class="inline-flex items-center gap-2 bg-green-50 px-4 py-1.5 rounded-full border border-green-100">
                        <div class="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span class="text-green-700 text-xs font-bold">{{ statusLabel }}</span>
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
                                {{ currentVisitor.company_name || 'N/A' }}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                            <EnvironmentFilled />
                        </div>
                        <div>
                            <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">FACILITY</div>
                            <div class="font-bold text-gray-900 text-sm leading-tight">
                                {{ currentVisitor.facility_name || 'N/A' }}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                            <ClockCircleFilled />
                        </div>
                        <div>
                            <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">CHECK-IN TIME</div>
                            <div class="font-bold text-gray-900 text-sm leading-tight">
                                {{ formatCheckInTime }}
                            </div>
                        </div>
                    </div>

                    <div class="flex items-start gap-4">
                        <div class="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 text-lg">
                            <AimOutlined />
                        </div>
                        <div>
                            <div class="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-0.5">PURPOSE</div>
                            <div class="font-bold text-gray-900 text-sm leading-tight">
                                {{ currentVisitor.purpose_of_visit || 'N/A' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Save Pass button -->
            <a v-if="currentVisitor.visitor_pass_url" :href="currentVisitor.visitor_pass_url" target="_blank" class="w-full h-12 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 no-underline">
                <DownloadOutlined /> Save Pass
            </a>
        </template>

         <template v-else>
            <div class="flex-1 flex flex-col items-center justify-center text-gray-400">
                <LoadingOutlined class="text-3xl mb-4" />
                <p>Retrieving pass details...</p>
            </div>
        </template>
    </div>
</template>

<ImagePreviewModal v-model:open="showImagePreview" :src="previewImageUrl" alt="Visitor Photo" />

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { 
    CloseOutlined, CheckOutlined, SafetyCertificateFilled, 
    BankFilled, ClockCircleFilled, EnvironmentFilled, AimOutlined,
    DownloadOutlined, LoadingOutlined
} from '@ant-design/icons-vue'
definePageMeta({
    layout: 'public'
})

const { formatDisplayDateTime } = useDate()

const router = useRouter()
const store = useVisitorStore()
const { currentVisitor } = storeToRefs(store)
const isApproved = computed(() => currentVisitor.value?.status === 'Approved')

const showImagePreview = ref(false)
const previewImageUrl = ref('')

const openImagePreview = () => {
    previewImageUrl.value = currentVisitor.value?.image_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentVisitor.value?.name}`
    showImagePreview.value = true
}

const visitorTypeLabel = computed(() => {
    const type = currentVisitor.value?.visitor_type
    if (type === 'pre_invite') return 'PRE-INVITED'
    if (type === 'walk_in') return 'WALK-IN'
    return 'VISITOR'
})

const statusLabel = computed(() => {
    const status = currentVisitor.value?.status
    if (status === 'Approved') return 'Active Pass'
    if (status === 'Pending') return 'Pending Approval'
    if (status === 'Rejected') return 'Pass Rejected'
    return status || 'Unknown'
})

const formatCheckInTime = computed(() => {
    if (!currentVisitor.value?.check_in_time) return 'N/A'
    return formatDisplayDateTime(currentVisitor.value.check_in_time)
})

onMounted(() => {
    if (!currentVisitor.value || !isApproved.value) {
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
