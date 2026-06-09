<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center p-4 transition-colors duration-300">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Feed Posts</h1>
            <NuxtLink to="/feed/create">
                <a-button type="primary" size="large">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <span class="hidden sm:inline">Post</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Stats Section -->
        <div class="flex flex-wrap gap-4">
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Total Posts" :value="stats.total" :value-style="{ color: '#1677ff' }">
                    <template #prefix>
                        <NotificationOutlined />
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
                <a-statistic title="Events" :value="stats.events" :value-style="{ color: '#faad14' }">
                    <template #prefix>
                        <CalendarOutlined />
                    </template>
                </a-statistic>
            </a-card>
            <a-card class="flex-grow min-w-[160px]">
                <a-statistic title="Announcements" :value="stats.announcements" :value-style="{ color: '#722ed1' }">
                    <template #prefix>
                        <SoundOutlined />
                    </template>
                </a-statistic>
            </a-card>
        </div>

        <!-- Search and Actions Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 md:mb-4 md:px-0">
            <span class="text-lg font-semibold">Post List</span>
            <div class="flex items-center gap-3">
                <a-input-search v-model:value="searchText" placeholder="Search posts..." style="width: 250px"
                    allow-clear @search="handleSearch" />
            </div>
        </div>

        <!-- Data View -->
        <ResponsiveDataView :columns="columns" :data="posts" :loading="loading"
            :row-key="(record: any) => record.id" :pagination="paginationConfig">
            <!-- Desktop Table Cells -->
            <template #bodyCell="{ column, record }">
                <template v-if="column.key === 'title'">
                    <NuxtLink :to="`/feed/${record.id}`"
                        class="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium">
                        {{ record.title }}
                    </NuxtLink>
                </template>
                <template v-if="column.key === 'category'">
                    <a-tag :color="getCategoryColor(record.category?.slug)">
                        {{ record.category?.name }}
                    </a-tag>
                </template>
                <template v-if="column.key === 'scope_type'">
                    <a-tag>{{ formatScopeType(record.scope_type) }}</a-tag>
                </template>
                <template v-if="column.key === 'creator'">
                    <div class="flex items-center gap-2">
                        <a-avatar v-if="record.created_by_profile?.profile_photo" :src="record.created_by_profile.profile_photo" size="small" />
                        <a-avatar v-else size="small">{{ getInitials(record.created_by_profile?.employee_name) }}</a-avatar>
                        <span>{{ record.created_by_profile?.employee_name }}</span>
                    </div>
                </template>
                <template v-if="column.key === 'engagement'">
                    <a-space>
                        <span><LikeOutlined /> {{ record.likes_count }}</span>
                        <span><CommentOutlined /> {{ record.comments_count }}</span>
                    </a-space>
                </template>
                <template v-if="column.key === 'published_at'">
                    {{ formatDate(record.published_at) }}
                </template>
                <template v-if="column.key === 'action'">
                    <a-space>
                        <NuxtLink :to="`/feed/${record.id}`">
                            <a-button type="link" size="small">View</a-button>
                        </NuxtLink>
                        <a-popconfirm title="Are you sure you want to delete this post?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete(record.id)">
                            <a-button type="link" danger size="small">Delete</a-button>
                        </a-popconfirm>
                    </a-space>
                </template>
            </template>

            <!-- Mobile Card Content -->
            <template #mobileCard="{ record: post }">
                <a-card class="mb-4">
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-between items-start">
                            <NuxtLink :to="`/feed/${post.id}`"
                                class="text-lg font-semibold text-primary-600 dark:text-primary-400">
                                {{ post.title }}
                            </NuxtLink>
                            <a-tag :color="getCategoryColor(post.category?.slug)">
                                {{ post.category?.name }}
                            </a-tag>
                        </div>
                        <p class="text-sm text-neutral-600 dark:text-neutral-300 line-clamp-2">{{ post.description }}</p>
                        <div class="flex items-center gap-2 text-sm">
                            <a-avatar v-if="post.created_by_profile?.profile_photo" :src="post.created_by_profile.profile_photo" size="small" />
                            <a-avatar v-else size="small">{{ getInitials(post.created_by_profile?.employee_name) }}</a-avatar>
                            <span>{{ post.created_by_profile?.employee_name }}</span>
                        </div>
                        <div class="flex justify-between text-sm text-neutral-500">
                            <span><LikeOutlined /> {{ post.likes_count }}</span>
                            <span><CommentOutlined /> {{ post.comments_count }}</span>
                            <span>{{ formatDate(post.published_at) }}</span>
                        </div>
                        <div class="flex justify-end gap-2 mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-700">
                            <NuxtLink :to="`/feed/${post.id}`">
                                <a-button type="default" size="small">View</a-button>
                            </NuxtLink>
                            <a-popconfirm title="Delete this post?" ok-text="Yes" cancel-text="No"
                                @confirm="handleDelete(post.id)">
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
    NotificationOutlined,
    CheckCircleOutlined,
    CalendarOutlined,
    SoundOutlined,
    LikeOutlined,
    CommentOutlined,
} from '@ant-design/icons-vue'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'

definePageMeta({ layout: 'default' })

const store = useFeedStore()
const posts = computed(() => store.posts)
const loading = computed(() => store.loading)
const searchText = ref('')

const stats = computed(() => ({
    total: store.count,
    active: store.activePosts,
    events: store.eventPosts,
    announcements: store.announcementPosts,
}))

const columns = [
    { title: 'Title', key: 'title', dataIndex: 'title', ellipsis: true },
    { title: 'Category', key: 'category', dataIndex: 'category', width: 140 },
    { title: 'Scope', key: 'scope_type', dataIndex: 'scope_type', width: 140 },
    { title: 'Creator', key: 'creator', width: 160 },
    { title: 'Engagement', key: 'engagement', width: 140 },
    { title: 'Published', key: 'published_at', dataIndex: 'published_at', width: 160 },
    { title: 'Action', key: 'action', fixed: 'right', width: 140 },
]

const paginationConfig = computed(() => ({
    current: store.page,
    pageSize: store.pageSize,
    total: store.count,
    showSizeChanger: true,
    pageSizeOptions: ['10', '20', '50'],
    showTotal: (total: number) => `Total ${total} posts`,
}))

const getCategoryColor = (slug?: string) => {
    const colors: Record<string, string> = {
        announcement: 'blue',
        appreciation: 'gold',
        birthday: 'pink',
        event: 'orange',
        general: 'default',
        work_anniversary: 'green',
    }
    return colors[slug || ''] || 'default'
}

const formatScopeType = (scope: string) => {
    return scope.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
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
    store.fetchPosts({ search: searchText.value, page: 1 })
}

const handleDelete = async (id: string) => {
    try {
        await store.deletePost(id)
        message.success('Post deleted successfully')
    } catch (err) {
        message.error('Failed to delete post')
    }
}

const handleTableChange = (pagination: any) => {
    store.fetchPosts({
        page: pagination.current,
        page_size: pagination.pageSize,
        search: searchText.value || undefined,
    })
}

onMounted(() => {
    store.fetchPosts()
})
</script>
