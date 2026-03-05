// Global API plugin with automatic token refresh
// All API calls should use this $api instead of $fetch

import { useAuthStore } from "../../stores/auth";

interface ApiOptions {
    method?: string;
    query?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
}

// Type augmentation for Nuxt
declare module "#app" {
    interface NuxtApp {
        $api: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
    }
}

declare module "vue" {
    interface ComponentCustomProperties {
        $api: <T>(endpoint: string, options?: ApiOptions) => Promise<T>;
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    // Get auth headers from localStorage
    const getAuthHeaders = (): Record<string, string> => {
        if (typeof window === "undefined") return {};
        const token = localStorage.getItem("access_token");
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    // Build full URL with query params
    const buildUrl = (
        endpoint: string,
        query?: Record<string, any>,
    ): string => {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${baseUrl}${endpoint}`;
        if (!query) return url;

        const params = new URLSearchParams();
        Object.entries(query).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                params.append(key, String(value));
            }
        });
        const queryString = params.toString();
        return queryString ? `${url}?${queryString}` : url;
    };

    // Main API function with refresh token handling
    const api = async <T>(
        endpoint: string,
        options: ApiOptions = {},
    ): Promise<T> => {
        const { query, body, method = "GET", headers = {} } = options;
        const url = buildUrl(endpoint, query);

        // Initial request
        const makeRequest = async (
            authHeaders: Record<string, string>,
        ): Promise<Response> => {
            const isFormData =
                typeof FormData !== "undefined" && body instanceof FormData;
            const requestHeaders: Record<string, string> = {
                ...authHeaders,
                ...headers,
            };

            // Only set JSON content type if not FormData
            if (!isFormData) {
                requestHeaders["Content-Type"] = "application/json";
            }

            const fetchOptions: RequestInit = {
                method,
                headers: requestHeaders,
            };

            if (body && method !== "GET") {
                fetchOptions.body = isFormData ? body : JSON.stringify(body);
            }

            return fetch(url, fetchOptions);
        };

        try {
            let response = await makeRequest(getAuthHeaders());
            console.log("[API] Initial response status:", response.status);

            // Handle 401 - attempt token refresh
            if (response.status === 401) {
                console.log("[API] Received 401, attempting token refresh...");

                const authStore = useAuthStore();
                const refreshSuccess = await authStore.refreshAccessToken();
                console.log("[API] Refresh success:", refreshSuccess);

                if (refreshSuccess) {
                    console.log("[API] Token refreshed, retrying request...");
                    const newToken = localStorage.getItem("access_token");
                    console.log("[API] New token:", newToken ? "present" : "missing");
                    // Retry with new token
                    response = await makeRequest(getAuthHeaders());
                    console.log("[API] Retry response status:", response.status);
                } else {
                    console.log(
                        "[API] Token refresh failed, redirecting to login...",
                    );
                    // Auth store handles logout
                    throw new Error("Authentication failed");
                }
            }

            // Parse response
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const error: any = new Error(
                    errorData.message || `HTTP ${response.status}`,
                );
                error.statusCode = response.status;
                error.data = errorData;
                throw error;
            }

            return response.json();
        } catch (error: any) {
            console.error("[API] Request failed:", error);
            throw error;
        }
    };

    // Provide $api globally
    return {
        provide: {
            api,
        },
    };
});
