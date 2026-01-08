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
    login(user: Record<string, any>, token: string) {
      this.user = user;
      this.token = token;
      
      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_user', JSON.stringify(user));
        localStorage.setItem('auth_token', token);
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
