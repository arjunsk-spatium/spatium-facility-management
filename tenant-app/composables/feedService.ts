export interface FeedCategory {
    id: string
    name: string
    slug: string
    description: string
    is_active: boolean
}

export interface CreatorProfile {
    user_id: string
    employee_name: string
    designation: string
    profile_photo: string | null
}

export interface FeedEvent {
    id?: string
    event_date: string
    start_time: string
    end_time: string
    venue: string
}

export interface FeedPost {
    id: string
    title: string
    description: string
    image: string | null
    link: string | null
    category: FeedCategory
    created_by_profile: CreatorProfile
    creator_type: 'superadmin' | 'tenant_admin' | 'client'
    scope_type?: string
    allow_likes: boolean
    is_system_generated: boolean
    is_active: boolean
    likes_count: number
    comments_count: number
    user_has_liked: boolean
    employees: any[]
    event: FeedEvent | null
    tenant_ids?: string[]
    company_ids?: string[]
    facility_ids?: string[]
    published_at: string
    created_at: string
    updated_at: string
}

export interface FeedComment {
    id: string
    comment: string
    user_profile: CreatorProfile
    is_edited: boolean
    is_deleted: boolean
    replies: FeedComment[]
    created_at: string
    updated_at: string
}

export interface FeedListParams {
    page?: number
    page_size?: number
    search?: string
    category?: string
}

export interface CreateAdminPostPayload {
    category_id: string
    title: string
    description: string
    scope_type: 'companies' | 'facilities'
    company_ids?: string[]
    facility_ids?: string[]
    allow_likes?: boolean
    link?: string
    published_at?: string
    event?: {
        event_date: string
        start_time: string
        end_time: string
        venue: string
    }
    image?: File | null
}

export interface CreateClientPostPayload {
    category_id: string
    title: string
    description: string
    allow_likes?: boolean
    link?: string
    image?: File | null
}

