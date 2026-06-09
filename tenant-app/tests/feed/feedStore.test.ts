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

const mockComment = {
    id: 'comment-1',
    comment: 'Great!',
    user_profile: { user_id: 'user-2', employee_name: 'Commenter', designation: '', profile_photo: null },
    is_edited: false,
    is_deleted: false,
    replies: [],
    created_at: '2026-06-01T11:00:00Z',
    updated_at: '2026-06-01T11:00:00Z',
}

const mockGetCategories = vi.fn()
const mockGetIncomingPosts = vi.fn()
const mockTransferPost = vi.fn()
const mockGetMyPosts = vi.fn()
const mockCreateAdminPost = vi.fn()
const mockDeleteAdminPost = vi.fn()
const mockGetClientPosts = vi.fn()
const mockCreateClientPost = vi.fn()
const mockDeleteClientPost = vi.fn()
const mockLikePost = vi.fn()
const mockUnlikePost = vi.fn()
const mockGetComments = vi.fn()
const mockAddComment = vi.fn()
const mockAddReply = vi.fn()
const mockGetAdminPostById = vi.fn()
const mockGetClientPostById = vi.fn()

vi.mock('../../composables/feedService', () => ({
    useFeedService: () => ({
        getCategories: mockGetCategories,
        getIncomingPosts: mockGetIncomingPosts,
        transferPost: mockTransferPost,
        getMyPosts: mockGetMyPosts,
        createAdminPost: mockCreateAdminPost,
        deleteAdminPost: mockDeleteAdminPost,
        getClientPosts: mockGetClientPosts,
        createClientPost: mockCreateClientPost,
        deleteClientPost: mockDeleteClientPost,
        likePost: mockLikePost,
        unlikePost: mockUnlikePost,
        getComments: mockGetComments,
        addComment: mockAddComment,
        addReply: mockAddReply,
        getAdminPostById: mockGetAdminPostById,
        getClientPostById: mockGetClientPostById,
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
        mockTransferPost.mockResolvedValue(true)

        await store.transferPost('post-1', ['fac-1'])

        expect(store.incomingPosts[0].facility_ids).toContain('fac-1')
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

    it('fetches hub posts', async () => {
        const store = useFeedStore()
        mockGetClientPosts.mockResolvedValue({ posts: [mockPost], count: 1, next: null, previous: null })

        await store.fetchHubPosts()

        expect(store.hubPosts).toHaveLength(1)
        expect(store.hubCount).toBe(1)
    })

    it('toggles like on a post', async () => {
        const store = useFeedStore()
        store.hubPosts = [{ ...mockPost }]
        mockUnlikePost.mockResolvedValue(true)

        await store.toggleLike('post-1')

        expect(store.hubPosts[0].user_has_liked).toBe(false)
    })

    it('fetches comments', async () => {
        const store = useFeedStore()
        mockGetComments.mockResolvedValue({ comments: [mockComment], count: 1, next: null, previous: null })

        await store.fetchComments('post-1')

        expect(store.comments).toHaveLength(1)
        expect(store.commentsCount).toBe(1)
    })

    it('adds a comment', async () => {
        const store = useFeedStore()
        store.hubPosts = [{ ...mockPost }]
        mockAddComment.mockResolvedValue(mockComment)

        await store.addComment('post-1', 'Nice!')

        expect(store.comments).toHaveLength(1)
        expect(store.hubPosts[0].comments_count).toBe(3)
    })

    it('adds a reply', async () => {
        const store = useFeedStore()
        store.comments = [{ ...mockComment, replies: [] }]
        mockAddReply.mockResolvedValue(mockComment)

        await store.addReply('comment-1', 'Thanks!')

        expect(store.comments[0].replies).toHaveLength(1)
    })
})
