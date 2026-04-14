// Global API plugin with automatic token refresh
// All API calls should use this $api instead of $fetch

import { useAuthStore } from "../../stores/auth";
import { useTenantStore } from "../../stores/tenant";

interface ApiOptions {
    method?: string;
    query?: Record<string, any>;
    body?: any;
    headers?: Record<string, string>;
    responseType?: 'json' | 'blob' | 'text';
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
        const headers: Record<string, string> = token
            ? { Authorization: `Bearer ${token}` }
            : {};
        // Inject tenant ID — prefer store, fall back to localStorage
        let tenantId: string | null = null;
        try {
            const tenantStore = useTenantStore();
            tenantId = tenantStore.tenant?.id || null;
        } catch (_) {
            // Store not available yet
        }
        if (!tenantId) {
            tenantId = localStorage.getItem("tenant_id");
        }
        if (tenantId) {
            headers["X-TENANT-ID"] = tenantId;
        }
        return headers;
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

                    // If retry also returns 401, refresh failed - throw error
                    if (response.status === 401) {
                        console.log("[API] Retry also returned 401, logout required");
                        authStore.logout();
                        throw new Error("Authentication failed");
                    }
                } else {
                    console.log(
                        "[API] Token refresh failed, redirecting to login...",
                    );
                    authStore.logout();
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

            if (options.responseType === 'blob') {
                return response.blob() as unknown as T;
            } else if (options.responseType === 'text') {
                return response.text() as unknown as T;
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
