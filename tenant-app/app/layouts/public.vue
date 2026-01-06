<template>
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
        <div class="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <!-- Header -->
            <div class="bg-primary-600 p-6 text-center">
                <h1 class="text-2xl font-bold text-white m-0">FastTrack Visitor</h1>
                <p class="text-primary-100 text-sm mt-1">Spatium Facility Management</p>
            </div>

            <!-- Content -->
            <div class="p-6">
                <slot />
            </div>

            <!-- Footer -->
            <div class="bg-gray-50 dark:bg-gray-900/50 p-4 text-center text-xs text-gray-500">
                Powered by Spatium
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Ensure content is responsive */
</style>
