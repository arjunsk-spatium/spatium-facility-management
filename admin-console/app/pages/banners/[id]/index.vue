<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <!-- Back Button -->
        <a-button type="link" @click="router.push('/banners')">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Back to Banners
        </a-button>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <!-- Banner Detail -->
        <template v-else-if="banner">
            <a-card>
                <div class="flex flex-col gap-4">
                    <!-- Header -->
                    <div class="flex justify-between items-start">
                        <div>
                            <a-tag :color="getCategoryColor(banner.category)" class="mb-2">
                                {{ formatCategory(banner.category) }}
                            </a-tag>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ banner.title }}</h1>
                        </div>
                        <a-space>
                            <NuxtLink :to="`/banners/${banner.id}/edit`">
                                <a-button type="primary">
                                    <template #icon>
                                        <EditOutlined />
                                    </template>
                                    Edit
                                </a-button>
                            </NuxtLink>
                            <a-popconfirm title="Delete this banner?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete">
                                <a-button type="primary" danger>
                                    <template #icon>
                                        <DeleteOutlined />
                                    </template>
                                    Delete
                                </a-button>
                            </a-popconfirm>
                        </a-space>
                    </div>

                    <!-- Image -->
                    <img v-if="banner.image_url" :src="banner.image_url" alt="Banner image"
                        class="max-h-96 rounded-lg object-cover w-full" />

                    <!-- Description -->
                    <p class="text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{{ banner.description }}</p>

                    <!-- Link -->
                    <a v-if="banner.link" :href="banner.link" target="_blank" rel="noopener"
                        class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline break-all">
                        <LinkOutlined />
                        {{ banner.link }}
                    </a>

                    <!-- Metadata -->
                    <a-card class="bg-neutral-50 dark:bg-neutral-800">
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-neutral-500">Status:</span>
                                <a-tag :color="banner.is_active ? 'success' : 'default'" class="ml-2">
                                    {{ banner.is_active ? 'Active' : 'Inactive' }}
                                </a-tag>
                            </div>
                            <div>
                                <span class="text-neutral-500">Scope:</span>
                                <a-tag :color="banner.is_global ? 'purple' : 'blue'" class="ml-2">
                                    {{ banner.is_global ? 'Global' : 'Tenant' }}
                                </a-tag>
                            </div>
                            <div v-if="!banner.is_global && tenantIds.length > 0">
                                <span class="text-neutral-500">Tenants:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <a-tag v-for="tid in tenantIds" :key="tid" size="small">{{ tenantName(tid) }}</a-tag>
                                </div>
                            </div>
                            <div>
                                <span class="text-neutral-500">Created:</span>
                                <span class="ml-2 font-medium">{{ formatDate(banner.created_at) }}</span>
                            </div>
                            <div>
                                <span class="text-neutral-500">Updated:</span>
                                <span class="ml-2 font-medium">{{ formatDate(banner.updated_at) }}</span>
                            </div>
                        </div>
                    </a-card>
                </div>
            </a-card>
        </template>

        <!-- Not Found -->
        <a-card v-else class="text-center py-12">
            <a-empty description="Banner not found" />
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
    ArrowLeftOutlined,
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue'

definePageMeta({ layout: 'default' })

const route = useRoute()
const router = useRouter()
const store = useBannerStore()

const banner = computed(() => store.currentBanner)
const loading = computed(() => store.loading)
const tenantStore = useTenantStore()

const tenantIds = computed(() => {
    if (!banner.value?.tenant) return []
    return Array.isArray(banner.value.tenant) ? banner.value.tenant : [banner.value.tenant]
})

const tenantName = (id: string) => {
    return tenantStore.tenants.find(t => t.id === id)?.name || id
}

const categoryColors: Record<string, string> = {
    maintenance: 'orange',
    announcement: 'blue',
    promotion: 'purple',
    general: 'default',
}

const getCategoryColor = (category?: string) => {
    return categoryColors[category || ''] || 'default'
}

const formatCategory = (category?: string) => {
    if (!category) return 'Unknown'
    return category.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const handleDelete = async () => {
    try {
        await store.deleteBanner(route.params.id as string)
        message.success('Banner deleted successfully')
        router.push('/banners')
    } catch (err) {
        message.error('Failed to delete banner')
    }
}

onMounted(() => {
    store.fetchBanner(route.params.id as string)
    tenantStore.fetchTenants()
})
</script>
