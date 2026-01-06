<template>
    <div class="text-center space-y-6">
        <template v-if="currentVisitor">
            <div class="mb-6">
                <CheckCircleFilled class="text-6xl text-green-500 mb-2" />
                <h2 class="text-2xl font-bold dark:text-white">Access Granted</h2>
                <p class="text-gray-500">Please show this pass at the gate.</p>
            </div>

            <div
                class="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-6 shadow-sm mx-auto max-w-xs relative bg-clip-border">
                <!-- Punch Hole Effect -->
                <div
                    class="absolute -top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-gray-50 dark:bg-gray-900 rounded-full border border-gray-200 dark:border-gray-600 z-10">
                </div>

                <div class="mb-4 mt-2">
                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Visitor"
                        class="w-24 h-24 rounded-full mx-auto border-4 border-gray-100 dark:border-gray-600" />
                </div>

                <h3 class="text-xl font-bold mb-1 dark:text-white">{{ currentVisitor.name }}</h3>
                <p class="text-sm text-gray-500 mb-4">{{ currentVisitor.company }}</p>

                <div
                    class="border-t border-dashed border-gray-300 dark:border-gray-500 py-4 space-y-2 text-sm text-left px-2">
                    <div class="flex justify-between">
                        <span class="text-gray-500">Host</span>
                        <span class="font-medium dark:text-gray-300">{{ currentVisitor.hostName }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Purpose</span>
                        <span class="font-medium dark:text-gray-300">{{ currentVisitor.visitPurpose }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-500">Date</span>
                        <span class="font-medium dark:text-gray-300">{{ new
                            Date(currentVisitor.visitDate).toLocaleDateString() }}</span>
                    </div>
                </div>

                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=VISIT-123"
                        class="mx-auto w-24 h-24 rounded-md" />
                </div>
            </div>

            <NuxtLink to="/public/visitor">
                <a-button type="link" size="large">Done</a-button>
            </NuxtLink>
        </template>

        <template v-else>
            <div class="py-12">
                <a-spin size="large" />
                <p class="mt-4 text-gray-500">Loading pass...</p>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { storeToRefs } from 'pinia'


definePageMeta({
    layout: 'public'
})

const router = useRouter()
const store = useVisitorStore()
const { currentVisitor } = storeToRefs(store)

onMounted(() => {
    // If no visitor data (e.g. reload), redirect to home
    if (!currentVisitor.value) {
        // For development/mocking, we can set a dummy visitor if needed, or redirect
        // store.verifyPasscode('123456') // debug
        // else
        router.push('/public/visitor')
    }
})
</script>
