export interface Banner {
    id: string;
    title: string;
    description?: string;
    category: string;
    image?: string;
    image_url?: string;
    is_active: boolean;
    is_global: boolean;
    link?: string | null;
    link_title?: string | null;
    tenant?: string;
    tenant_name?: string;
    is_archive?: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface BannerListParams {
    page?: number;
    page_size?: number;
    search?: string;
    category?: string;
    is_active?: boolean;
}

export interface CreateBannerPayload {
    title: string;
    description?: string;
    category: string;
    is_active: boolean;
    is_global?: boolean;
    image?: File;
    link?: string;
    link_title?: string;
}

export interface UpdateBannerPayload {
    title?: string;
    description?: string;
    category?: string;
    is_active?: boolean;
    is_global?: boolean;
    image?: File;
    link?: string;
    link_title?: string;
}

export interface BannerListResponse {
    banners: Banner[];
    count: number;
    next: string | null;
    previous: string | null;
}

export const useBannerService = () => {
    const { $api } = useNuxtApp();
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    const buildUrl = (endpoint: string): string => {
        return endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;
    };

    const getBanners = async (params: BannerListParams = {}): Promise<BannerListResponse> => {
        const url = buildUrl('/api/portal/banners/');
        const query: any = {};
        if (params.page) query.page = params.page;
        if (params.page_size) query.page_size = params.page_size;
        if (params.search) query.search = params.search;
        if (params.category) query.category = params.category;
        if (params.is_active !== undefined) query.is_active = params.is_active;

        const response = await $api<{
            success: boolean;
            data: {
                count: number;
                next: string | null;
                previous: string | null;
                results: Banner[];
            };
        }>(url, { method: 'GET', query });

        return {
            banners: response.data?.results || [],
            count: response.data?.count || 0,
            next: response.data?.next || null,
            previous: response.data?.previous || null,
        };
    };

    const getBannerById = async (id: string): Promise<Banner | null> => {
        const url = buildUrl(`/api/portal/banners/${id}/`);
        try {
            const response = await $api<{
                success: boolean;
                data: Banner;
            }>(url, { method: 'GET' });
            return response.data;
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    };

    const createBanner = async (data: CreateBannerPayload): Promise<Banner> => {
        const url = buildUrl('/api/portal/banners/');
        const formData = new FormData();
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('category', data.category);
        formData.append('is_active', String(data.is_active));
        formData.append('is_global', String(data.is_global ?? false));
        if (data.image) {
            formData.append('image', data.image);
        }
        if (data.link) {
            formData.append('link', data.link);
        }
        if (data.link_title) {
            formData.append('link_title', data.link_title);
        }

        const response = await $api<{
            success: boolean;
            data: Banner;
        }>(url, {
            method: 'POST',
            body: formData,
        });
        return response.data;
    };

    const updateBanner = async (id: string, data: UpdateBannerPayload): Promise<Banner | null> => {
        const url = buildUrl(`/api/portal/banners/${id}/`);
        const formData = new FormData();
        if (data.title !== undefined) formData.append('title', data.title);
        if (data.description !== undefined) formData.append('description', data.description);
        if (data.category !== undefined) formData.append('category', data.category);
        if (data.is_active !== undefined) formData.append('is_active', String(data.is_active));
        if (data.is_global !== undefined) formData.append('is_global', String(data.is_global));
        if (data.image instanceof File) {
            formData.append('image', data.image);
        }
        if (data.link !== undefined) {
            formData.append('link', data.link);
        }
        if (data.link_title !== undefined) {
            formData.append('link_title', data.link_title);
        }

        const response = await $api<{
            success: boolean;
            data: Banner;
        }>(url, {
            method: 'PATCH',
            body: formData,
        });
        return response.data;
    };

    const deleteBanner = async (id: string): Promise<void> => {
        const url = buildUrl(`/api/portal/banners/${id}/`);
        await $api(url, { method: 'DELETE' });
    };

    return {
        getBanners,
        getBannerById,
        createBanner,
        updateBanner,
        deleteBanner,
    };
};
