<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center p-4 transition-colors duration-300">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Banners</h1>
            <NuxtLink to="/banners/create">
                <a-button type="primary" size="large">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <span class="hidden sm:inline">Banner</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Stats Section -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Banners" :value="stats.total" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <PictureOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Active" :value="stats.active" :value-style="{ color: '#52c41a' }">
                    <template #prefix>
                        <CheckCircleOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Global" :value="stats.global" :value-style="{ color: '#722ed1' }">
                    <template #prefix>
                        <GlobalOutlined />
                    </template>
                </a-statistic>
            </a-card>
        </div>

        <!-- Search and Actions Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:mb-4 md:px-0">
            <span class="text-lg font-semibold">Banner List</span>
            <div class="flex items-center gap-3">
                <a-input-search v-model:value="searchText" placeholder="Search banners..." style="width: 250px"
                    allow-clear @search="handleSearch" />
            </div>
        </div>

        <!-- Data View -->
        <ResponsiveDataView :columns="columns" :data="banners" :loading="loading"
            :row-key="(record: any) => record.id" :pagination="paginationConfig" @change="handleTableChange">
            <!-- Desktop Table Cells -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'title'">
                    <NuxtLink :to="`/banners/${record.id}`"
                        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        {{ record.title }}
                    </NuxtLink>
                </template>
                <template v-if="column.key === 'category'">
                    <a-tag :color="getCategoryColor(record.category)">
                        {{ formatCategory(record.category) }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'status'">
                    <a-tag :color="record.is_active ? 'success' : 'default'">
                        {{ record.is_active ? 'Active' : 'Inactive' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'scope'">
                    <a-tag :color="record.is_global ? 'purple' : 'blue'">
                        {{ record.is_global ? 'Global' : 'Tenant' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'image'">
                    <img v-if="record.image_url" :src="record.image_url" alt="Banner"
                        class="h-10 w-16 object-cover rounded border border-neutral-200 dark:border-neutral-700" />
                    <span v-else class="text-neutral-400 text-sm">No image</span>
                </template>
                <template v-if="column.key === 'updated_at'">
                    {{ formatDate(record.updated_at) }}
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <NuxtLink :to="`/banners/${record.id}`">
                            <a-button type="link" size="small">View</a-button>
                        </NuxtLink>
                        <NuxtLink :to="`/banners/${record.id}/edit`">
                            <a-button type="link" size="small">Edit</a-button>
                        </NuxtLink>
                        <a-popconfirm title="Are you sure you want to delete this banner?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="link" danger size="small">Delete</a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record: banner }">
                <a-card class="mb-4">
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-start">
                            <NuxtLink :to="`/banners/${banner.id}`"
                                class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                {{ banner.title }}
                            </NuxtLink>
                            <a-tag :color="getCategoryColor(banner.category)">
                                {{ formatCategory(banner.category) }}
                            </a-tag>
                        </div>
                        <p class="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{{ banner.description }}</p>
                        <div class="flex items-center gap-2">
                            <img v-if="banner.image_url" :src="banner.image_url" alt="Banner"
                                class="h-12 w-20 object-cover rounded border border-neutral-200 dark:border-neutral-700" />
                            <div class="flex flex-col gap-1 text-sm">
                                <a-tag :color="banner.is_active ? 'success' : 'default'" size="small">
                                    {{ banner.is_active ? 'Active' : 'Inactive' }}
                                </a-tag>
                                <a-tag :color="banner.is_global ? 'purple' : 'blue'" size="small">
                                    {{ banner.is_global ? 'Global' : 'Tenant' }}
                                </a-tag>
                            </div>
                        </div>
                        <div class="text-xs text-neutral-500">
                            Updated {{ formatDate(banner.updated_at) }}
                        </div>
                        <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <NuxtLink :to="`/banners/${banner.id}`">
                                <a-button type="default" size="small">View</a-button>
                            </NuxtLink>
                            <NuxtLink :to="`/banners/${banner.id}/edit`">
                                <a-button type="default" size="small">Edit</a-button>
                            </NuxtLink>
                            <a-popconfirm title="Delete this banner?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(banner.id)">
                                <a-button type="default" danger size="small">Delete</a-button>
                            </a-popconfirm>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    GlobalOutlined,
} from '@ant-design/icons-vue'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'

definePageMeta({ layout: 'default' })

const store = useBannerStore()
const banners = computed(() => store.banners)
const loading = computed(() => store.loading)
const searchText = ref('')

const stats = computed(() => ({
    total: store.count,
    active: store.activeBanners,
    global: store.globalBanners,
}))

const columns = [
    { title: 'Title', key: 'title', dataIndex: 'title', ellipsis: true },
    { title: 'Category', key: 'category', dataIndex: 'category', width: 140 },
    { title: 'Status', key: 'status', width: 120 },
    { title: 'Scope', key: 'scope', width: 120 },
    { title: 'Image', key: 'image', width: 120 },
    { title: 'Updated', key: 'updated_at', dataIndex: 'updated_at', width: 160 },
    { title: 'Action', key: 'action', fixed: 'right', width: 180 },
]

const paginationConfig = computed(() => ({
    current: store.page,
    pageSize: store.pageSize,
    total: store.count,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number) => `Total ${total} banners`,
}))

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

const handleSearch = () => {
    store.fetchBanners({ search: searchText.value, page: 1 })
}

const handleDelete = async (id: string) => {
    try {
        await store.deleteBanner(id)
        message.success('Banner deleted successfully')
    } catch (err) {
        message.error('Failed to delete banner')
    }
}

const handleTableChange = (pagination: any) => {
    store.fetchBanners({
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText.value || undefined,
    })
}

onMounted(() => {
    store.fetchBanners()
})
</script>
