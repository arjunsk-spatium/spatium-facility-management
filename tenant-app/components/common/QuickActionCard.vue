<template>
    <NuxtLink :to="to" class="block">
        <div
            class="bg-white dark:bg-transparent rounded-xl p-4 border border-gray-100 dark:border-neutral-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700 transition-all cursor-pointer group">
            <div class="flex items-center gap-3">
                <div :class="iconBgClass"
                    class="w-10 h-10 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <component :is="icon" :class="iconClass" class="text-lg" />
                </div>
                <div>
                    <p
                        class="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {{ title }}
                    </p>
                    <p v-if="description" class="text-xs text-gray-500 dark:text-gray-400">{{ description }}</p>
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
