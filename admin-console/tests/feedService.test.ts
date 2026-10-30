import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useFeedService, type FeedPost, type FeedCategory } from '../app/composables/feedService'

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

const mockApiResponse = <T>(data: T) => ({
    success: true,
    code: 'OK',
    message: 'Success',
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-06-01T00:00:00Z' },
})

const mockRequest = vi.fn()

vi.mock('../app/composables/useApi', () => ({
    useApi: () => ({
        request: mockRequest
    })
}))

describe('Admin Feed Service', () => {
    const service = useFeedService()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch categories', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockCategories))

        const result = await service.getCategories()

        expect(mockRequest).toHaveBeenCalledWith('/api/portal/feed/categories/')
        expect(result).toHaveLength(2)
        expect(result[0].slug).toBe('announcement')
    })

    it('should fetch posts with pagination', async () => {
        mockRequest.mockResolvedValue(mockApiResponse({
            count: 1,
            next: null,
            previous: null,
            results: [mockPost]
        }))

        const result = await service.getPosts({ page: 1, page_size: 10 })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/portal/feed/superadmin/posts/',
            expect.objectContaining({ method: 'GET', params: { page: 1, page_size: 10 } })
        )
        expect(result.posts).toHaveLength(1)
        expect(result.count).toBe(1)
    })

    it('should fetch post by id', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockPost))

        const result = await service.getPostById('post-1')

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/portal/feed/superadmin/posts/post-1/',
            expect.objectContaining({ method: 'GET' })
        )
        expect(result?.id).toBe('post-1')
    })

    it('should create post with JSON payload', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockPost))

        const result = await service.createPost({
            category_id: 'cat-1',
            title: 'New Post',
            description: 'Description',
            scope_type: 'all_tenants',
        })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/portal/feed/superadmin/posts/',
            expect.objectContaining({ method: 'POST', body: expect.any(Object) })
        )
        expect(result.id).toBe('post-1')
    })

    it('should create post with FormData when image is provided', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockPost))
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

        const result = await service.createPost({
            category_id: 'cat-1',
            title: 'New Post',
            description: 'Description',
            scope_type: 'selected_tenants',
            tenant_ids: ['tenant-1'],
            image: file,
        })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/portal/feed/superadmin/posts/',
            expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
        )
        expect(result.id).toBe('post-1')
    })

    it('should delete a post', async () => {
        mockRequest.mockResolvedValue({ success: true })

        const result = await service.deletePost('post-1')

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/portal/feed/superadmin/posts/post-1/',
            expect.objectContaining({ method: 'DELETE' })
        )
        expect(result).toBe(true)
    })
})
