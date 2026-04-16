<template>
    <div
        class="inline-flex items-center p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-600">
        <!-- Light Mode Button (Left) -->
        <button @click="setColorMode('light')"
            class="p-2 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none relative"
            :class="[
                colorMode === 'light'
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white'
            ]" title="Light Mode" aria-label="Light Mode">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        </button>

        <!-- Auto/System Button (Center) -->
        <button @click="setColorMode('system')"
            class="p-2 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none mx-1 relative"
            :class="[
                colorMode === 'system'
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white'
            ]" title="System (Auto)" aria-label="System Mode">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
        </button>

        <!-- Dark Mode Button (Right) -->
        <button @click="setColorMode('dark')"
            class="p-2 rounded-full transition-all duration-300 flex items-center justify-center focus:outline-none relative"
            :class="[
                colorMode === 'dark'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white'
            ]" title="Dark Mode" aria-label="Dark Mode">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round"
                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
        </button>
    </div>
</template>

<script setup lang="ts">
const { colorMode, setColorMode } = useTheme()
</script>
