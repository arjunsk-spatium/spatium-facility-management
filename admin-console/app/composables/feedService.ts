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
    category: FeedCategory
    created_by_profile: CreatorProfile
    creator_type: 'superadmin' | 'tenant_admin' | 'client'
    scope_type: string
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

export interface FeedListParams {
    page?: number
    page_size?: number
    search?: string
    category?: string
}

export interface CreateSuperadminPostPayload {
    category_id: string
    title: string
    description: string
    scope_type: 'all_tenants' | 'selected_tenants'
    tenant_ids?: string[]
    published_at?: string
    allow_likes?: boolean
    event?: {
        event_date: string
        start_time: string
        end_time: string
        venue: string
    }
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

export const useFeedService = () => {
    const { request } = useApi()

    const getCategories = async (): Promise<FeedCategory[]> => {
        const response = await request<ApiResponse<FeedCategory[]>>('/api/portal/feed/categories/')
        if (response && response.success && response.data) {
            return response.data
        }
        return []
    }

    const getPosts = async (params: FeedListParams = {}): Promise<{
        posts: FeedPost[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size
        if (params.search) query.search = params.search
        if (params.category) query.category = params.category

        const response = await request<ApiResponse<PaginatedResponse<FeedPost>>>(
            '/api/portal/feed/superadmin/posts/',
            { method: 'GET', params: query }
        )

        if (response && response.success && response.data) {
            return {
                posts: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { posts: [], count: 0, next: null, previous: null }
    }

    const getPostById = async (id: string): Promise<FeedPost | null> => {
        try {
            const response = await request<ApiResponse<FeedPost>>(
                `/api/portal/feed/superadmin/posts/${id}/`,
                { method: 'GET' }
            )
            if (response && response.success && response.data) {
                return response.data
            }
            return null
        } catch (error: any) {
            if (error.statusCode === 404) return null
            throw error
        }
    }

    const createPost = async (payload: CreateSuperadminPostPayload): Promise<FeedPost> => {
        const hasImage = payload.image instanceof File

        if (hasImage) {
            const formData = new FormData()
            formData.append('category_id', payload.category_id)
            formData.append('title', payload.title)
            formData.append('description', payload.description)
            formData.append('scope_type', payload.scope_type)
            if (payload.tenant_ids) {
                payload.tenant_ids.forEach(id => formData.append('tenant_ids', id))
            }
            if (payload.published_at) formData.append('published_at', payload.published_at)
            if (payload.allow_likes !== undefined) formData.append('allow_likes', String(payload.allow_likes))
            if (payload.event) {
                formData.append('event', JSON.stringify(payload.event))
            }
            formData.append('image', payload.image)

            const response = await request<ApiResponse<FeedPost>>(
                '/api/portal/feed/superadmin/posts/',
                { method: 'POST', body: formData }
            )
            if (response && response.success && response.data) {
                return response.data
            }
            throw new Error(response?.message || 'Failed to create post')
        } else {
            const body: any = {
                category_id: payload.category_id,
                title: payload.title,
                description: payload.description,
                scope_type: payload.scope_type,
            }
            if (payload.tenant_ids) body.tenant_ids = payload.tenant_ids
            if (payload.published_at) body.published_at = payload.published_at
            if (payload.allow_likes !== undefined) body.allow_likes = payload.allow_likes
            if (payload.event) body.event = payload.event

            const response = await request<ApiResponse<FeedPost>>(
                '/api/portal/feed/superadmin/posts/',
                { method: 'POST', body }
            )
            if (response && response.success && response.data) {
                return response.data
            }
            throw new Error(response?.message || 'Failed to create post')
        }
    }

    const deletePost = async (id: string): Promise<boolean> => {
        try {
            await request(`/api/portal/feed/superadmin/posts/${id}/`, { method: 'DELETE' })
            return true
        } catch (error) {
            return false
        }
    }

    return {
        getCategories,
        getPosts,
        getPostById,
        createPost,
        deletePost,
    }
}
