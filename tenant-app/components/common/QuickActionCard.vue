<template>
    <NuxtLink :to="to" class="block h-full">
        <div
            class="h-full bg-white dark:bg-transparent rounded-xl p-4 border border-gray-100 dark:border-neutral-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer group flex items-center">
            <div class="flex items-center gap-3 w-full">
                <div :class="iconBgClass"
                    class="w-10 h-10 rounded-lg shrink-0 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <component :is="icon" :class="iconClass" class="text-lg" />
                </div>
                <div class="min-w-0 flex-1">
                    <p
                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors leading-snug">
                        {{ title }}
                    </p>
                    <p v-if="description" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{{ description }}</p>
                </div>
            </div>
        </div>
    </NuxtLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

interface Props {
    title: string
    description?: string
    to: string
    icon: Component
    iconBgClass?: string
    iconClass?: string
}

withDefaults(defineProps<Props>(), {
    iconBgClass: 'bg-primary-50 dark:bg-primary-900/30',
    iconClass: 'text-primary-600 dark:text-primary-400'
})
</script>
