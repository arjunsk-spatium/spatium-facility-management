import { defineStore } from 'pinia'
import {
    useFeedService,
    type FeedPost,
    type FeedCategory,
    type FeedListParams,
    type CreateSuperadminPostPayload,
} from '../app/composables/feedService'

export const useFeedStore = defineStore('feed', {
    state: () => ({
        posts: [] as FeedPost[],
        currentPost: null as FeedPost | null,
        categories: [] as FeedCategory[],
        loading: false,
        error: null as string | null,
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),
    getters: {
        totalPosts: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
        activePosts: (state) => state.posts.filter((p) => p.is_active).length,
        eventPosts: (state) => state.posts.filter((p) => p.event !== null).length,
        announcementPosts: (state) =>
            state.posts.filter((p) => p.category.slug === 'announcement').length,
    },
    actions: {
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

        async fetchPosts(params: FeedListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getPosts } = useFeedService()
                const page = params.page ?? this.page
                const page_size = params.page_size ?? this.pageSize
                const result = await getPosts({ ...params, page, page_size })
                this.posts = result.posts
                this.count = result.count
                this.next = result.next
                this.previous = result.previous
                this.page = page
                this.pageSize = page_size
            } catch (err: any) {
                this.error = 'Failed to fetch posts: ' + err.message
                console.error('[FeedStore] Error fetching posts:', err)
            } finally {
                this.loading = false
            }
        },

        async fetchPost(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getPostById } = useFeedService()
                this.currentPost = await getPostById(id)
            } catch (err: any) {
                this.error = 'Failed to fetch post: ' + err.message
                console.error('[FeedStore] Error fetching post:', err)
            } finally {
                this.loading = false
            }
        },

        async createPost(data: CreateSuperadminPostPayload) {
            this.loading = true
            this.error = null
            try {
                const { createPost } = useFeedService()
                const newPost = await createPost(data)
                this.posts.unshift(newPost)
                this.count += 1
                return newPost
            } catch (err: any) {
                this.error = 'Failed to create post: ' + err.message
                console.error('[FeedStore] Error creating post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deletePost(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deletePost } = useFeedService()
                const success = await deletePost(id)
                if (success) {
                    this.posts = this.posts.filter((p) => p.id !== id)
                    this.count = Math.max(0, this.count - 1)
                    if (this.currentPost?.id === id) {
                        this.currentPost = null
                    }
                    return true
                }
                throw new Error('Failed to delete post')
            } catch (err: any) {
                this.error = 'Failed to delete post: ' + err.message
                console.error('[FeedStore] Error deleting post:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async goToPage(page: number) {
            await this.fetchPosts({ page })
        },
    },
})
