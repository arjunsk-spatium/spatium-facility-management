<template>
    <a-card class="hover:shadow-md transition-shadow">
        <div class="flex flex-col gap-3">
            <!-- Header -->
            <div class="flex items-center gap-3">
                <a-avatar v-if="post.created_by_profile?.profile_photo" :src="post.created_by_profile.profile_photo"
                    size="large" />
                <a-avatar v-else size="large">{{ getInitials(post.created_by_profile?.employee_name) }}</a-avatar>
                <div class="flex-1">
                    <div class="font-medium">{{ post.created_by_profile?.employee_name }}</div>
                    <div class="text-sm text-neutral-500">{{ post.created_by_profile?.designation }}</div>
                </div>
                <div class="flex items-center gap-2">
                    <a-tag :color="getCategoryColor(post.category?.slug)" size="small">
                        {{ post.category?.name }}
                    </a-tag>
                    <span class="text-xs text-neutral-500">{{ formatDate(post.published_at) }}</span>
                </div>
            </div>

            <!-- Content -->
            <NuxtLink :to="`/feed-hub/${post.id}`" class="block">
                <h3 v-if="post.title" class="text-lg font-semibold mb-2 hover:text-primary-600">{{ post.title }}</h3>
                <p class="text-neutral-700 dark:text-neutral-300 line-clamp-3">{{ post.description }}</p>
            </NuxtLink>

            <!-- Image -->
            <img v-if="post.image" :src="post.image" alt="Post image" class="max-h-80 rounded-lg object-cover" />

            <!-- Event Card -->
            <a-card v-if="post.event" class="bg-blue-50 dark:bg-blue-900/20 border-blue-200">
                <div class="flex items-center gap-2">
                    <CalendarOutlined class="text-blue-600" />
                    <span class="font-semibold text-sm text-blue-800 dark:text-blue-200">
                        {{ post.event.event_date }} &middot; {{ post.event.start_time }} - {{ post.event.end_time }}
                    </span>
                </div>
                <div class="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    <EnvironmentOutlined class="mr-1" /> {{ post.event.venue }}
                </div>
            </a-card>

            <!-- Actions -->
            <div class="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-700">
                <a-space size="large">
                    <a-button type="text" size="small" :class="{ 'text-red-500': post.user_has_liked }"
                        @click="handleLike">
                        <template #icon>
                            <HeartFilled v-if="post.user_has_liked" />
                            <HeartOutlined v-else />
                        </template>
                        {{ post.likes_count }}
                    </a-button>
                    <NuxtLink :to="`/feed-hub/${post.id}`">
                        <a-button type="text" size="small">
                            <template #icon>
                                <CommentOutlined />
                            </template>
                            {{ post.comments_count }}
                        </a-button>
                    </NuxtLink>
                </a-space>

                <a-popconfirm v-if="canDelete" title="Delete this post?" ok-text="Yes" cancel-text="No"
                    @confirm="handleDelete">
                    <a-button type="text" danger size="small">
                        <template #icon>
                            <DeleteOutlined />
                        </template>
                    </a-button>
                </a-popconfirm>
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
    HeartOutlined,
    HeartFilled,
    CommentOutlined,
    CalendarOutlined,
    EnvironmentOutlined,
    DeleteOutlined,
} from '@ant-design/icons-vue'
import type { FeedPost } from '../../../composables/feedService'

const props = defineProps<{
    post: FeedPost
}>()

const emit = defineEmits<{
    likeToggled: []
    deleted: []
}>()

const store = useFeedStore()
const authStore = useAuthStore()

const canDelete = computed(() => {
    return props.post.created_by_profile?.user_id === authStore.user?.id
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

const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const handleLike = async () => {
    try {
        await store.toggleLike(props.post.id)
        emit('likeToggled')
    } catch (err) {
        console.error('Failed to toggle like:', err)
    }
}

const handleDelete = async () => {
    try {
        await store.deleteClientPost(props.post.id)
        emit('deleted')
    } catch (err) {
        console.error('Failed to delete post:', err)
    }
}
</script>
