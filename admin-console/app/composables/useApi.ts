import { useNuxtApp, useRuntimeConfig } from 'nuxt/app'

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
            if (error?.response?.status === 401) {
                if (!authStore.refreshToken) {
                    authStore.logout();
                    throw error;
                }

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

                // Refresh failed - logout the user
                authStore.logout();
            }
            throw error;
        }
    };

    return {
        request: fetchWithAuth
    };
};
