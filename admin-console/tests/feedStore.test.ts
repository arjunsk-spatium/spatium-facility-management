import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFeedStore } from '../stores/feed'

const mockCategory = { id: 'cat-1', name: 'Announcement', slug: 'announcement', description: '', is_active: true }

const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    description: 'Description',
    image: null,
    category: mockCategory,
    created_by_profile: { user_id: 'user-1', employee_name: 'Test', designation: '', profile_photo: null },
    creator_type: 'superadmin' as const,
    scope_type: 'all_tenants',
    allow_likes: true,
    is_system_generated: false,
    is_active: true,
    likes_count: 5,
    comments_count: 2,
    user_has_liked: false,
    employees: [],
    event: null,
    tenant_ids: [],
    published_at: '2026-06-01T10:00:00Z',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
}

const mockGetCategories = vi.fn()
const mockGetPosts = vi.fn()
const mockGetPostById = vi.fn()
const mockCreatePost = vi.fn()
const mockDeletePost = vi.fn()

vi.mock('../app/composables/feedService', () => ({
    useFeedService: () => ({
        getCategories: mockGetCategories,
        getPosts: mockGetPosts,
        getPostById: mockGetPostById,
        createPost: mockCreatePost,
        deletePost: mockDeletePost,
    })
}))

describe('Admin Feed Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('fetches categories', async () => {
        const store = useFeedStore()
        mockGetCategories.mockResolvedValue([mockCategory])

        await store.fetchCategories()

        expect(store.categories).toHaveLength(1)
        expect(store.categories[0].name).toBe('Announcement')
    })

    it('fetches posts with pagination', async () => {
        const store = useFeedStore()
        mockGetPosts.mockResolvedValue({ posts: [mockPost], count: 1, next: null, previous: null })

        await store.fetchPosts({ page: 1, page_size: 10 })

        expect(store.posts).toHaveLength(1)
        expect(store.count).toBe(1)
        expect(store.page).toBe(1)
        expect(store.pageSize).toBe(10)
    })

    it('fetches single post', async () => {
        const store = useFeedStore()
        mockGetPostById.mockResolvedValue(mockPost)

        await store.fetchPost('post-1')

        expect(store.currentPost).not.toBeNull()
        expect(store.currentPost?.id).toBe('post-1')
    })

    it('creates post and adds to list', async () => {
        const store = useFeedStore()
        mockCreatePost.mockResolvedValue(mockPost)

        await store.createPost({
            category_id: 'cat-1',
            title: 'New',
            description: 'Desc',
            scope_type: 'all_tenants',
        })

        expect(store.posts).toHaveLength(1)
        expect(store.count).toBe(1)
    })

    it('deletes post and removes from list', async () => {
        const store = useFeedStore()
        store.posts = [{ ...mockPost }]
        store.count = 1
        mockDeletePost.mockResolvedValue(true)

        await store.deletePost('post-1')

        expect(store.posts).toHaveLength(0)
        expect(store.count).toBe(0)
    })

    it('calculates active posts getter', () => {
        const store = useFeedStore()
        store.posts = [
            { ...mockPost, is_active: true },
            { ...mockPost, id: 'post-2', is_active: false },
        ]

        expect(store.activePosts).toBe(1)
    })

    it('calculates event posts getter', () => {
        const store = useFeedStore()
        store.posts = [
            { ...mockPost, event: null },
            { ...mockPost, id: 'post-2', event: { event_date: '2026-06-01', start_time: '10:00', end_time: '12:00', venue: 'Hall' } },
        ]

        expect(store.eventPosts).toBe(1)
    })
})
