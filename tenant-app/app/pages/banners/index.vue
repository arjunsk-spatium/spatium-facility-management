<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Banners</h1>
            <NuxtLink to="/banners/create">
                <a-button type="primary" size="medium">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <span class="hidden sm:inline">Banner</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Stats -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Banners" :value="stats.total" :value-style="{ color: '#3f8600' }">
                    <template #prefix>
                        <PictureOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Active" :value="stats.active" :value-style="{ color: '#1677ff' }">
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

        <!-- Search and Actions -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:mb-4 md:px-0">
            <span class="text-lg font-semibold">Banner List</span>
            <div class="flex items-center gap-3">
                <a-input-search v-model:value="searchText" placeholder="Search banners..." style="width: 250px"
                    allow-clear @search="handleSearch" />
            </div>
        </div>

        <ResponsiveDataView :columns="columns" :data="banners" :loading="loading"
            :row-key="(record: any) => record.id" :pagination="paginationConfig">
            <!-- Desktop Table Cells -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'title'">
                    <div class="flex items-center gap-3">
                        <img v-if="record.image_url" :src="record.image_url" :alt="record.title"
                            class="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
                        <div class="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700"
                            v-else>
                            <PictureOutlined class="text-neutral-400" />
                        </div>
                        <span class="font-medium">{{ record.title }}</span>
                    </div>
                </template>
                <template v-if="column.key === 'status'">
                    <a-switch
                        :checked="record.is_active"
                        :loading="togglingBannerId === record.id"
                        checked-children="Active"
                        un-checked-children="Inactive"
                        @change="(checked: any) => handleToggleActive(record, Boolean(checked))"
                    />
                </template>
                <template v-if="column.key === 'scope'">
                    <a-tag :color="record.is_global ? 'purple' : 'blue'">
                        {{ record.is_global ? 'Global' : 'Tenant' }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <a-button type="link" @click="openEditModal(record)">Edit</a-button>
                        <a-popconfirm title="Are you sure you want to delete this banner?" ok-text="Yes"
                            cancel-text="No" @confirm="handleDelete(record.id)">
                            <a-button type="link" danger>Delete</a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record: banner }">
                <a-card class="mb-4">
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-start">
                            <div class="flex items-center gap-3">
                                <img v-if="banner.image_url" :src="banner.image_url" :alt="banner.title"
                                    class="w-12 h-12 object-cover rounded-lg border border-neutral-200 dark:border-neutral-700" />
                                <div class="w-12 h-12 rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center border border-neutral-200 dark:border-neutral-700"
                                    v-else>
                                    <PictureOutlined class="text-neutral-400" />
                                </div>
                                <span class="text-lg font-semibold">{{ banner.title }}</span>
                            </div>
                        </div>

                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="text-neutral-500 dark:text-neutral-400 text-xs uppercase">Category</span>
                                <p class="capitalize">{{ banner.category }}</p>
                            </div>
                            <div>
                                <span class="text-neutral-500 dark:text-neutral-400 text-xs uppercase">Status</span>
                                <div class="mt-1">
                                    <a-switch
                                        :checked="banner.is_active"
                                        :loading="togglingBannerId === banner.id"
                                        checked-children="Active"
                                        un-checked-children="Inactive"
                                        @change="(checked: any) => handleToggleActive(banner, Boolean(checked))"
                                    />
                                </div>
                            </div>
                            <div>
                                <span class="text-neutral-500 dark:text-neutral-400 text-xs uppercase">Scope</span>
                                <p>
                                    <a-tag :color="banner.is_global ? 'purple' : 'blue'" class="mt-1">
                                        {{ banner.is_global ? 'Global' : 'Tenant' }}
                                    </a-tag>
                                </p>
                            </div>
                            <div v-if="banner.created_at">
                                <span class="text-neutral-500 dark:text-neutral-400 text-xs uppercase">Created</span>
                                <p>{{ formatDisplayDate(banner.created_at) }}</p>
                            </div>
                        </div>

                        <div v-if="banner.link" class="text-sm">
                            <span class="text-neutral-500 dark:text-neutral-400 text-xs uppercase">Link</span>
                            <a :href="banner.link" target="_blank" class="text-primary-600 block truncate">
                                {{ banner.link }}
                            </a>
                        </div>

                        <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <a-button type="default" size="small" @click="openEditModal(banner)">Edit</a-button>
                            <a-popconfirm title="Are you sure you want to delete this banner?" ok-text="Yes"
                                cancel-text="No" @confirm="handleDelete(banner.id)">
                                <a-button type="default" danger size="small">Delete</a-button>
                            </a-popconfirm>
                        </div>
                    </div>
                </a-card>
            </template>
        </ResponsiveDataView>

        <!-- Edit Banner Modal -->
        <a-modal v-model:open="isEditModalVisible" title="Edit Banner" :footer="null" width="850px" destroy-on-close>
            <BannerForm
                :initial-values="editingBannerInitialValues"
                submit-text="Update Banner"
                :loading="editLoading"
                @submit="handleUpdateBanner"
                @cancel="isEditModalVisible = false"
            />
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBannerStore } from '../../../stores/banner'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    PictureOutlined,
    CheckCircleOutlined,
    GlobalOutlined
} from '@ant-design/icons-vue'
import ResponsiveDataView from '../../../components/ResponsiveDataView.vue'
import BannerForm from '../../../components/banners/BannerForm.vue'
import { useDate } from '../../../composables/useDate'

