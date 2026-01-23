import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => {
    let savedUser = null;
    let savedToken = null;
    
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('admin_auth_user');
        const tokenStr = localStorage.getItem('admin_auth_token');
        if (userStr) savedUser = JSON.parse(userStr);
        if (tokenStr) savedToken = tokenStr;
      } catch (e) {
        console.error('Error reading from localStorage', e);
      }
    }

    return {
      user: savedUser as any | null,
      token: savedToken as string | null,
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
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
                this.user = response.data.user;
                
                if (process.client) {
                    localStorage.setItem('admin_auth_token', this.token || '');
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
    logout() {
      this.user = null;
      this.token = null;
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_auth_user');
        localStorage.removeItem('admin_auth_token');
      }
      
      const router = useRouter();
      router.push('/login');
    }
  }
});
