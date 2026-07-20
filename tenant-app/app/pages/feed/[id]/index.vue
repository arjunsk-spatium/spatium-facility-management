<template>
    <div class="max-w-4xl mx-auto space-y-6">
        <a-button type="link" @click="router.push('/feed')">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Back to Feed
        </a-button>

        <div v-if="loading" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <template v-else-if="post">
            <a-card>
                <div class="flex flex-col gap-4">
                    <div class="flex justify-between items-start">
                        <div>
                            <a-tag :color="getCategoryColor(post.category?.slug)" class="mb-2">
                                {{ post.category?.name }}
                            </a-tag>
                            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ post.title }}</h1>
                        </div>
                        <a-popconfirm v-if="isMyPost" title="Delete this post?" ok-text="Yes" cancel-text="No"
                            @confirm="handleDelete">
                            <a-button type="primary" danger>
                                <template #icon>
                                    <DeleteOutlined />
                                </template>
                                Delete
                            </a-button>
                        </a-popconfirm>
                    </div>

                    <div class="flex items-center gap-3 py-3 border-y border-neutral-100 dark:border-neutral-700">
                        <a-avatar v-if="post.created_by_profile?.profile_photo"
                            :src="post.created_by_profile.profile_photo" size="large" />
                        <a-avatar v-else size="large">{{ getInitials(post.created_by_profile?.employee_name)
                            }}</a-avatar>
                        <div>
                            <div class="font-medium">{{ post.created_by_profile?.employee_name }}</div>
                            <div class="text-sm text-neutral-500">{{ post.created_by_profile?.designation ||
                                post.creator_type }}</div>
                        </div>
                        <div class="ml-auto text-sm text-neutral-500">
                            {{ formatDate(post.published_at) }}
                        </div>
                    </div>

                    <img v-if="post.image" :src="post.image" alt="Post image" class="max-h-96 rounded-lg object-cover" />

                    <p class="text-base text-neutral-800 dark:text-neutral-200 whitespace-pre-wrap">{{ post.description
                        }}</p>

                    <a v-if="post.link" :href="post.link" target="_blank" rel="noopener"
                        class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 dark:text-primary-400 hover:underline break-all">
                        <LinkOutlined />
                        {{ post.link }}
                    </a>

                    <a-card v-if="post.event" class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                        <div class="flex items-center gap-2 mb-2">
                            <CalendarOutlined class="text-blue-600" />
                            <span class="font-semibold text-blue-800 dark:text-blue-200">Event Details</span>
                        </div>
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-neutral-500">Date:</span>
                                <span class="ml-2 font-medium">{{ post.event.event_date }}</span>
                            </div>
                            <div>
                                <span class="text-neutral-500">Venue:</span>
                                <span class="ml-2 font-medium">{{ post.event.venue }}</span>
                            </div>
                            <div>
                                <span class="text-neutral-500">Start:</span>
                                <span class="ml-2 font-medium">{{ post.event.start_time }}</span>
                            </div>
                            <div>
                                <span class="text-neutral-500">End:</span>
                                <span class="ml-2 font-medium">{{ post.event.end_time }}</span>
                            </div>
                        </div>
                    </a-card>

                    <a-card class="bg-neutral-50 dark:bg-neutral-800">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="text-neutral-500">Scope:</span>
                                <a-tag v-if="post.scope_type" class="ml-2">{{ formatScopeType(post.scope_type) }}</a-tag>
                                <a-tag v-else class="ml-2">All</a-tag>
                            </div>
                            <div>
                                <span class="text-neutral-500">Likes:</span>
                                <span class="ml-2 font-medium">{{ post.allow_likes ? 'Enabled' : 'Disabled' }}</span>
                            </div>
                            <div v-if="post.company_ids && post.company_ids.length > 0" class="col-span-2">
                                <span class="text-neutral-500">Target Companies:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <a-tag v-for="cid in post.company_ids" :key="cid" size="small">{{ cid }}</a-tag>
                                </div>
                            </div>
                            <div v-if="post.facility_ids && post.facility_ids.length > 0" class="col-span-2">
                                <span class="text-neutral-500">Target Facilities:</span>
                                <div class="flex flex-wrap gap-1 mt-1">
                                    <a-tag v-for="fid in post.facility_ids" :key="fid" size="small">{{ fid }}</a-tag>
                                </div>
                            </div>
                        </div>
                    </a-card>
                </div>
            </a-card>
        </template>

        <a-card v-else class="text-center py-12">
            <a-empty description="Post not found" />
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
    CalendarOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const store = useFeedStore()
const authStore = useAuthStore()

const post = computed(() => store.currentPost)
const loading = computed(() => store.loading)

const isMyPost = computed(() => {
    if (!post.value) return false
    return post.value.created_by_profile?.user_id === authStore.user?.id
})

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

const handleDelete = async () => {
    try {
        await store.deleteAdminPost(route.params.id as string)
        message.success('Post deleted successfully')
        router.push('/feed')
    } catch (err) {
        message.error('Failed to delete post')
    }
}

onMounted(() => {
    store.fetchPost(route.params.id as string)
})
</script>
