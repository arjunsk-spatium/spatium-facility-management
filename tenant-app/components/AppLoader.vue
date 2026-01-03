<template>
    <div
        class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-neutral-50 dark:bg-neutral-950 transition-colors duration-300">
        <div class="flex flex-col items-center gap-6">
            <div class="relative">
                <div class="absolute inset-0 rounded-full blur-xl bg-primary-500/20 animate-pulse"></div>
                <a-spin size="large">
                    <template #indicator>
                        <LoadingOutlined style="font-size: 48px" spin />
                    </template>
                </a-spin>
            </div>
            <div class="flex flex-col items-center gap-2">
                <h3 class="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    Loading Application
                </h3>
                <p class="text-sm text-neutral-500 dark:text-neutral-400">
                    Please wait while we set things up...
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { LoadingOutlined } from '@ant-design/icons-vue';
</script>
