<template>
    <div class="space-y-4">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
            <NuxtLink to="/feed/create">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create Post
                </a-button>
            </NuxtLink>
        </div>

        <!-- Two Column Layout: 4:1 ratio -->
        <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left: All Feeds (My Posts) -->
            <div class="flex-[4] min-w-0">
                <div class="flex items-center gap-2 mb-4">
                    <h2 class="text-lg font-semibold">All Feeds</h2>
                    <a-badge :count="myPostsCount" :overflow-count="99" />
                </div>

                <div v-if="myPostsLoading && myPosts.length === 0" class="flex justify-center py-12">
                    <a-spin size="large" />
                </div>
                <div v-else-if="myPosts.length === 0" class="text-center py-12 bg-white dark:bg-neutral-900 rounded-lg">
                    <a-empty description="No posts created yet" />
                </div>
                <div v-else class="grid gap-4">
                    <a-card v-for="post in myPosts" :key="post.id" class="hover:shadow-md transition-shadow max-w-2xl">
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-2 flex-wrap">
                                    <a-tag :color="getCategoryColor(post.category?.slug)">
                                        {{ post.category?.name }}
                                    </a-tag>
                                    <a-tag v-if="post.scope_type">{{ formatScopeType(post.scope_type) }}</a-tag>
                                    <a-tag v-else>All</a-tag>
                                </div>
                                <span class="text-sm text-neutral-500">{{ formatDate(post.published_at) }}</span>
                            </div>
                            <NuxtLink :to="`/feed/${post.id}`"
                                class="text-lg font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                {{ post.title }}
                            </NuxtLink>
                            <p class="text-neutral-600 dark:text-neutral-300 line-clamp-3">{{ post.description }}</p>
                            <a v-if="post.link" :href="post.link" target="_blank" rel="noopener"
                                class="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline break-all">
                                <LinkOutlined />
                                <span class="truncate">{{ post.link }}</span>
                            </a>
                            <img v-if="post.image" :src="post.image" alt="Post image" class="max-h-64 rounded-lg object-cover" />
                            <div class="flex justify-between items-center pt-2 border-t border-neutral-100 dark:border-neutral-700">
                                <a-space>
                                    <span class="text-sm text-neutral-500"><LikeOutlined /> {{ post.likes_count }}</span>
                                    <span class="text-sm text-neutral-500"><CommentOutlined /> {{ post.comments_count }}</span>
                                </a-space>
                                <a-space>
                                    <NuxtLink :to="`/feed/${post.id}`">
                                        <a-button type="link" size="small">View</a-button>
                                    </NuxtLink>
                                    <a-popconfirm title="Delete this post?" ok-text="Yes" cancel-text="No"
                                        @confirm="handleDelete(post.id)">
                                        <a-button type="link" danger size="small">Delete</a-button>
                                    </a-popconfirm>
                                </a-space>
                            </div>
                        </div>
                    </a-card>
                    <!-- My Posts Pagination -->
                    <div v-if="myPostsCount > 10" class="flex justify-center pt-4">
                        <a-pagination :current="myPostsPage" :total="myPostsCount" :page-size="10"
                            @change="handleMyPostsPageChange" />
                    </div>
                </div>
            </div>

            <!-- Right: Incoming -->
            <div class="flex-1 min-w-0 lg:border-l lg:border-neutral-200 lg:dark:border-neutral-700 lg:pl-6">
                <div class="flex items-center gap-2 mb-4">
                    <h2 class="text-lg font-semibold">Incoming</h2>
                    <a-badge :count="incomingCount" :overflow-count="99" />
                </div>

                <div v-if="incomingLoading && incomingPosts.length === 0" class="flex justify-center py-12">
                    <a-spin size="large" />
                </div>
                <div v-else-if="incomingPosts.length === 0" class="text-center py-12 bg-white dark:bg-neutral-900 rounded-lg">
                    <a-empty description="No incoming posts" />
                </div>
                <div v-else class="grid gap-3">
                    <a-card v-for="post in incomingPosts" :key="post.id" class="hover:shadow-md transition-shadow" size="small">
                        <div class="flex flex-col gap-2">
                            <div class="flex justify-between items-start">
                                <a-tag :color="getCategoryColor(post.category?.slug)" size="small">
                                    {{ post.category?.name }}
                                </a-tag>
                                <span class="text-xs text-neutral-500">{{ formatDate(post.published_at) }}</span>
                            </div>
                            <h3 class="text-sm font-semibold line-clamp-2">{{ post.title }}</h3>
                            <p class="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">{{ post.description }}</p>
                            <a v-if="post.link" :href="post.link" target="_blank" rel="noopener"
                                class="inline-flex items-center gap-1 text-xs text-primary-600 hover:underline break-all">
                                <LinkOutlined />
                                <span class="truncate max-w-[200px]">{{ post.link }}</span>
                            </a>
                            <div class="flex items-center gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-700">
                                <a-avatar v-if="post.created_by_profile?.profile_photo" :src="post.created_by_profile.profile_photo" size="small" />
                                <a-avatar v-else size="small">{{ getInitials(post.created_by_profile?.employee_name) }}</a-avatar>
                                <span class="text-xs text-neutral-500">{{ post.created_by_profile?.employee_name }}</span>
                            </div>
                            <a-button type="primary" size="small" block @click="openTransferModal(post.id)">
                                Transfer
                            </a-button>
                        </div>
                    </a-card>
                    <!-- Incoming Pagination -->
                    <div v-if="incomingCount > 10" class="flex justify-center pt-2">
                        <a-pagination :current="incomingPage" :total="incomingCount" :page-size="10" size="small"
                            @change="handleIncomingPageChange" />
                    </div>
                </div>
            </div>
        </div>

        <!-- Transfer Modal -->
        <TransferModal :visible="transferModalVisible" :post-id="selectedPostId" @ok="handleTransfer"
            @cancel="transferModalVisible = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    LikeOutlined,
    CommentOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue'
import TransferModal from '../../components/feed/TransferModal.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const store = useFeedStore()

const incomingPosts = computed(() => store.incomingPosts)
const myPosts = computed(() => store.myPosts)
const incomingLoading = computed(() => store.loading)
const myPostsLoading = computed(() => store.loading)
const incomingCount = computed(() => store.incomingCount)
const myPostsCount = computed(() => store.myPostsCount)

const incomingPage = ref(1)
const myPostsPage = ref(1)

const transferModalVisible = ref(false)
const selectedPostId = ref<string | null>(null)

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

const formatScopeType = (scope?: string) => {
    if (!scope) return 'All'
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

const openTransferModal = (postId: string) => {
    selectedPostId.value = postId
    transferModalVisible.value = true
}

const handleTransfer = async (postId: string, facilityIds: string[]) => {
    try {
        await store.transferPost(postId, facilityIds)
        message.success('Post transferred successfully')
        transferModalVisible.value = false
    } catch (err) {
        message.error('Failed to transfer post')
    }
}

const handleDelete = async (id: string) => {
    try {
        await store.deleteAdminPost(id)
        message.success('Post deleted successfully')
    } catch (err) {
        message.error('Failed to delete post')
    }
}

const handleIncomingPageChange = (page: number) => {
    incomingPage.value = page
    store.fetchIncomingPosts({ page })
}

const handleMyPostsPageChange = (page: number) => {
    myPostsPage.value = page
    store.fetchMyPosts({ page })
}

onMounted(() => {
    store.fetchIncomingPosts()
    store.fetchMyPosts()
})
</script>
