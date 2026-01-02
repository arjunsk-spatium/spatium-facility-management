<template>
    <button @click="toggleTheme" class="theme-toggle" :title="`Current: ${colorMode} mode. Click to switch.`"
        aria-label="Toggle theme">
        <!-- Sun Icon (Light Mode) -->
        <svg v-if="colorMode === 'light'" class="theme-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>

        <!-- Moon Icon (Dark Mode) -->
        <svg v-else-if="colorMode === 'dark'" class="theme-icon" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>

        <!-- System Icon (Auto Mode) -->
        <svg v-else class="theme-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>

        <span class="theme-label">{{ modeLabel }}</span>
    </button>
</template>

<script setup lang="ts">
const { colorMode, toggleTheme } = useTheme()

const modeLabel = computed(() => {
    switch (colorMode.value) {
        case 'light': return 'Light'
        case 'dark': return 'Dark'
        case 'system': return 'Auto'
        default: return 'Auto'
    }
})
</script>

<style scoped>
.theme-toggle {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.875rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--color-neutral-600);
    background-color: var(--color-neutral-100);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-lg);
    cursor: pointer;
    transition: all 150ms ease;
}

.theme-toggle:hover {
    background-color: var(--color-neutral-200);
    color: var(--color-neutral-900);
}

.theme-toggle:focus-visible {
    outline: 2px solid var(--color-primary-500);
    outline-offset: 2px;
}

:global(.dark) .theme-toggle {
    color: var(--color-neutral-300);
    background-color: var(--color-neutral-800);
    border-color: var(--color-neutral-700);
}

:global(.dark) .theme-toggle:hover {
    background-color: var(--color-neutral-700);
    color: var(--color-neutral-100);
}

.theme-icon {
    width: 1.25rem;
    height: 1.25rem;
}

.theme-label {
    min-width: 2.5rem;
}
</style>
