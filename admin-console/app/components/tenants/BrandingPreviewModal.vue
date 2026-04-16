<template>
    <a-modal :open="visible" title="Branding Preview" width="1000px" @cancel="handleClose" :footer="null" centered
        class="branding-preview-modal">
        <div class="flex flex-col h-[600px] border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden transition-colors duration-300"
            :class="{ 'dark': isDarkMode }">
            <!-- Mock App Container -->
            <div class="flex flex-1 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors">

                <!-- Mock Sidebar -->
                <!-- Mock Sidebar -->
                <div
                    class="w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 flex flex-col transition-colors">
                    <!-- Logo Area -->
                    <div class="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-700/50">
                        <img v-if="currentLogo" :src="currentLogo" class="h-8 w-auto object-contain"
                            alt="Tenant Logo" />
                        <div v-else class="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>

                    <!-- Mock Menu -->
                    <div class="p-4 space-y-2">
                        <div class="flex items-center gap-3 px-3 py-2.5 rounded-lg !text-white font-medium"
                            :style="{ backgroundColor: primaryColor }">
                            <span class="opacity-90">Dashboard</span>
                        </div>
                        <div v-for="i in 3" :key="i"
                            class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <div class="w-5 h-5 rounded bg-gray-200 dark:bg-gray-700"></div>
                            <span class="w-20 h-4 bg-gray-200 dark:bg-gray-700 rounded"></span>
                        </div>
                    </div>
                </div>

                <!-- Mock Main Content -->
                <div class="flex-1 flex flex-col">
                    <!-- Mock Header -->
                    <div
                        class="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 px-6 flex items-center justify-between transition-colors">
                        <h2 class="font-semibold text-lg">Dashboard Overview</h2>
                        <div class="flex items-center gap-4">
                            <!-- Toggle Mode inside Preview -->
                            <div class="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
                                <button @click="isDarkMode = false" class="p-1.5 rounded-md transition-all"
                                    :class="!isDarkMode ? 'bg-white shadow-sm text-yellow-500' : 'text-gray-400'">
                                    <template v-if="!isDarkMode">☀️</template>
                                    <template v-else>Sun</template>
                                </button>
                                <button @click="isDarkMode = true" class="p-1.5 rounded-md transition-all"
                                    :class="isDarkMode ? 'bg-gray-600 shadow-sm text-white' : 'text-gray-400'">
                                    <template v-if="isDarkMode">🌙</template>
                                    <template v-else>Moon</template>
                                </button>
                            </div>
                            <div class="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                        </div>
                    </div>

                    <!-- Mock Dashboard Content -->
                    <div class="p-8 space-y-6 overflow-y-auto">
                        <!-- Stats Grid -->
                        <div class="grid grid-cols-3 gap-6">
                            <div v-for="i in 3" :key="i"
                                class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                                <div class="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                                <div class="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded"
                                    :style="{ color: primaryColor }"></div>
                            </div>
                        </div>

                        <!-- Chart Area -->
                        <div
                            class="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm h-64 flex items-center justify-center">
                            <div class="text-center">
                                <p class="text-sm text-gray-400 mb-2">Primary Color Application</p>
                                <button
                                    class="px-6 py-2 rounded-lg !text-white font-medium shadow-lg shadow-primary-500/20"
                                    :style="{ backgroundColor: primaryColor }">
                                    Action Button
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="mt-4 text-center text-gray-500 text-sm">
            This is a preview of how the tenant application will look with your branding settings.
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
    visible: boolean;
    primaryColor: string;
    logo: any; // File object or URL string
    darkLogo: any; // File object or URL string
}>();

const emit = defineEmits(['update:visible', 'close']);

const isDarkMode = ref(false);

const handleClose = () => {
    emit('update:visible', false);
    emit('close');
};

// Helper to get image source from File or URL
const getImageSrc = (source: any) => {
    if (!source) return null;
    if (typeof source === 'string') return source;
    if (source instanceof File) {
        return URL.createObjectURL(source);
    }
    // Handle object structure from initial load if any (e.g. { name: ..., url: ... })
    if (typeof source === 'object' && source.url) return source.url;
    return null;
};

const currentLogo = computed(() => {
    const src = isDarkMode.value ? props.darkLogo : props.logo;
    return getImageSrc(src);
});

// Reset mode when opening
watch(() => props.visible, (newVal) => {
    if (newVal) {
        isDarkMode.value = false;
    }
});

</script>

<style scoped>
/* Ensure dark mode styles work within the modal regardless of main app state */
.dark .dark\:bg-gray-900 {
    background-color: #111827;
}

.dark .dark\:bg-gray-800 {
    background-color: #1f2937;
}

.dark .dark\:bg-gray-700 {
    background-color: #374151;
}

.dark .dark\:bg-gray-600 {
    background-color: #4b5563;
}

.dark .dark\:text-gray-100 {
    color: #f3f4f6;
}

.dark .dark\:text-gray-200 {
    color: #e5e7eb;
}

.dark .dark\:text-gray-300 {
    color: #d1d5db;
}

.dark .dark\:text-gray-400 {
    color: #9ca3af;
}

.dark .dark\:border-gray-700 {
    border-color: #374151;
}

.dark .dark\:border-gray-800 {
    border-color: #1f2937;
}
</style>
