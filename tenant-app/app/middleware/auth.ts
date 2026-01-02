export default defineNuxtRouteMiddleware((to, from) => {
  // Auth middleware logic
  const authStore = useAuthStore(); // Assuming store is auto-imported
  if (!authStore.isAuthenticated && to.path !== '/login') {
    return navigateTo('/login');
  }
});
