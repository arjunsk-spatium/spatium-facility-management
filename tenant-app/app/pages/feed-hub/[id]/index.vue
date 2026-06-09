<template>
    <div class="max-w-3xl mx-auto space-y-6">
        <a-button type="link" @click="router.push('/feed-hub')">
            <template #icon>
                <ArrowLeftOutlined />
            </template>
            Back to Feed Hub
        </a-button>

        <div v-if="loading && !post" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>

        <template v-else-if="post">
            <!-- Post Card -->
            <FeedHubCard :post="post" @like-toggled="handleLikeToggled" @deleted="handleDeleted" />

            <!-- Comments Section -->
            <a-card title="Comments">
                <div v-if="commentsLoading" class="flex justify-center py-8">
                    <a-spin />
                </div>

                <div v-else-if="comments.length === 0" class="text-center py-8">
                    <a-empty description="No comments yet. Be the first to comment!" />
                </div>

                <CommentThread v-else :comments="comments" @reply-added="handleReplyAdded" />

                <!-- Add Comment -->
                <div class="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-700">
                    <CommentInput placeholder="Write a comment..." submit-text="Comment" :loading="commentLoading"
                        @submit="handleAddComment" />
                </div>
            </a-card>
        </template>

        <a-card v-else class="text-center py-12">
            <a-empty description="Post not found" />
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'
import FeedHubCard from '../../components/feed/FeedHubCard.vue'
import CommentThread from '../../components/feed/CommentThread.vue'
import CommentInput from '../../components/feed/CommentInput.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const route = useRoute()
const router = useRouter()
const store = useFeedStore()

const post = computed(() => store.currentPost)
const loading = computed(() => store.loading)
const comments = computed(() => store.comments)
const commentsLoading = computed(() => store.loading)
const commentLoading = ref(false)

const handleLikeToggled = () => {
    // Store already updated locally
}

const handleDeleted = () => {
    router.push('/feed-hub')
}

const handleAddComment = async (text: string) => {
    commentLoading.value = true
    try {
        await store.addComment(route.params.id as string, text)
        message.success('Comment added')
    } catch (err) {
        message.error('Failed to add comment')
    } finally {
        commentLoading.value = false
    }
}

const handleReplyAdded = () => {
    // Refresh comments to show new reply
    store.fetchComments(route.params.id as string)
}

onMounted(() => {
    store.fetchPost(route.params.id as string, 'client')
    store.fetchComments(route.params.id as string)
})
</script>
