import { defineStore } from 'pinia'
import {
    useFeedService,
    type FeedPost,
    type FeedComment,
    type FeedCategory,
    type FeedListParams,
    type CreateAdminPostPayload,
    type CreateClientPostPayload,
} from '../composables/feedService'

export const useFeedStore = defineStore('feed', {
    state: () => ({
        // Incoming posts (from superadmin)
        incomingPosts: [] as FeedPost[],
        incomingCount: 0,
        incomingNext: null as string | null,
        incomingPrevious: null as string | null,

        // My posts (tenant admin created)
        myPosts: [] as FeedPost[],
        myPostsCount: 0,
        myPostsNext: null as string | null,
        myPostsPrevious: null as string | null,

        // Client feed hub
        hubPosts: [] as FeedPost[],
        hubCount: 0,
        hubNext: null as string | null,
        hubPrevious: null as string | null,

        // Current post (detail view)
        currentPost: null as FeedPost | null,

        // Comments
        comments: [] as FeedComment[],
        commentsCount: 0,
        commentsNext: null as string | null,
        commentsPrevious: null as string | null,

        // Categories
        categories: [] as FeedCategory[],

        loading: false,
        error: null as string | null,
    }),
    getters: {
        hasNextIncoming: (state) => state.incomingNext !== null,
        hasPreviousIncoming: (state) => state.incomingPrevious !== null,
        hasNextMyPosts: (state) => state.myPostsNext !== null,
        hasPreviousMyPosts: (state) => state.myPostsPrevious !== null,
        hasNextHub: (state) => state.hubNext !== null,
        hasPreviousHub: (state) => state.hubPrevious !== null,
    },
    actions: {
        // ========== Categories ==========
        async fetchCategories() {
            this.loading = true
            this.error = null
            try {
                const { getCategories } = useFeedService()
                this.categories = await getCategories()
            } catch (err: any) {
                this.error = 'Failed to fetch categories: ' + err.message
                console.error('[FeedStore] Error fetching categories:', err)
            } finally {
                this.loading = false
            }
        },

        // ========== Tenant Admin - Incoming ==========
        async fetchIncomingPosts(params: FeedListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getIncomingPosts } = useFeedService()
                const result = await getIncomingPosts(params)
                this.incomingPosts = result.posts
                this.incomingCount = result.count
                this.incomingNext = result.next
                this.incomingPrevious = result.previous
            } catch (err: any) {
                this.error = 'Failed to fetch incoming posts: ' + err.message
                console.error('[FeedStore] Error fetching incoming posts:', err)
            } finally {
                this.loading = false
            }
        },

        async transferPost(postId: string, facilityIds: string[]) {
            this.loading = true
            this.error = null
            try {
                const { transferPost } = useFeedService()
                const success = await transferPost(postId, facilityIds)
                if (success) {
                    // Mark as transferred locally by updating facility_ids
                    const post = this.incomingPosts.find((p) => p.id === postId)
                    if (post) {
                        post.facility_ids = facilityIds
                    }
                }
                return success
            } catch (err: any) {
                this.error = 'Failed to transfer post: ' + err.message
                console.error('[FeedStore] Error transferring post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ========== Tenant Admin - My Posts ==========
        async fetchMyPosts(params: FeedListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getMyPosts } = useFeedService()
                const result = await getMyPosts(params)
                this.myPosts = result.posts
                this.myPostsCount = result.count
                this.myPostsNext = result.next
                this.myPostsPrevious = result.previous
            } catch (err: any) {
                this.error = 'Failed to fetch my posts: ' + err.message
                console.error('[FeedStore] Error fetching my posts:', err)
            } finally {
                this.loading = false
            }
        },

        async createAdminPost(data: CreateAdminPostPayload) {
            this.loading = true
            this.error = null
            try {
                const { createAdminPost } = useFeedService()
                const newPost = await createAdminPost(data)
                this.myPosts.unshift(newPost)
                this.myPostsCount += 1
                return newPost
            } catch (err: any) {
                this.error = 'Failed to create post: ' + err.message
                console.error('[FeedStore] Error creating admin post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteAdminPost(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deleteAdminPost } = useFeedService()
                const success = await deleteAdminPost(id)
                if (success) {
                    this.myPosts = this.myPosts.filter((p) => p.id !== id)
                    this.myPostsCount = Math.max(0, this.myPostsCount - 1)
                    if (this.currentPost?.id === id) {
                        this.currentPost = null
                    }
                    return true
                }
                throw new Error('Failed to delete post')
            } catch (err: any) {
                this.error = 'Failed to delete post: ' + err.message
                console.error('[FeedStore] Error deleting admin post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ========== Client Hub ==========
        async fetchHubPosts(params: FeedListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getClientPosts } = useFeedService()
                const result = await getClientPosts(params)
                this.hubPosts = result.posts
                this.hubCount = result.count
                this.hubNext = result.next
                this.hubPrevious = result.previous
            } catch (err: any) {
                this.error = 'Failed to fetch hub posts: ' + err.message
                console.error('[FeedStore] Error fetching hub posts:', err)
            } finally {
                this.loading = false
            }
        },

        async createClientPost(data: CreateClientPostPayload) {
            this.loading = true
            this.error = null
            try {
                const { createClientPost } = useFeedService()
                const newPost = await createClientPost(data)
                this.hubPosts.unshift(newPost)
                this.hubCount += 1
                return newPost
            } catch (err: any) {
                this.error = 'Failed to create post: ' + err.message
                console.error('[FeedStore] Error creating client post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteClientPost(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deleteClientPost } = useFeedService()
                const success = await deleteClientPost(id)
                if (success) {
                    this.hubPosts = this.hubPosts.filter((p) => p.id !== id)
                    this.hubCount = Math.max(0, this.hubCount - 1)
                    if (this.currentPost?.id === id) {
                        this.currentPost = null
                    }
                    return true
                }
                throw new Error('Failed to delete post')
            } catch (err: any) {
                this.error = 'Failed to delete post: ' + err.message
                console.error('[FeedStore] Error deleting client post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ========== Likes & Comments ==========
        async toggleLike(postId: string) {
            const post =
                this.hubPosts.find((p) => p.id === postId) ||
                this.currentPost
            if (!post) return

            const isLiked = post.user_has_liked
            try {
                const { likePost, unlikePost } = useFeedService()
                if (isLiked) {
                    const success = await unlikePost(postId)
                    if (success) {
                        post.user_has_liked = false
                        post.likes_count = Math.max(0, post.likes_count - 1)
                    }
                } else {
                    const success = await likePost(postId)
                    if (success) {
                        post.user_has_liked = true
                        post.likes_count += 1
                    }
                }
            } catch (err: any) {
                console.error('[FeedStore] Error toggling like:', err)
                throw err
            }
        },

        async fetchComments(postId: string, params: { page?: number; page_size?: number } = {}) {
            this.loading = true
            this.error = null
            try {
                const { getComments } = useFeedService()
                const result = await getComments(postId, params)
                this.comments = result.comments
                this.commentsCount = result.count
                this.commentsNext = result.next
                this.commentsPrevious = result.previous
            } catch (err: any) {
                this.error = 'Failed to fetch comments: ' + err.message
                console.error('[FeedStore] Error fetching comments:', err)
            } finally {
                this.loading = false
            }
        },

        async addComment(postId: string, text: string) {
            this.loading = true
            this.error = null
            try {
                const { addComment } = useFeedService()
                const newComment = await addComment(postId, text)
                this.comments.unshift(newComment)
                this.commentsCount += 1
                // Update post comment count
                const post = this.hubPosts.find((p) => p.id === postId) || this.currentPost
                if (post) {
                    post.comments_count += 1
                }
                return newComment
            } catch (err: any) {
                this.error = 'Failed to add comment: ' + err.message
                console.error('[FeedStore] Error adding comment:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async addReply(commentId: string, text: string) {
            this.loading = true
            this.error = null
            try {
                const { addReply } = useFeedService()
                const newReply = await addReply(commentId, text)
                // Find parent comment and add reply
                const parentComment = this.comments.find((c) => c.id === commentId)
                if (parentComment) {
                    parentComment.replies.push(newReply)
                }
                return newReply
            } catch (err: any) {
                this.error = 'Failed to add reply: ' + err.message
                console.error('[FeedStore] Error adding reply:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        // ========== Shared ==========
        async fetchPost(id: string, type: 'admin' | 'client' = 'client') {
            this.loading = true
            this.error = null
            try {
                const { getAdminPostById, getClientPostById } = useFeedService()
                this.currentPost =
                    type === 'admin'
                        ? await getAdminPostById(id)
                        : await getClientPostById(id)
            } catch (err: any) {
                this.error = 'Failed to fetch post: ' + err.message
                console.error('[FeedStore] Error fetching post:', err)
            } finally {
                this.loading = false
            }
        },

        clearCurrentPost() {
            this.currentPost = null
            this.comments = []
            this.commentsCount = 0
            this.commentsNext = null
            this.commentsPrevious = null
        },
    },
})
