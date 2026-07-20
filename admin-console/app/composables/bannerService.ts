export interface Banner {
    id: string
    title: string
    description: string
    image: string | null
    image_url: string | null
    category: string
    is_active: boolean
    link: string | null
    is_global: boolean
    tenant: string | string[] | null
    is_archive: boolean
    created_at: string
    updated_at: string
}

export interface BannerListParams {
    page?: number
    page_size?: number
    search?: string
    category?: string
    is_active?: boolean
    is_global?: boolean
}

export interface CreateBannerPayload {
    title: string
    description: string
    category: string
    is_active: boolean
    is_global: boolean
    link?: string
    image?: File | null
    tenant?: string[]
}

export interface UpdateBannerPayload {
    title?: string
    description?: string
    category?: string
    is_active?: boolean
    is_global?: boolean
    link?: string
    image?: File | null
    tenant?: string[]
}

export interface BannerApiResponse<T> {
    success: boolean
    code: string
    message: string
    data: T
    error: any | null
    meta: { request_id: string; timestamp: string }
}

export interface BannerPaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

const BASE_PATH = '/api/platform/banners/'

const buildBannerFormData = (payload: CreateBannerPayload | UpdateBannerPayload): FormData => {
    const formData = new FormData()

    if (payload.title !== undefined) formData.append('title', payload.title)
    if (payload.description !== undefined) formData.append('description', payload.description)
    if (payload.category !== undefined) formData.append('category', payload.category)
    if (payload.is_active !== undefined) formData.append('is_active', String(payload.is_active))
    if (payload.is_global !== undefined) formData.append('is_global', String(payload.is_global))
    if (payload.link !== undefined) formData.append('link', payload.link)
    if (payload.image instanceof File) formData.append('image', payload.image)
    if (payload.tenant && payload.tenant.length > 0) {
        payload.tenant.forEach(id => formData.append('tenant', id))
    }

    return formData
}

export const useBannerService = () => {
    const { request } = useApi()

    const getBanners = async (params: BannerListParams = {}): Promise<{
        banners: Banner[]
        count: number
        next: string | null
        previous: string | null
    }> => {
        const query: any = {}
        if (params.page) query.page = params.page
        if (params.page_size) query.page_size = params.page_size
        if (params.search) query.search = params.search
        if (params.category) query.category = params.category
        if (params.is_active !== undefined) query.is_active = params.is_active
        if (params.is_global !== undefined) query.is_global = params.is_global

        const response = await request<BannerApiResponse<BannerPaginatedResponse<Banner>>>(BASE_PATH, {
            method: 'GET',
            params: query,
        })

        if (response && response.success && response.data) {
            return {
                banners: response.data.results || [],
                count: response.data.count || 0,
                next: response.data.next || null,
                previous: response.data.previous || null,
            }
        }
        return { banners: [], count: 0, next: null, previous: null }
    }

    const getBanner = async (id: string): Promise<Banner | null> => {
        try {
            const response = await request<BannerApiResponse<Banner>>(`${BASE_PATH}${id}/`, {
                method: 'GET',
            })
            if (response && response.success && response.data) {
                return response.data
            }
            return null
        } catch (error: any) {
            if (error.statusCode === 404) return null
            throw error
        }
    }

    const createBanner = async (payload: CreateBannerPayload): Promise<Banner> => {
        const hasImage = payload.image instanceof File
        const options: any = { method: 'POST' }

        if (hasImage) {
            options.body = buildBannerFormData(payload)
        } else {
            const body: any = {
                title: payload.title,
                description: payload.description,
                category: payload.category,
                is_active: payload.is_active,
                is_global: payload.is_global,
            }
            if (payload.link) body.link = payload.link
            if (payload.tenant && payload.tenant.length > 0) body.tenant = payload.tenant
            options.body = body
        }

        const response = await request<BannerApiResponse<Banner>>(BASE_PATH, options)
        if (response && response.success && response.data) {
            return response.data
        }
        throw new Error(response?.message || 'Failed to create banner')
    }

    const updateBanner = async (id: string, payload: UpdateBannerPayload): Promise<Banner> => {
        const hasImage = payload.image instanceof File
        const options: any = { method: 'PATCH' }

        if (hasImage) {
            options.body = buildBannerFormData(payload)
        } else {
            const body: any = {}
            if (payload.title !== undefined) body.title = payload.title
            if (payload.description !== undefined) body.description = payload.description
            if (payload.category !== undefined) body.category = payload.category
            if (payload.is_active !== undefined) body.is_active = payload.is_active
            if (payload.is_global !== undefined) body.is_global = payload.is_global
            if (payload.link !== undefined) body.link = payload.link
            if (payload.tenant !== undefined) body.tenant = payload.tenant
            options.body = body
        }

        const response = await request<BannerApiResponse<Banner>>(`${BASE_PATH}${id}/`, options)
        if (response && response.success && response.data) {
            return response.data
        }
        throw new Error(response?.message || 'Failed to update banner')
    }

    const deleteBanner = async (id: string): Promise<boolean> => {
        try {
            await request(`${BASE_PATH}${id}/`, { method: 'DELETE' })
            return true
        } catch (error) {
            return false
        }
    }

    return {
        getBanners,
        getBanner,
        createBanner,
        updateBanner,
        deleteBanner,
    }
}
