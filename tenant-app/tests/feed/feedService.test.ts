import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useFeedService, type FeedPost, type FeedCategory, type FeedComment } from '../../composables/feedService'

const mockCategories: FeedCategory[] = [
    { id: 'cat-1', name: 'Announcement', slug: 'announcement', description: 'Announcement', is_active: true },
    { id: 'cat-2', name: 'Event', slug: 'event', description: 'Event', is_active: true },
]

const mockPost: FeedPost = {
    id: 'post-1',
    title: 'Test Post',
    description: 'Test Description',
    image: null,
    category: mockCategories[0],
    created_by_profile: { user_id: 'user-1', employee_name: 'Test User', designation: 'Manager', profile_photo: null },
    creator_type: 'superadmin',
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

const mockComment: FeedComment = {
    id: 'comment-1',
    comment: 'Great post!',
    user_profile: { user_id: 'user-2', employee_name: 'Commenter', designation: '', profile_photo: null },
    is_edited: false,
    is_deleted: false,
    replies: [],
    created_at: '2026-06-01T11:00:00Z',
    updated_at: '2026-06-01T11:00:00Z',
}

const mockApiResponse = <T>(data: T) => ({
    success: true,
    code: 'OK',
    message: 'Success',
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-06-01T00:00:00Z' },
})

vi.mock('nuxt/app', () => ({
    useNuxtApp: () => ({
        $api: vi.fn()
    }),
    useRuntimeConfig: () => ({
        public: { apiBaseUrl: 'http://localhost:8000' }
    })
}))

describe('Feed Service', () => {
    const service = useFeedService()
    let originalFetch: typeof global.fetch
    const mockFetch = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        originalFetch = global.fetch
        global.fetch = mockFetch
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', 'fake-token')
            localStorage.setItem('tenant_id', 'test-tenant')
        }
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('should fetch categories', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse(mockCategories)
        })

        const result = await service.getCategories()
        expect(result).toHaveLength(2)
        expect(result[0].slug).toBe('announcement')
    })

    it('should fetch incoming posts', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ count: 1, next: null, previous: null, results: [mockPost] })
        })

        const result = await service.getIncomingPosts()
        expect(result.posts).toHaveLength(1)
        expect(result.count).toBe(1)
        expect(result.posts[0].title).toBe('Test Post')
    })

    it('should transfer a post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ success: true })
        })

        const result = await service.transferPost('post-1', ['fac-1', 'fac-2'])
        expect(result).toBe(true)
    })

    it('should fetch my posts', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ count: 1, next: null, previous: null, results: [mockPost] })
        })

        const result = await service.getMyPosts()
        expect(result.posts).toHaveLength(1)
        expect(result.count).toBe(1)
    })

    it('should create admin post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse(mockPost)
        })

        const result = await service.createAdminPost({
            category_id: 'cat-1',
            title: 'New Post',
            description: 'Desc',
            scope_type: 'companies',
            company_ids: ['comp-1'],
        })
        expect(result.id).toBe('post-1')
    })

    it('should delete admin post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 204,
            json: async () => ({})
        })

        const result = await service.deleteAdminPost('post-1')
        expect(result).toBe(true)
    })

    it('should fetch client posts', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ count: 1, next: null, previous: null, results: [mockPost] })
        })

        const result = await service.getClientPosts()
        expect(result.posts).toHaveLength(1)
        expect(result.count).toBe(1)
    })

    it('should create client post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse(mockPost)
        })

        const result = await service.createClientPost({
            category_id: 'cat-1',
            title: 'Client Post',
            description: 'Desc',
        })
        expect(result.id).toBe('post-1')
    })

    it('should delete client post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 204,
            json: async () => ({})
        })

        const result = await service.deleteClientPost('post-1')
        expect(result).toBe(true)
    })

    it('should like a post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ success: true })
        })

        const result = await service.likePost('post-1')
        expect(result).toBe(true)
    })

    it('should unlike a post', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ success: true })
        })

        const result = await service.unlikePost('post-1')
        expect(result).toBe(true)
    })

    it('should fetch comments', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ count: 1, next: null, previous: null, results: [mockComment] })
        })

        const result = await service.getComments('post-1')
        expect(result.comments).toHaveLength(1)
        expect(result.comments[0].comment).toBe('Great post!')
    })

    it('should add a comment', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse(mockComment)
        })

        const result = await service.addComment('post-1', 'Nice!')
        expect(result.comment).toBe('Great post!')
    })

    it('should add a reply', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse(mockComment)
        })

        const result = await service.addReply('comment-1', 'Thanks!')
        expect(result.comment).toBe('Great post!')
    })
})