export interface ApiResponse<T> {
    success: boolean
    code: string
    message: string
    data: T
    error: any | null
    meta: { request_id: string; timestamp: string }
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

// Helper to build URLs
const buildUrl = (endpoint: string): string => {
    const config = useRuntimeConfig()
    const baseUrl = config.public.apiBaseUrl
    return endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`
}

export const useFeedService = () => {
    const { $api } = useNuxtApp()

    // ========== Categories ==========
    const getCategories = async (): Promise<FeedCategory[]> => {
        const response = await $api<ApiResponse<FeedCategory[]>>(
            buildUrl('/api/portal/feed/categories/'),
            { method: 'GET' }
        )
        if (response.success && response.data) {
            return response.data
        }
        return []
    }

    // ========== Tenant Admin APIs ==========
    const getIncomingPosts = async (params: FeedListParams = {}): Promise<{
        posts: FeedPost[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size
        if (params.search) query.search = params.search

        const response = await $api<ApiResponse<PaginatedResponse<FeedPost>>>(
            buildUrl('/api/portal/feed/admin/posts/incoming/'),
            { method: 'GET', query }
        )

        if (response.success && response.data) {
            return {
                posts: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { posts: [], count: 0, next: null, previous: null }
    }

    const transferPost = async (postId: string, facilityIds: string[]): Promise<boolean> => {
        const response = await $api<ApiResponse<any>>(
            buildUrl(`/api/portal/feed/admin/posts/${postId}/transfer/`),
            {
                method: 'POST',
                body: { facility_ids: facilityIds },
            }
        )
        return response.success
    }

    const getMyPosts = async (params: FeedListParams = {}): Promise<{
        posts: FeedPost[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size
        if (params.search) query.search = params.search

        const response = await $api<ApiResponse<PaginatedResponse<FeedPost>>>(
            buildUrl('/api/portal/feed/admin/posts/me/'),
            { method: 'GET', query }
        )

        if (response.success && response.data) {
            return {
                posts: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { posts: [], count: 0, next: null, previous: null }
    }

    const createAdminPost = async (payload: CreateAdminPostPayload): Promise<FeedPost> => {
        const hasImage = payload.image instanceof File

        if (hasImage) {
            const formData = new FormData()
            formData.append('category_id', payload.category_id)
            formData.append('title', payload.title)
            formData.append('description', payload.description)
            formData.append('scope_type', payload.scope_type)
            if (payload.company_ids) {
                payload.company_ids.forEach(id => formData.append('company_ids', id))
            }
            if (payload.facility_ids) {
                payload.facility_ids.forEach(id => formData.append('facility_ids', id))
            }
            if (payload.allow_likes !== undefined) formData.append('allow_likes', String(payload.allow_likes))
            if (payload.link) formData.append('link', payload.link)
            if (payload.published_at) formData.append('published_at', payload.published_at)
            if (payload.event) formData.append('event', JSON.stringify(payload.event))
            formData.append('image', payload.image)

            const response = await $api<ApiResponse<FeedPost>>(
                buildUrl('/api/portal/feed/admin/posts/'),
                { method: 'POST', body: formData }
            )
            if (response.success && response.data) return response.data
            throw new Error(response.message || 'Failed to create post')
        } else {
            const body: any = {
                category_id: payload.category_id,
                title: payload.title,
                description: payload.description,
                scope_type: payload.scope_type,
            }
            if (payload.company_ids) body.company_ids = payload.company_ids
            if (payload.facility_ids) body.facility_ids = payload.facility_ids
            if (payload.allow_likes !== undefined) body.allow_likes = payload.allow_likes
            if (payload.link) body.link = payload.link
            if (payload.published_at) body.published_at = payload.published_at
            if (payload.event) body.event = payload.event

            const response = await $api<ApiResponse<FeedPost>>(
                buildUrl('/api/portal/feed/admin/posts/'),
                { method: 'POST', body }
            )
            if (response.success && response.data) return response.data
            throw new Error(response.message || 'Failed to create post')
        }
    }

    const getAdminPostById = async (id: string): Promise<FeedPost | null> => {
        try {
            const response = await $api<ApiResponse<FeedPost>>(
                buildUrl(`/api/portal/feed/admin/posts/${id}/`),
                { method: 'GET' }
            )
            if (response.success && response.data) return response.data
            return null
        } catch (error: any) {
            if (error.statusCode === 404) return null
            throw error
        }
    }

    const deleteAdminPost = async (id: string): Promise<boolean> => {
        try {
            await $api(buildUrl(`/api/portal/feed/admin/posts/${id}/`), { method: 'DELETE' })
            return true
        } catch (error) {
            return false
        }
    }

    // ========== Client / SPOC APIs ==========
    const getClientPosts = async (params: FeedListParams = {}): Promise<{
        posts: FeedPost[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size
        if (params.search) query.search = params.search

        const response = await $api<ApiResponse<PaginatedResponse<FeedPost>>>(
            buildUrl('/api/portal/feed/client/posts/'),
            { method: 'GET', query }
        )

        if (response.success && response.data) {
            return {
                posts: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { posts: [], count: 0, next: null, previous: null }
    }

    const createClientPost = async (payload: CreateClientPostPayload): Promise<FeedPost> => {
        const formData = new FormData()
        formData.append('category_id', payload.category_id)
        formData.append('title', payload.title)
        formData.append('description', payload.description)
        if (payload.allow_likes !== undefined) formData.append('allow_likes', String(payload.allow_likes))
        if (payload.link) formData.append('link', payload.link)
        if (payload.image instanceof File) formData.append('image', payload.image)

        const response = await $api<ApiResponse<FeedPost>>(
            buildUrl('/api/portal/feed/client/posts/'),
            { method: 'POST', body: formData }
        )
        if (response.success && response.data) return response.data
        throw new Error(response.message || 'Failed to create post')
    }

    const getClientPostById = async (id: string): Promise<FeedPost | null> => {
        try {
            const response = await $api<ApiResponse<FeedPost>>(
                buildUrl(`/api/portal/feed/client/posts/${id}/`),
                { method: 'GET' }
            )
            if (response.success && response.data) return response.data
            return null
        } catch (error: any) {
            if (error.statusCode === 404) return null
            throw error
        }
    }

    const deleteClientPost = async (id: string): Promise<boolean> => {
        try {
            await $api(buildUrl(`/api/portal/feed/client/posts/${id}/`), { method: 'DELETE' })
            return true
        } catch (error) {
            return false
        }
    }

    // ========== Hub APIs (Likes & Comments) ==========
    const likePost = async (postId: string): Promise<boolean> => {
        const response = await $api<ApiResponse<any>>(
            buildUrl(`/api/portal/feed/hub/posts/${postId}/like/`),
            { method: 'POST' }
        )
        return response.success
    }

    const unlikePost = async (postId: string): Promise<boolean> => {
        const response = await $api<ApiResponse<any>>(
            buildUrl(`/api/portal/feed/hub/posts/${postId}/like/`),
            { method: 'DELETE' }
        )
        return response.success
    }

    const getComments = async (postId: string, params: { page?: number; page_size?: number } = {}): Promise<{
        comments: FeedComment[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size

        const response = await $api<ApiResponse<PaginatedResponse<FeedComment>>>(
            buildUrl(`/api/portal/feed/hub/posts/${postId}/comments/`),
            { method: 'GET', query }
        )

        if (response.success && response.data) {
            return {
                comments: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { comments: [], count: 0, next: null, previous: null }
    }

    const addComment = async (postId: string, comment: string): Promise<FeedComment> => {
        const response = await $api<ApiResponse<FeedComment>>(
            buildUrl(`/api/portal/feed/hub/posts/${postId}/comments/`),
            {
                method: 'POST',
                body: { comment },
            }
        )
        if (response.success && response.data) return response.data
        throw new Error(response.message || 'Failed to add comment')
    }

    const addReply = async (commentId: string, comment: string): Promise<FeedComment> => {
        const response = await $api<ApiResponse<FeedComment>>(
            buildUrl(`/api/portal/feed/hub/comments/${commentId}/reply/`),
            {
                method: 'POST',
                body: { comment },
            }
        )
        if (response.success && response.data) return response.data
        throw new Error(response.message || 'Failed to add reply')
    }

    return {
        // Categories
        getCategories,
        // Tenant Admin
        getIncomingPosts,
        transferPost,
        getMyPosts,
        createAdminPost,
        getAdminPostById,
        deleteAdminPost,
        // Client
        getClientPosts,
        createClientPost,
        getClientPostById,
        deleteClientPost,
        // Hub
        likePost,
        unlikePost,
        getComments,
        addComment,
        addReply,
    }
}
