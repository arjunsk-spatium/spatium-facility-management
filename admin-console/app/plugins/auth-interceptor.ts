import type { FetchOptions } from 'ofetch';
import { useAuthStore } from '../../stores/auth';

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

const subscribeTokenRefresh = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token: string) => {
    refreshSubscribers.forEach(callback => callback(token));
    refreshSubscribers = [];
};

const publicUrls = [
    '/api/auth/otp/request/',
    '/api/auth/login/',
    '/api/auth/token/refresh/',
];

const isPublicUrl = (url: string) => {
    return publicUrls.some(publicUrl => url.includes(publicUrl));
};

export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore();

    const apiFetch: typeof $fetch = $fetch.create({
        onRequest: ({ request, options }) => {
            const url = typeof request === 'string' ? request : request.url;
            
            if (isPublicUrl(url)) {
                return;
            }

            if (authStore.token) {
                options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${authStore.token}`
                } as any;
            }
        },
        onResponseError: async ({ request, response, options }: { request: string | { url: string }; response: { status: number }; options: FetchOptions }): Promise<any> => {
            const url = typeof request === 'string' ? request : request.url;

            if (isPublicUrl(url)) {
                return;
            }

            if (response.status === 401) {
                if (!authStore.refreshToken) {
                    authStore.logout();
                    return;
                }

                if (isRefreshing) {
                    return new Promise<any>((resolve) => {
                        subscribeTokenRefresh((token: string) => {
                            const retryOptions: any = {
                                ...options,
                                headers: {
                                    ...options.headers,
                                    'Authorization': `Bearer ${token}`
                                }
                            };
                            resolve(apiFetch(url, retryOptions));
                        });
                    });
                }

                isRefreshing = true;

                try {
                    const refreshed = await authStore.refreshTokenAction();
                    
                    if (refreshed) {
                        onTokenRefreshed(authStore.token || '');
                        
                        const retryOptions: any = {
                            ...options,
                            headers: {
                                ...options.headers,
                                'Authorization': `Bearer ${authStore.token}`
                            }
                        };
                        
                        return await apiFetch(url, retryOptions);
                    } else {
                        authStore.logout();
                    }
                } catch (err) {
                    authStore.logout();
                } finally {
                    isRefreshing = false;
                }
            }
        }
    });

    return {
        provide: {
            api: apiFetch
        }
    };
});
