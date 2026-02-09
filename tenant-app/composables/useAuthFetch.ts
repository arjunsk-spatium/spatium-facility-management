// API utility with automatic token refresh on 401 errors
// Use this instead of raw $fetch for authenticated API calls

import { useAuthStore } from "../stores/auth";

interface FetchOptions extends RequestInit {
    query?: Record<string, any>;
}

/**
 * Authenticated fetch wrapper that handles token refresh automatically
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @returns Response data
 */
export const useAuthFetch = () => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    const authFetch = async <T>(
        endpoint: string,
        options: FetchOptions = {},
    ): Promise<T> => {
        const authStore = useAuthStore();

        // Build headers with auth token
        const getHeaders = () => {
            const token =
                typeof window !== "undefined"
                    ? localStorage.getItem("access_token")
                    : null;
            return {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...options.headers,
            };
        };

        try {
            // Make the initial request
            const response = await $fetch<T>(
                endpoint.startsWith("http")
                    ? endpoint
                    : `${baseUrl}${endpoint}`,
                {
                    ...options,
                    headers: getHeaders(),
                },
            );
            return response;
        } catch (error: any) {
            // Check if it's a 401 Unauthorized error
            if (error?.statusCode === 401 || error?.status === 401) {
                console.log("Received 401, attempting token refresh...");

                // Try to refresh the token
                const refreshSuccess = await authStore.refreshAccessToken();

                if (refreshSuccess) {
                    // Retry the original request with new token
                    console.log("Token refreshed, retrying request...");
                    const retryResponse = await $fetch<T>(
                        endpoint.startsWith("http")
                            ? endpoint
                            : `${baseUrl}${endpoint}`,
                        {
                            ...options,
                            headers: getHeaders(),
                        },
                    );
                    return retryResponse;
                }

                // If refresh failed, the store will handle logout
                throw error;
            }

            // For other errors, just throw
            throw error;
        }
    };

    return { authFetch };
};

/**
 * Helper to get auth headers for use with raw $fetch calls
 * Includes the access token from localStorage
 */
export const getAuthHeaders = () => {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;
    return {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
    };
};
