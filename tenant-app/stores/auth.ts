import { defineStore } from 'pinia';
import { useUserService } from '../composables/userService';

export const useAuthStore = defineStore('auth', {
  state: () => {
    // Initialize from localStorage if available
    let savedUser = null;
    let savedToken = null;
    
    if (typeof window !== 'undefined') {
      try {
        const userStr = localStorage.getItem('auth_user');
        const tokenStr = localStorage.getItem('auth_token');
        if (userStr) savedUser = JSON.parse(userStr);
        if (tokenStr) savedToken = tokenStr;
      } catch (e) {
        console.error('Error reading from localStorage', e);
      }
    }

    return {
      user: savedUser as null | Record<string, any>,
      token: savedToken as string | null,
      modules: [] as string[],
    }
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasModule: (state) => (module: string) => state.modules.includes(module),
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

    async login(email: string, otp: string, appId: string) {
      const config = useRuntimeConfig();
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
           this.user = response.data.user;
           this.token = response.data.access;
           
           // Persist to localStorage
           if (typeof window !== 'undefined') {
             localStorage.setItem('auth_user', JSON.stringify(this.user));
             localStorage.setItem('auth_token', this.token || '');
           }
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
      this.modules = [];
      
      // Clear from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      }
      
      // Redirect to login
      const router = useRouter();
      router.push('/login');
    },
    async fetchModules() {
      const { getUserModules } = useUserService();
      try {
        this.modules = await getUserModules();
      } catch (error) {
        console.error('Failed to fetch modules', error);
        this.modules = [];
      }
    }
  }
});