definePageMeta({
    middleware: 'auth'
})

const store = useBannerStore()
const { banners, loading, count, page, pageSize } = storeToRefs(store)
const { formatDisplayDate } = useDate()

const searchText = ref('')

const isEditModalVisible = ref(false)
const editLoading = ref(false)
const editingBannerId = ref<string | null>(null)
const editingBannerInitialValues = ref<any>({})
const togglingBannerId = ref<string | null>(null)

const stats = computed(() => ({
    total: count.value,
    active: banners.value.filter(b => b.is_active).length,
    global: banners.value.filter(b => b.is_global).length
}))

const handleSearch = () => {
    store.fetchBanners({ search: searchText.value || undefined, page: 1 })
}

const openEditModal = (record: any) => {
    editingBannerId.value = record.id
    editingBannerInitialValues.value = {
        title: record.title || '',
        description: record.description || '',
        category: record.category || 'general',
        link: record.link || '',
        link_title: record.link_title || '',
        is_active: record.is_active ?? true,
        image: record.image_url || record.image || null
    }
    isEditModalVisible.value = true
}

const handleUpdateBanner = async (formData: any) => {
    if (!editingBannerId.value) return
    editLoading.value = true
    try {
        await store.updateBannerAction(editingBannerId.value, formData)
        message.success('Banner updated successfully')
        isEditModalVisible.value = false
        await store.fetchBanners({ search: searchText.value || undefined, page: page.value })
    } catch (error: any) {
        const errorMsg = error?.data?.message || error?.data?.error?.message || error?.data?.error || error?.message || 'Failed to update banner'
        message.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to update banner')
    } finally {
        editLoading.value = false
    }
}

const handleToggleActive = async (record: any, checked: boolean) => {
    togglingBannerId.value = record.id
    try {
        await store.updateBannerAction(record.id, { is_active: checked } as any)
        message.success(`Banner ${checked ? 'activated' : 'deactivated'} successfully`)
        await store.fetchBanners({ search: searchText.value || undefined, page: page.value })
    } catch (error: any) {
        const errorMsg = error?.data?.message || error?.data?.error?.message || error?.data?.error || error?.message || 'Failed to update banner status'
        message.error(typeof errorMsg === 'string' ? errorMsg : 'Failed to update banner status')
    } finally {
        togglingBannerId.value = null
    }
}

const handleDelete = async (id: string) => {
    try {
        await store.deleteBannerAction(id)
        message.success('Banner deleted successfully')
    } catch (error) {
        message.error('Failed to delete banner')
    }
}

const columns = [
    {
        title: 'Title',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: 'Category',
        dataIndex: 'category',
        key: 'category',
        customRender: ({ text }: { text: string }) => text.charAt(0).toUpperCase() + text.slice(1)
    },
    {
        title: 'Status',
        key: 'status',
    },
    {
        title: 'Scope',
        key: 'scope',
    },
    {
        title: 'Created',
        dataIndex: 'created_at',
        key: 'created_at',
        customRender: ({ text }: { text: string }) => text ? formatDisplayDate(text) : '-'
    },
    {
        title: 'Action',
        key: 'action',
    },
]

const paginationConfig = computed(() => ({
    total: count.value,
    current: page.value,
    pageSize: pageSize.value,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50', '100'],
    showTotal: (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total} banners`,
    onChange: (pageNum: number, newPageSize: number) => {
        if (newPageSize !== pageSize.value) {
            store.fetchBanners({ search: searchText.value || undefined, page: 1, page_size: newPageSize })
        } else {
            store.fetchBanners({ search: searchText.value || undefined, page: pageNum })
        }
    },
}))

onMounted(() => {
    store.fetchBanners()
})
</script>
