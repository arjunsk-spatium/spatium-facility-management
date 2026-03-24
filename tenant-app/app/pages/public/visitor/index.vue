<template>
    <div class="space-y-5 w-full">
        <!-- Loading State -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
            <LoadingOutlined class="text-3xl text-blue-600 mb-4" />
            <p class="text-gray-500 text-sm">Loading facilities...</p>
        </div>

        <!-- No Facility Selected - Show Facility List -->
        <template v-else-if="!facilityId">
            <div class="text-center space-y-1 mb-6">
                <h1 class="text-2xl font-bold text-gray-900 leading-tight">
                    Select Facility
                </h1>
                <p class="text-gray-500 text-sm max-w-xs mx-auto">
                    Choose a facility to continue.
                </p>
            </div>

            <div v-if="facilities.length === 0" class="flex flex-col items-center justify-center py-12 space-y-4">
                <div class="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                    <HomeOutlined class="text-3xl" />
                </div>
                <p class="text-gray-500 text-sm">No facilities available.</p>
            </div>

            <div v-else class="space-y-3">
                <NuxtLink v-for="fac in facilities" :key="fac.id"
                    :to="`/public/visitor/register?facility_id=${fac.id}&tenant=${tenantId}`"
                    class="block group">
                    <div
                        class="bg-white p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all flex items-center gap-4">
                        <div class="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img v-if="fac.image_url" :src="fac.image_url" :alt="fac.name" class="w-full h-full object-cover" />
                            <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                                <HomeOutlined class="text-xl" />
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <h3 class="text-base font-bold text-gray-900 truncate">{{ fac.name }}</h3>
                            <p class="text-sm text-gray-500 truncate">{{ fac.city_details?.name || '' }}, {{ fac.country_details?.name || '' }}</p>
                        </div>
                        <div class="w-8 h-8 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                            <RightOutlined />
                        </div>
                    </div>
                </NuxtLink>
            </div>
        </template>

        <!-- Error State -->
        <div v-else-if="error" class="flex flex-col items-center justify-center py-20 space-y-4">
            <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500">
                <ExclamationCircleOutlined class="text-3xl" />
            </div>
            <h2 class="text-xl font-bold text-gray-900">Facility Not Found</h2>
            <p class="text-gray-500 text-sm text-center max-w-xs">{{ error }}</p>
            <NuxtLink to="/public/visitor" class="text-blue-600 font-semibold text-sm hover:underline">
                Select a different facility
            </NuxtLink>
        </div>

        <!-- Content (Single Facility View) -->
        <template v-else>
            <!-- Hero Section -->
            <div class="relative w-full h-52 rounded-2xl overflow-hidden border border-gray-100">
                <img :src="facility?.image_url || 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'"
                    :alt="facility?.name || 'Office'" class="w-full h-full object-cover" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-6">
                    <div class="text-white text-xl font-bold">{{ facility?.name || 'Facility' }}</div>
                </div>
            </div>

            <!-- Back to facilities -->
            <NuxtLink to="/public/visitor" class="inline-flex items-center text-gray-600 hover:text-gray-900 text-sm">
                <LeftOutlined class="mr-1" /> Change Facility
            </NuxtLink>

            <!-- Welcome Text -->
            <div class="text-center space-y-1">
                <h1 class="text-2xl font-bold text-gray-900 leading-tight">
                    Welcome to <br />
                    <span class="text-blue-600">{{ store.tenantName }}</span>
                </h1>
                <p class="text-gray-500 text-sm max-w-xs mx-auto">
                    Please select an option below to begin your check-in process.
                </p>
            </div>

            <!-- Action Cards -->
            <div class="space-y-3">
                <NuxtLink :to="`/public/visitor/register?facility_id=${facilityId}&tenant=${tenantId}`"
                    class="block group">
                    <div class="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <UserAddOutlined class="text-xl" />
                            </div>
                            <div class="text-left">
                                <h3 class="text-base font-bold text-gray-900">Walk-in Visitor</h3>
                                <p class="text-sm text-gray-500">Register at the front desk</p>
                            </div>
                        </div>
                        <div class="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-blue-50 flex items-center justify-center text-gray-400 group-hover:text-blue-500 transition-colors">
                            <RightOutlined />
                        </div>
                    </div>
                </NuxtLink>

                <NuxtLink to="/public/visitor/invite" class="block group">
                    <div class="bg-white p-5 rounded-xl border border-gray-100 hover:border-blue-100 hover:shadow-md transition-all flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <QrcodeOutlined class="text-xl" />
                            </div>
                            <div class="text-left">
                                <h3 class="text-base font-bold text-gray-900">Pre-invited Visitor</h3>
                                <p class="text-sm text-gray-500">Scan QR code or enter ID</p>
                            </div>
                        </div>
                        <div class="w-9 h-9 rounded-full bg-gray-50 group-hover:bg-purple-50 flex items-center justify-center text-gray-400 group-hover:text-purple-500 transition-colors">
                            <RightOutlined />
                        </div>
                    </div>
                </NuxtLink>
            </div>

            <!-- Help Link -->
            <div class="text-center pt-2">
                <a href="#" class="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
                    <span class="bg-blue-100 p-1 rounded-full">
                        <CustomerServiceOutlined />
                    </span>
                    Need help? Contact Reception
                </a>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
    UserAddOutlined, QrcodeOutlined, RightOutlined, CustomerServiceOutlined,
    LoadingOutlined, ExclamationCircleOutlined, HomeOutlined, LeftOutlined
} from '@ant-design/icons-vue'

definePageMeta({
    layout: 'public'
})

const route = useRoute()
const store = useTenantStore()
const { getFacility, getFacilities } = usePublicVisitorService()

const facilityId = computed(() => (route.query.facility as string) || '')
const tenantId = computed(() => (route.query.tenant as string) || '')

const facility = ref<{ id: string; name: string; image_url: string | null; [key: string]: any } | null>(null)
const facilities = ref<{ id: string; name: string; image_url: string | null; city_details?: { name: string }; country_details?: { name: string }; [key: string]: any }[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
    if (facilityId.value) {
        loading.value = true
        try {
            const result = await getFacility(facilityId.value)
            if (result) {
                facility.value = result
            } else {
                error.value = 'The facility could not be found. Please check the link and try again.'
            }
        } catch (e) {
            error.value = 'Failed to load facility information. Please try again later.'
        } finally {
            loading.value = false
        }
    } else {
        loading.value = true
        try {
            facilities.value = await getFacilities()
        } catch (e) {
            console.error('Failed to load facilities', e)
        } finally {
            loading.value = false
        }
    }
})
</script>