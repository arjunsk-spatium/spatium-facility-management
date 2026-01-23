
import { useAuthStore } from '../../stores/auth';

export const useApi = () => {
    const config = useRuntimeConfig();
    const authStore = useAuthStore();
    const apiBaseUrl = config.public.apiBaseUrl;

    const fetchWithAuth = async <T>(url: string, options: any = {}) => {
        const defaults = {
            baseURL: apiBaseUrl,
            headers: {},
            onResponseError: async ({ request, response, options }: any) => {
                if (response.status === 401) {
                    // Try to refresh token
                    try {
                        const refreshed = await authStore.refreshTokenAction();
                        if (refreshed) {
                            // Retry the original request
                            // We need to update the header with the new token
                            console.log('Retrying request with new token:', authStore.token);
                            options.headers = {
                                ...options.headers,
                                Authorization: `Bearer ${authStore.token}`
                            };
                            return $fetch(request, options);
                        }
                    } catch (e) {
                        // Refresh failed, logout
                        authStore.logout();
                    }
                }
            }
        };

        // Add Authorization header if token exists
        if (authStore.token) {
            defaults.headers = {
                ...defaults.headers,
                'Authorization': `Bearer ${authStore.token}`
            };
        }

        const mergedOptions = { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } };

        // $fetch returns the data directly (Promise<T>)
        // We catch errors here to mimic the structure if needed, or better yet, let the caller handle try/catch
        return $fetch<T>(url, mergedOptions);
    };

    return {
        request: fetchWithAuth
    };
};
