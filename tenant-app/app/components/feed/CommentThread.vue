<template>
    <div class="space-y-4">
        <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
            <a-avatar v-if="comment.user_profile?.profile_photo" :src="comment.user_profile.profile_photo"
                size="default" />
            <a-avatar v-else size="default">{{ getInitials(comment.user_profile?.employee_name) }}</a-avatar>

            <div class="flex-1">
                <div class="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
                    <div class="flex justify-between items-start">
                        <span class="font-medium text-sm">{{ comment.user_profile?.employee_name }}</span>
                        <span class="text-xs text-neutral-500">{{ formatDate(comment.created_at) }}</span>
                    </div>
                    <p class="text-sm text-neutral-700 dark:text-neutral-300 mt-1">{{ comment.comment }}</p>
                </div>

                <div class="flex gap-4 mt-1 ml-2">
                    <a-button type="link" size="small" class="p-0 h-auto" @click="toggleReply(comment.id)">
                        Reply
                    </a-button>
                </div>

                <!-- Reply Input -->
                <div v-if="activeReplyId === comment.id" class="mt-3 ml-4">
                    <CommentInput placeholder="Write a reply..." submit-text="Reply" :loading="replyLoading"
                        @submit="(text) => handleReply(comment.id, text)" @cancel="activeReplyId = null" />
                </div>

                <!-- Replies -->
                <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-4 space-y-3">
                    <div v-for="reply in comment.replies" :key="reply.id" class="flex gap-3">
                        <a-avatar v-if="reply.user_profile?.profile_photo" :src="reply.user_profile.profile_photo"
                            size="small" />
                        <a-avatar v-else size="small">{{ getInitials(reply.user_profile?.employee_name)
                            }}</a-avatar>
                        <div class="flex-1 bg-neutral-50 dark:bg-neutral-800 rounded-lg p-2">
                            <div class="flex justify-between items-start">
                                <span class="font-medium text-xs">{{ reply.user_profile?.employee_name }}</span>
                                <span class="text-xs text-neutral-500">{{ formatDate(reply.created_at) }}</span>
                            </div>
                            <p class="text-xs text-neutral-700 dark:text-neutral-300 mt-1">{{ reply.comment }}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CommentInput from './CommentInput.vue'
import type { FeedComment } from '../../../composables/feedService'

const props = defineProps<{
    comments: FeedComment[]
}>()

const emit = defineEmits<{
    replyAdded: []
}>()

const store = useFeedStore()
const activeReplyId = ref<string | null>(null)
const replyLoading = ref(false)

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

const toggleReply = (commentId: string) => {
    activeReplyId.value = activeReplyId.value === commentId ? null : commentId
}

const handleReply = async (commentId: string, text: string) => {
    replyLoading.value = true
    try {
        await store.addReply(commentId, text)
        activeReplyId.value = null
        emit('replyAdded')
    } catch (err) {
        console.error('Failed to add reply:', err)
    } finally {
        replyLoading.value = false
    }
}
</script>
