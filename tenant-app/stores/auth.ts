import { defineStore } from 'pinia';
import { useUserService } from '../composables/userService';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as null | Record<string, any>,
    token: null as string | null,
    modules: [] as string[],
  }),
  getters: {
    isAuthenticated: (state) => !!state.token,
    hasModule: (state) => (module: string) => state.modules.includes(module),
  },
  actions: {
    login(user: Record<string, any>, token: string) {
      this.user = user;
      this.token = token;
    },
    logout() {
      this.user = null;
      this.token = null;
      this.modules = [];
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
