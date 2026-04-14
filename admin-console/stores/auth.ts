import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let savedUser = null;
    let savedToken = null;
    let savedRefreshToken = null;
    
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('admin_auth_user');
        const tokenStr = localStorage.getItem('admin_auth_token');
        const refreshTokenStr = localStorage.getItem('admin_auth_refresh_token');

        if (userStr) savedUser = JSON.parse(userStr);
        if (tokenStr) savedToken = tokenStr;
        if (refreshTokenStr) savedRefreshToken = refreshTokenStr;
      } catch (e) {
        console.error('Error reading from localStorage', e);
      }
    }

    return {
      user: savedUser as any | null,
      token: savedToken as string | null,
      refreshToken: savedRefreshToken as string | null,
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    userFullName: (state) => {
      if (!state.user) return "";
      if (state.user.full_name) return state.user.full_name;
      if (state.user.name) return state.user.name;
      if (state.user.first_name || state.user.last_name) {
        return `${state.user.first_name || ""} ${state.user.last_name || ""}`.trim();
      }
      if (state.user.username) return state.user.username;
      return state.user.email?.split("@")[0] || "Admin";
    },
  },
  actions: {
    async requestOtp(email: string) {
        const config = useRuntimeConfig();
        const form = new FormData();
        form.append('email', email);

        try {
            await $fetch(`${config.public.apiBaseUrl}/api/auth/otp/request/`, {
                method: 'POST',
                body: form
            });
            return true;
        } catch (error) {
            console.error('OTP Request failed', error);
            throw error;
        }
    },

    async login(email: string, otp: string) {
        const config = useRuntimeConfig();
        const appId = config.public.adminConsoleAppId;
        const form = new FormData();
        form.append('email', email);
        form.append('otp', otp);
        form.append('app_id', appId);

        try {
            const response: any = await $fetch(`${config.public.apiBaseUrl}/api/auth/login/`, {
                method: 'POST',
                body: form
            });

            if (response.success && response.data) {
                this.token = response.data.access;
                this.refreshToken = response.data.refresh; // Store refresh token
                this.user = response.data.user;
                
                if (import.meta.client) {
                    localStorage.setItem('admin_auth_token', this.token || '');
                    localStorage.setItem('admin_auth_refresh_token', this.refreshToken || ''); // Persist refresh token
                    localStorage.setItem('admin_auth_user', JSON.stringify(this.user || {}));
                }
                return true;
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    },

    async refreshTokenAction() {
        const config = useRuntimeConfig();
        if (!this.refreshToken) return false;

        try {
            const response: any = await $fetch(`${config.public.apiBaseUrl}/api/auth/token/refresh/`, {
                method: 'POST',
                body: { refresh: this.refreshToken }
            });

            if (response.success && response.data?.access) {
                this.token = response.data.access;
                // Update refresh token if provided
                if (response.data.refresh) {
                    this.refreshToken = response.data.refresh;
                }
                
                if (import.meta.client) {
                    localStorage.setItem('admin_auth_token', this.token || '');
                    if (this.refreshToken) {
                         localStorage.setItem('admin_auth_refresh_token', this.refreshToken);
                    }
                }
                return true;
            }
            return false;
        } catch (error) {
            console.error('Token refresh failed', error);
            this.logout();
            return false;
        }
    },

    logout() {
      this.user = null;
      this.token = null;
      this.refreshToken = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_auth_user');
        localStorage.removeItem('admin_auth_token');
        localStorage.removeItem('admin_auth_refresh_token');
      }
      
      const router = useRouter();
      router.push('/login');
    }
  }
});
