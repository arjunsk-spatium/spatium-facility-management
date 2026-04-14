<template>
    <a-dropdown>
        <div
            class="flex items-center gap-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/10 px-2 py-1.5 rounded-lg transition-colors">
            <!-- Avatar -->
            <a-avatar class="bg-primary-600 text-white shadow-sm flex-shrink-0">
                {{ userInitial }}
            </a-avatar>

            <!-- Name/Email info (Hidden on Mobile) -->
            <div class="hidden md:flex flex-col items-start leading-tight">
                <span class="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                    {{ displayUser }}
                </span>
            </div>

            <!-- Caret -->
            <DownOutlined class="text-xs text-neutral-400" />
        </div>

        <!-- Dropdown Menu -->
        <template #overlay>
            <a-menu>
                <div class="px-3 py-2 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                    <span class="text-xs text-neutral-500 block">Signed in as</span>
                    <span class="font-medium text-neutral-900 dark:text-neutral-200 truncate block max-w-[200px]">
                        {{ userEmail }}
                    </span>
                </div>
                <a-menu-item @click="handleLogout" key="logout" class="text-red-500 hover:text-red-600">
                    <template #icon>
                        <LogoutOutlined />
                    </template>
                    Logout
                </a-menu-item>
            </a-menu>
        </template>
    </a-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '../../../stores/auth';
import { DownOutlined, LogoutOutlined } from '@ant-design/icons-vue';
import { navigateTo } from '#app';

const authStore = useAuthStore();

const userEmail = computed(() => authStore.user?.email || 'Admin');
const displayUser = computed(() => {
    const user = authStore.user;
    if (user?.name) return user.name;
    if (user?.full_name) return user.full_name;
    if (user?.first_name || user?.last_name) {
        return `${user.first_name || ''} ${user.last_name || ''}`.trim();
    }
    if (user?.username) return user.username;
    return userEmail.value.split('@')[0];
});

const userInitial = computed(() => {
    const name = displayUser.value;
    return name ? name.charAt(0).toUpperCase() : 'A';
});

const handleLogout = () => {
    authStore.logout();
    return navigateTo('/login');
};
</script>
