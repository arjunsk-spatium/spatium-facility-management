<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Feed</h1>
            <NuxtLink v-if="activeTab === 'my_posts'" to="/feed/create">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create Post
                </a-button>
            </NuxtLink>
        </div>

        <!-- Tabs -->
        <a-tabs v-model:activeKey="activeTab">
            <a-tab-pane key="incoming" tab="Incoming">
                <div v-if="incomingLoading" class="flex justify-center py-12">
                    <a-spin size="large" />
                </div>
                <div v-else-if="incomingPosts.length === 0" class="text-center py-12">
                    <a-empty description="No incoming posts" />
                </div>
                <div v-else class="grid gap-4">
                    <a-card v-for="post in incomingPosts" :key="post.id" class="hover:shadow-md transition-shadow">
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-2">
                                    <a-tag :color="getCategoryColor(post.category?.slug)">
                                        {{ post.category?.name }}
                                    </a-tag>
                                    <a-tag color="purple">From Superadmin</a-tag>
                                </div>
                                <span class="text-sm text-neutral-500">{{ formatDate(post.published_at) }}</span>
                            </div>
                            <h3 class="text-lg font-semibold">{{ post.title }}</h3>
                            <p class="text-neutral-600 dark:text-neutral-300 line-clamp-3">{{ post.description }}</p>
                            <img v-if="post.image" :src="post.image" alt="Post image" class="max-h-64 rounded-lg object-cover" />
                            <div class="flex items-center gap-3 py-2 border-t border-neutral-100 dark:border-neutral-700">
                                <a-avatar v-if="post.created_by_profile?.profile_photo" :src="post.created_by_profile.profile_photo" size="small" />
                                <a-avatar v-else size="small">{{ getInitials(post.created_by_profile?.employee_name) }}</a-avatar>
                                <span class="text-sm">{{ post.created_by_profile?.employee_name }}</span>
                            </div>
                            <div class="flex justify-between items-center">
                                <a-space>
                                    <span class="text-sm text-neutral-500"><LikeOutlined /> {{ post.likes_count }}</span>
                                    <span class="text-sm text-neutral-500"><CommentOutlined /> {{ post.comments_count }}</span>
                                </a-space>
                                <a-button type="primary" size="small" @click="openTransferModal(post.id)">
                                    Transfer to Facilities
                                </a-button>
                            </div>
                        </div>
                    </a-card>
                    <!-- Incoming Pagination -->
                    <div v-if="incomingCount > 10" class="flex justify-center pt-4">
                        <a-pagination :current="incomingPage" :total="incomingCount" :page-size="10"
                            @change="handleIncomingPageChange" />
                    </div>
                </div>
            </a-tab-pane>

            <a-tab-pane key="my_posts" tab="My Posts">
                <div v-if="myPostsLoading" class="flex justify-center py-12">
                    <a-spin size="large" />
                </div>
                <div v-else-if="myPosts.length === 0" class="text-center py-12">
                    <a-empty description="No posts created yet" />
                </div>
                <div v-else class="grid gap-4">
                    <a-card v-for="post in myPosts" :key="post.id" class="hover:shadow-md transition-shadow">
                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-start">
                                <div class="flex items-center gap-2">
                                    <a-tag :color="getCategoryColor(post.category?.slug)">
                                        {{ post.category?.name }}
                                    </a-tag>
                                    <a-tag>{{ formatScopeType(post.scope_type) }}</a-tag>
                                </div>
                                <span class="text-sm text-neutral-500">{{ formatDate(post.published_at) }}</span>
                            </div>
                            <NuxtLink :to="`/feed/${post.id}`"
                                class="text-lg font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
                                {{ post.title }}
                            </NuxtLink>
                            <p class="text-neutral-600 dark:text-neutral-300 line-clamp-3">{{ post.description }}</p>
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
            </a-tab-pane>
        </a-tabs>

        <!-- Transfer Modal -->
        <TransferModal :visible="transferModalVisible" :post-id="selectedPostId" @ok="handleTransfer"
            @cancel="transferModalVisible = false" />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    LikeOutlined,
    CommentOutlined,
} from '@ant-design/icons-vue'
import TransferModal from '../../components/feed/TransferModal.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const store = useFeedStore()
const activeTab = ref('incoming')

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

watch(activeTab, (tab) => {
    if (tab === 'incoming') {
        store.fetchIncomingPosts()
    } else if (tab === 'my_posts') {
        store.fetchMyPosts()
    }
})

onMounted(() => {
    store.fetchIncomingPosts()
})
</script>
