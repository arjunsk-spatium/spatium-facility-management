export const useApi = () => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const apiBaseUrl = config.public.apiBaseUrl;
    const nuxtApp = useNuxtApp();
    
    const api = nuxtApp.$api || $fetch;

    const fetchWithAuth = async <T>(url: string, options: any = {}) => {
        try {
            return await api<T>(url, {
                baseURL: apiBaseUrl,
                ...options,
            });
        } catch (error: any) {
            if (error?.response?.status === 401 && authStore.refreshToken) {
                const refreshed = await authStore.refreshTokenAction();
                if (refreshed) {
                    return await api<T>(url, {
                        baseURL: apiBaseUrl,
                        ...options,
                        headers: {
                            ...options.headers,
                            'Authorization': `Bearer ${authStore.token}`
                        }
                    });
                }
            }
            throw error;
        }
    };

    return {
        request: fetchWithAuth
    };
};
