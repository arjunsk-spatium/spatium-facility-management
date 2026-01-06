<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Visitors Management</h1>
                <p class="text-gray-600 dark:text-gray-400">Track and manage facility visitors.</p>
            </div>
            <div>
                <a-button type="primary" ghost>
                    <template #icon>
                        <ExportOutlined />
                    </template>
                    Export Log
                </a-button>
            </div>
        </div>

        <VisitorList :visitors="visitors" :loading="loading" @update-status="handleStatusUpdate" />
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { ExportOutlined } from '@ant-design/icons-vue'

import VisitorList from '../../components/visitors/VisitorList.vue'

definePageMeta({
    middleware: 'auth'
})

const store = useVisitorStore()
const { visitors, loading } = storeToRefs(store)

const handleStatusUpdate = async (id: string, status: any) => {
    await store.updateStatus(id, status)
}

onMounted(() => {
    store.fetchVisitors()
})
</script>
