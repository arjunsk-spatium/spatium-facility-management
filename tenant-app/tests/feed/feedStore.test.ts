import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useFeedStore } from '../../stores/feed'

const mockCategory = { id: 'cat-1', name: 'Announcement', slug: 'announcement', description: '', is_active: true }

const mockPost = {
    id: 'post-1',
    title: 'Test Post',
    description: 'Description',
    image: null,
    category: mockCategory,
    created_by_profile: { user_id: 'user-1', employee_name: 'Test', designation: '', profile_photo: null },
    creator_type: 'tenant_admin' as const,
    scope_type: 'companies',
    allow_likes: true,
    is_system_generated: false,
    is_active: true,
    likes_count: 5,
    comments_count: 2,
    user_has_liked: false,
    employees: [],
    event: null,
    company_ids: ['comp-1'],
    facility_ids: [],
    published_at: '2026-06-01T10:00:00Z',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-01T10:00:00Z',
}

const mockGetCategories = vi.fn()
const mockGetIncomingPosts = vi.fn()
const mockTransferPost = vi.fn()
const mockGetMyPosts = vi.fn()
const mockCreateAdminPost = vi.fn()
const mockDeleteAdminPost = vi.fn()
const mockGetAdminPostById = vi.fn()

vi.mock('../../composables/feedService', () => ({
    useFeedService: () => ({
        getCategories: mockGetCategories,
        getIncomingPosts: mockGetIncomingPosts,
        transferPost: mockTransferPost,
        getMyPosts: mockGetMyPosts,
        createAdminPost: mockCreateAdminPost,
        deleteAdminPost: mockDeleteAdminPost,
        getAdminPostById: mockGetAdminPostById,
    })
}))

describe('Feed Store', () => {
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

    it('fetches incoming posts', async () => {
        const store = useFeedStore()
        mockGetIncomingPosts.mockResolvedValue({ posts: [mockPost], count: 1, next: null, previous: null })

        await store.fetchIncomingPosts()

        expect(store.incomingPosts).toHaveLength(1)
        expect(store.incomingCount).toBe(1)
    })

    it('transfers a post', async () => {
        const store = useFeedStore()
        store.incomingPosts = [{ ...mockPost }]
        store.incomingCount = 1
        mockTransferPost.mockResolvedValue(true)

        await store.transferPost('post-1', ['fac-1'])

        expect(store.incomingPosts).toHaveLength(0)
        expect(store.incomingCount).toBe(0)
    })

    it('fetches my posts', async () => {
        const store = useFeedStore()
        mockGetMyPosts.mockResolvedValue({ posts: [mockPost], count: 1, next: null, previous: null })

        await store.fetchMyPosts()

        expect(store.myPosts).toHaveLength(1)
        expect(store.myPostsCount).toBe(1)
    })

    it('creates admin post and adds to list', async () => {
        const store = useFeedStore()
        mockCreateAdminPost.mockResolvedValue(mockPost)

        await store.createAdminPost({
            category_id: 'cat-1',
            title: 'New',
            description: 'Desc',
            scope_type: 'companies',
        })

        expect(store.myPosts).toHaveLength(1)
        expect(store.myPostsCount).toBe(1)
    })

    it('deletes admin post', async () => {
        const store = useFeedStore()
        store.myPosts = [{ ...mockPost }]
        store.myPostsCount = 1
        mockDeleteAdminPost.mockResolvedValue(true)

        await store.deleteAdminPost('post-1')

        expect(store.myPosts).toHaveLength(0)
        expect(store.myPostsCount).toBe(0)
    })

    it('fetches a post by id', async () => {
        const store = useFeedStore()
        mockGetAdminPostById.mockResolvedValue(mockPost)

        await store.fetchPost('post-1')

        expect(store.currentPost).not.toBeNull()
        expect(store.currentPost?.id).toBe('post-1')
    })

    it('clears current post', async () => {
        const store = useFeedStore()
        store.currentPost = { ...mockPost }

        store.clearCurrentPost()

        expect(store.currentPost).toBeNull()
    })
})
