import { defineStore } from 'pinia'
import {
    useFeedService,
    type FeedPost,
    type FeedCategory,
    type FeedListParams,
    type CreateAdminPostPayload,
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

        // Current post (detail view)
        currentPost: null as FeedPost | null,

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
                    // Remove transferred post from incoming list
                    this.incomingPosts = this.incomingPosts.filter((p) => p.id !== postId)
                    this.incomingCount = Math.max(0, this.incomingCount - 1)
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

        // ========== Shared ==========
        async fetchPost(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getAdminPostById } = useFeedService()
                this.currentPost = await getAdminPostById(id)
            } catch (err: any) {
                this.error = 'Failed to fetch post: ' + err.message
                console.error('[FeedStore] Error fetching post:', err)
            } finally {
                this.loading = false
            }
        },

        clearCurrentPost() {
            this.currentPost = null
        },
    },
})
