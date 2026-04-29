import { defineStore } from "pinia";
import { useUserService } from "../composables/userService";

export const useAuthStore = defineStore("auth", {
    state: () => {
        // Initialize from localStorage if available
        let savedUser = null;
        let savedToken = null;
        let savedRefreshToken = null;

        if (typeof window !== "undefined") {
            try {
                const userStr = localStorage.getItem("auth_user");
                const tokenStr = localStorage.getItem("access_token");
                const refreshStr = localStorage.getItem("refresh_token");
                if (userStr) savedUser = JSON.parse(userStr);
                if (tokenStr) savedToken = tokenStr;
                if (refreshStr) savedRefreshToken = refreshStr;
            } catch (e) {
                console.error("Error reading from localStorage", e);
            }
        }

        return {
            user: savedUser as null | Record<string, any>,
            token: savedToken as string | null,
            refreshToken: savedRefreshToken as string | null,
            modules: [] as string[],
            permissions: [] as string[],
            isRefreshing: false,
        };
    },
    getters: {
        isAuthenticated: (state) => !!state.token,
        hasModule: (state) => (module: string) =>
            state.modules.includes(module),
        hasPermission: (state) => (permission: string) =>
            state.permissions.includes(permission),
        userFullName: (state) => {
            if (!state.user) return "";
            if (state.user.full_name) return state.user.full_name;
            if (state.user.name) return state.user.name;
            if (state.user.first_name || state.user.last_name) {
                return `${state.user.first_name || ""} ${state.user.last_name || ""}`.trim();
            }
            if (state.user.username) return state.user.username;
            return state.user.email?.split("@")[0] || "User";
        },
    },
    actions: {
        async requestOtp(email: string) {
            const config = useRuntimeConfig();
            const form = new FormData();
            form.append("email", email);

            try {
                await $fetch(
                    `${config.public.apiBaseUrl}/api/auth/otp/request/`,
                    {
                        method: "POST",
                        body: form,
                    },
                );
                return true;
            } catch (error) {
                const { sanitizeError } = useValidation();
                console.error("OTP Request failed", sanitizeError(error));
                throw error;
            }
        },

        async login(email: string, otp: string, appId: string) {
            const config = useRuntimeConfig();
            const form = new FormData();
            form.append("email", email);
            form.append("otp", otp);
            form.append("app_id", appId);

            try {
                const response: any = await $fetch(
                    `${config.public.apiBaseUrl}/api/auth/login/`,
                    {
                        method: "POST",
                        body: form,
                    },
                );

                if (response.success && response.data) {
                    this.user = response.data.user;
                    this.token = response.data.access;
                    this.refreshToken = response.data.refresh;

                    // Persist to localStorage
                    if (typeof window !== "undefined") {
                        localStorage.setItem(
                            "auth_user",
                            JSON.stringify(this.user),
                        );
                        localStorage.setItem("access_token", this.token || "");
                        localStorage.setItem(
                            "refresh_token",
                            this.refreshToken || "",
                        );
                        // Keep legacy key for backward compatibility
                        localStorage.setItem("auth_token", this.token || "");
                    }
                } else {
                    throw new Error(response.message || "Login failed");
                }
            } catch (error) {
                const { sanitizeError } = useValidation();
                console.error("Login failed", sanitizeError(error));
                throw error;
            }
        },

        async refreshAccessToken(): Promise<boolean> {
            // Prevent multiple simultaneous refresh attempts
            if (this.isRefreshing) {
                console.log("[Auth] Already refreshing, waiting for existing refresh...");
                // Wait for the existing refresh to complete
                let waited = 0;
                while (this.isRefreshing && waited < 5000) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    waited += 100;
                }
                console.log("[Auth] After waiting, isRefreshing:", this.isRefreshing, "has token:", !!this.token);
                return !!this.token;
            }

            if (!this.refreshToken) {
                console.warn("[Auth] No refresh token available");
                return false;
            }

            this.isRefreshing = true;
            const config = useRuntimeConfig();

            try {
                console.log("[Auth] Refreshing token...");
                const response: any = await $fetch(
                    `${config.public.apiBaseUrl}/api/auth/token/refresh/`,
                    {
                        method: "POST",
                        body: {
                            refresh: this.refreshToken,
                        },
                    },
                );
                console.log("[Auth] Refresh response:", response);

                if (response.success && response.data) {
                    this.token = response.data.access;
                    this.refreshToken = response.data.refresh;

                    // Update localStorage
                    if (typeof window !== "undefined") {
                        localStorage.setItem("access_token", this.token || "");
                        localStorage.setItem(
                            "refresh_token",
                            this.refreshToken || "",
                        );
                        localStorage.setItem("auth_token", this.token || "");
                    }

                    console.log("Token refreshed successfully");
                    return true;
                }

                return false;
            } catch (error) {
                console.error("Token refresh failed", error);
                // If refresh fails, logout the user
                this.logout();
                return false;
            } finally {
                this.isRefreshing = false;
            }
        },

        logout() {
            this.user = null;
            this.token = null;
            this.refreshToken = null;
            this.modules = [];
            this.permissions = [];

            // Clear from localStorage
            if (typeof window !== "undefined") {
                localStorage.removeItem("auth_user");
                localStorage.removeItem("auth_token");
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
            }

            // Redirect to login
            const router = useRouter();
            navigateTo('/login');
        },

        async fetchModules() {
            // If user is SPOC, skip API call and use static SPOC modules
            if (this.user?.is_spoc) {
                this.modules = [
                    'spoc_dashboard',
                    'spoc_visitors',
                    'spoc-visitors-insights',
                    'spoc-visitors-list',
                    'spoc-visitors-invite',
                    'spoc_employees',
                    'spoc_config'
                ];
                this.permissions = [];
                return;
            }

            const { getUserModules, getUserAssignedModules } = useUserService();
            try {
                const { modules, permissions } = await getUserModules();
                this.modules = modules;
                this.permissions = permissions;
                
                // Fetch assigned features using user ID to ensure they are present
                if (this.user?.id) {
                    try {
                        const { $api } = useNuxtApp()
                        // Use $api directly since getUserAssignedModules might not be available or formats differently
                        const response = await $api<any>(`/api/portal/modules/user/?user_id=${this.user.id}`);
                        if (response?.data?.feature_permissions) {
                            response.data.feature_permissions.forEach((fp: any) => {
                                // Add both the ID and the potential string keys to be safe
                                const featureId = fp.feature_permission || fp.feature || fp.id;
                                if (featureId && !this.permissions.includes(featureId)) {
                                    this.permissions.push(featureId);
                                }
                            });
                        }
                    } catch (fErr) {
                        console.error("Failed to fetch feature permissions directly", fErr);
                    }
                }
                
                // Let's also fetch the platform features to map IDs to keys
                try {
                    const { $api } = useNuxtApp()
                    const fRes = await $api<any>('/api/platform/modules/features/');
                    if (fRes?.data) {
                        fRes.data.forEach((f: any) => {
                            if (this.permissions.includes(f.id) && !this.permissions.includes(f.key)) {
                                this.permissions.push(f.key);
                            }
                        });
                    }
                } catch (err) {
                    console.error("Failed to map feature keys", err);
                }
                
                console.log("FINAL AUTH PERMISSIONS:", this.permissions);
            } catch (error) {
                console.error("Failed to fetch modules", error);
                this.modules = [];
                this.permissions = [];
            }
        },
    },
});
