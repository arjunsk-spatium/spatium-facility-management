<template>
    <div class="flex flex-col items-center">
        <!-- View Mode Selector -->
        <div class="flex items-center gap-2 mb-4 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-lg text-xs">
            <button type="button" class="px-3 py-1.5 rounded-md font-medium transition-all"
                :class="previewMode === 'mobile' ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'"
                @click="previewMode = 'mobile'">
                Mobile App View
            </button>
            <button type="button" class="px-3 py-1.5 rounded-md font-medium transition-all"
                :class="previewMode === 'card' ? 'bg-white dark:bg-neutral-700 text-primary-600 shadow-sm' : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'"
                @click="previewMode = 'card'">
                Banner Card (16:9)
            </button>
        </div>

        <!-- Phone Mockup Container (Mobile View) -->
        <div v-if="previewMode === 'mobile'"
            class="relative w-[320px] rounded-[36px] bg-neutral-900 p-3 shadow-xl ring-1 ring-neutral-800 select-none">
            <!-- Notch / Dynamic Island -->
            <div
                class="absolute top-4 left-1/2 -translate-x-1/2 w-20 h-4 bg-neutral-900 rounded-full z-30 flex items-center justify-center">
                <div class="w-2.5 h-2.5 rounded-full bg-neutral-800/80 mr-3"></div>
                <div class="w-2 h-2 rounded-full bg-neutral-800/60"></div>
            </div>

            <!-- Screen Area -->
            <div
                class="rounded-[26px] overflow-hidden bg-[#f7f9fd] dark:bg-neutral-900 flex flex-col relative min-h-[580px] max-h-[600px] overflow-y-auto no-scrollbar">
                <!-- Blue Header Background: Solid #2248ac with symmetrical rounded-b-[26px] -->
                <div class="bg-[#2248ac] text-white pt-2.5 px-4 pb-10 rounded-b-[26px] relative z-0">
                    <!-- Status Bar -->
                    <div class="flex justify-between items-center pt-1 pb-2 text-white text-[11px] font-semibold">
                        <span>9:41</span>
                        <div class="flex items-center gap-1.5 text-xs">
                            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L12 22l7.03-4.39C20.26 16.07 21 14.12 21 12c0-4.97-4.03-9-9-9z" opacity="0.3" />
                                <path d="M12 3L3 17.61C4.23 16.07 4.97 14.12 4.97 12c0-3.87 3.13-7 7.03-7s7.03 3.13 7.03 7c0 2.12.74 4.07 1.97 5.61L12 3z" />
                            </svg>
                            <svg class="w-3 h-3 fill-current" viewBox="0 0 24 24">
                                <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 3.5c3.67 0 7.03 1.41 9.57 3.73L12 19.38 2.43 11.23C4.97 8.91 8.33 7.5 12 7.5z" />
                            </svg>
                            <div class="w-4 h-2 rounded-sm border border-white/80 p-0.5 flex items-center">
                                <div class="h-full w-2.5 bg-white rounded-2xs"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Top Pills Row -->
                    <div class="flex justify-between items-center mb-2.5">
                        <div
                            class="bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1.5 text-[11px] font-medium text-white shadow-xs">
                            <BankOutlined class="text-[10px]" />
                            <span class="max-w-[130px] truncate">{{ displayTenantName }}</span>
                            <span class="text-[9px] opacity-80">▾</span>
                        </div>
                        <div
                            class="bg-blue-600/70 backdrop-blur-md rounded-full px-2.5 py-1 flex items-center gap-1 text-[11px] font-bold text-yellow-300 shadow-xs">
                            <span>🪙</span>
                            <span class="text-white font-semibold">9079</span>
                        </div>
                    </div>

                    <!-- Greeting -->
                    <div class="mt-1">
                        <h2 class="text-xl font-bold text-white tracking-tight leading-tight">
                            Hi, {{ displayUserName }}
                        </h2>
                        <p class="text-[11px] text-blue-100/90 mt-1 leading-tight">
                            Everything you need to manage your workplace, in one place
                        </p>
                    </div>
                </div>

                <!-- The Live Banner Card (16:9 Aspect Ratio) Overlapping the Blue Header -->
                <!-- Sits over the boundary between the blue header and the light body -->
                <div class="px-3.5 -mt-8 relative z-10">
                    <div class="rounded-2xl relative overflow-hidden shadow-lg border border-white/40 aspect-[16/9] w-full bg-neutral-900">
                        <!-- When an image is uploaded: The uploaded 16:9 image fills the entire card with the action button -->
                        <div v-if="imageUrl" class="relative w-full h-full group">
                            <img :src="imageUrl" alt="Uploaded Banner" class="w-full h-full object-cover" />
                            <!-- Subtle bottom gradient for button contrast -->
                            <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                            <!-- Action Button (using link_title / buttonText) -->
                            <div class="absolute bottom-3 left-3.5 z-10">
                                <span
                                    class="inline-flex items-center px-3 py-1 bg-white text-[#1b449c] font-bold text-[11px] rounded-full shadow-md select-none">
                                    {{ buttonText }}
                                </span>
                            </div>
                            <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[9px] text-white/90 px-1.5 py-0.5 rounded font-medium">
                                16:9 Banner
                            </div>
                        </div>

                        <!-- When NO image is uploaded: The whole light blue card is the placeholder -->
                        <div v-else class="w-full h-full p-3.5 flex items-center justify-between gap-2.5 relative select-none"
                            style="background: linear-gradient(135deg, #5b7fc4 0%, #7e9bd3 50%, #9cb5e4 100%);">
                            <!-- Background glow effect -->
                            <div
                                class="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-white/15 blur-xl pointer-events-none">
                            </div>

                            <!-- Left: Placeholder Title, Description, Button -->
                            <div class="flex-1 min-w-0 pr-1 relative z-10">
                                <h3 class="text-white font-bold text-sm leading-snug line-clamp-2">
                                    {{ displayTitle }}
                                </h3>
                                <p class="text-blue-50 text-[11px] mt-1 line-clamp-2 leading-tight">
                                    {{ displayDescription }}
                                </p>
                                <div class="mt-2.5">
                                    <span
                                        class="inline-flex items-center px-3 py-1 bg-white text-[#1b449c] font-bold text-[11px] rounded-full shadow-sm">
                                        {{ buttonText }}
                                    </span>
                                </div>
                            </div>

                            <!-- Right: The round illustration circle of the placeholder -->
                            <div
                                class="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-white/60 shadow-md bg-[#182136] flex items-center justify-center relative z-10">
                                <div class="w-full h-full bg-gradient-to-br from-[#1e2a47] to-[#0f172a] flex flex-col items-center justify-center text-center p-1 shadow-inner relative">
                                    <span class="text-2xl drop-shadow-sm">🛋️</span>
                                    <span class="text-[7.5px] font-bold text-blue-200/90 uppercase tracking-wider mt-0.5">Boardroom</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Below Banner: Quick Actions -->
                <div class="px-4 pt-4 pb-2">
                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100">Quick Actions</span>
                        <span class="text-[10px] font-semibold text-primary-600">View More</span>
                    </div>
                    <div class="grid grid-cols-2 gap-2">
                        <div
                            class="bg-blue-50/70 dark:bg-neutral-800 rounded-xl p-2.5 flex items-center gap-2 border border-blue-100/50 dark:border-neutral-700/50">
                            <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
                                🪪
                            </div>
                            <span class="text-xs font-medium text-neutral-800 dark:text-neutral-200">Access Pass</span>
                        </div>
                        <div
                            class="bg-blue-50/70 dark:bg-neutral-800 rounded-xl p-2.5 flex items-center gap-2 border border-blue-100/50 dark:border-neutral-700/50">
                            <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
                                👥
                            </div>
                            <span class="text-xs font-medium text-neutral-800 dark:text-neutral-200">Visitors</span>
                        </div>
                        <div
                            class="bg-blue-50/70 dark:bg-neutral-800 rounded-xl p-2.5 flex items-center gap-2 border border-blue-100/50 dark:border-neutral-700/50">
                            <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
                                🛋️
                            </div>
                            <span class="text-xs font-medium text-neutral-800 dark:text-neutral-200">Meeting Room</span>
                        </div>
                        <div
                            class="bg-blue-50/70 dark:bg-neutral-800 rounded-xl p-2.5 flex items-center gap-2 border border-blue-100/50 dark:border-neutral-700/50">
                            <div class="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white text-xs">
                                🛠️
                            </div>
                            <span class="text-xs font-medium text-neutral-800 dark:text-neutral-200">Facility Support</span>
                        </div>
                    </div>
                </div>

                <!-- Bookings Section -->
                <div class="px-4 pt-2 pb-4">
                    <div class="flex justify-between items-center mb-2.5">
                        <span class="text-xs font-bold text-neutral-900 dark:text-neutral-100">Bookings</span>
                        <span class="text-[10px] font-semibold text-primary-600">View More</span>
                    </div>
                    <div
                        class="bg-white dark:bg-neutral-800 rounded-xl p-2.5 border border-neutral-200/80 dark:border-neutral-700 flex gap-2.5 items-center shadow-2xs">
                        <div
                            class="w-14 h-14 rounded-lg bg-neutral-200 dark:bg-neutral-700 overflow-hidden shrink-0 flex items-center justify-center text-neutral-400">
                            🏢
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between">
                                <span class="text-xs font-bold text-neutral-900 dark:text-white truncate">HQ Boardroom
                                    2</span>
                                <span
                                    class="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">Today</span>
                            </div>
                            <p class="text-[10px] text-neutral-500 truncate mt-0.5">Orbit, 5th Floor, Spatium Commercio
                            </p>
                            <div class="flex items-center gap-1.5 mt-1 text-[9px] text-neutral-600 dark:text-neutral-300">
                                <span class="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded">📅 2026-08-30</span>
                                <span class="bg-neutral-100 dark:bg-neutral-700 px-1 py-0.5 rounded">⏰ 13:00 - 13:30</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Banner Card 16:9 View (Expanded) -->
        <div v-else class="w-full max-w-[380px]">
            <div class="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-900">
                <!-- When an image is uploaded: The uploaded 16:9 image fills the entire card with action button -->
                <template v-if="imageUrl">
                    <img :src="imageUrl" alt="Uploaded Banner" class="w-full h-full object-cover" />
                    <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none"></div>
                    <div class="absolute bottom-4 left-4 z-10">
                        <span
                            class="inline-flex items-center px-4 py-1.5 bg-white text-[#1b449c] font-bold text-xs rounded-full shadow-md select-none">
                            {{ buttonText }}
                        </span>
                    </div>
                    <div class="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-[10px] text-white/90 px-2 py-0.5 rounded font-medium">
                        16:9 Banner
                    </div>
                </template>

                <!-- When NO image is uploaded: The whole light blue area is the placeholder -->
                <div v-else class="w-full h-full flex items-center justify-between p-5 relative select-none"
                    style="background: linear-gradient(135deg, #5b7fc4 0%, #7e9bd3 50%, #9cb5e4 100%);">
                    <div class="flex-1 min-w-0 pr-3 relative z-10">
                        <h3 class="text-white font-bold text-base sm:text-lg leading-tight line-clamp-2">
                            {{ displayTitle }}
                        </h3>
                        <p class="text-blue-50 text-xs mt-1.5 line-clamp-2 leading-snug">
                            {{ displayDescription }}
                        </p>
                        <div class="mt-3">
                            <span
                                class="inline-flex items-center px-4 py-1.5 bg-white text-[#1b449c] font-bold text-xs rounded-full shadow-sm">
                                {{ buttonText }}
                            </span>
                        </div>
                    </div>

                    <div
                        class="w-22 h-22 rounded-full overflow-hidden shrink-0 border-2 border-white/60 shadow-md bg-neutral-900 flex items-center justify-center relative z-10">
                        <div class="w-full h-full bg-gradient-to-br from-red-900 to-neutral-950 flex items-center justify-center text-red-400 text-3xl shadow-inner">
                            🦸
                        </div>
                    </div>
                </div>
            </div>
            <div class="mt-2 text-center text-xs text-neutral-500">
                Aspect ratio: 16:9 &bull; Live Preview
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { PictureOutlined, BankOutlined } from '@ant-design/icons-vue'

interface Props {
    title?: string
    description?: string
    imageUrl?: string | null
    link?: string
    linkTitle?: string
    category?: string
    tenantName?: string
    userName?: string
}

const props = withDefaults(defineProps<Props>(), {
    title: '',
    description: '',
    imageUrl: null,
    link: '',
    linkTitle: '',
    category: 'general',
    tenantName: '',
    userName: ''
})

const previewMode = ref<'mobile' | 'card'>('mobile')

const displayTitle = computed(() => {
    return props.title.trim() || 'Book Meeting Rooms'
})

const displayDescription = computed(() => {
    return props.description.trim() || 'Block the perfect meeting room in just a few taps'
})

const displayTenantName = computed(() => {
    return props.tenantName || 'Spatium Commercio'
})

const displayUserName = computed(() => {
    return props.userName || 'Dafiya'
})

const buttonText = computed(() => {
    if (props.linkTitle && props.linkTitle.trim()) {
        return props.linkTitle.trim()
    }
    if (props.category === 'maintenance') return 'View Details'
    if (props.category === 'announcement') return 'Learn More'
    if (props.category === 'promotion') return 'Claim Now'
    if (props.category === 'event') return 'Join Event'
    return 'Book Now'
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
    display: none;
}
.no-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>
