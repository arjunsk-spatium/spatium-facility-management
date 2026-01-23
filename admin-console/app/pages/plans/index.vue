<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div
            class="flex justify-between items-center p-4 rounded-lg shadow-sm transition-colors duration-300 page-header">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Plans</h1>
            <NuxtLink to="/plans/create">
                <a-button type="primary" size="large">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create <span class="hidden sm:inline">Plan</span>
                </a-button>
            </NuxtLink>
        </div>

        <!-- Plans Grid -->
        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            <a-card v-for="plan in plans" :key="plan.id" 
                class="h-full flex flex-col"
                :bodyStyle="{ flex: 1, display: 'flex', flexDirection: 'column' }">
                <template #title>
                    <div class="flex items-center justify-between">
                        <span class="font-semibold">{{ plan.name }}</span>
                        <a-tag :color="plan.isActive ? 'green' : 'default'">
                            {{ plan.isActive ? 'Active' : 'Inactive' }}
                        </a-tag>
                    </div>
                </template>

                <div class="space-y-4 flex-1 flex flex-col">
                    <p class="text-gray-500 text-sm min-h-[40px]">{{ plan.description }}</p>

                    <div class="text-center py-4 border-y border-gray-100 dark:border-gray-800">
                        <div v-if="plan.price > 0" class="text-3xl font-bold text-primary-600">
                            ₹{{ plan.price }}
                            <span class="text-sm font-normal text-gray-500">/{{ plan.billingCycle === 'monthly' ? 'mo' :
                                'yr'
                            }}</span>
                        </div>
                        <div v-else class="text-2xl font-bold text-primary-600">Custom Pricing</div>
                        <div class="text-sm text-gray-500 mt-1">Up to {{ plan.maxUsers }} users</div>
                    </div>

                    <div class="min-h-[60px]">
                        <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Modules</div>
                        <div class="flex flex-wrap gap-1">
                            <a-tag v-for="mod in plan.modules" :key="mod" size="small">{{ mod }}</a-tag>
                            <span v-if="plan.modules.length === 0" class="text-gray-400 text-sm">Custom selection</span>
                        </div>
                    </div>

                    <div class="flex-1 min-h-[100px]">
                        <div class="text-xs font-semibold text-gray-500 uppercase mb-2">Features</div>
                        <ul class="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                            <li v-for="feature in plan.features.slice(0, 3)" :key="feature"
                                class="flex items-center gap-2">
                                <CheckOutlined class="text-green-500 text-xs" />
                                {{ feature }}
                            </li>
                            <li v-if="plan.features.length > 3" class="text-primary-500 text-xs">
                                +{{ plan.features.length - 3 }} more
                            </li>
                        </ul>
                    </div>
                </div>

                <template #actions>
                    <NuxtLink :to="`/plans/${plan.id}/edit`">
                        <a-button type="text">
                            <EditOutlined /> Edit
                        </a-button>
                    </NuxtLink>
                    <a-popconfirm title="Delete this plan?" @confirm="handleDelete(plan.id)">
                        <a-button type="text" danger>
                            <DeleteOutlined /> Delete
                        </a-button>
                    </a-popconfirm>
                </template>
            </a-card>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {
    PlusOutlined,
    CheckOutlined,
    EditOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue'
import { usePlanStore } from '../../../stores/plan'

const store = usePlanStore()
const plans = computed(() => store.plans)
const loading = computed(() => store.loading)

const handleDelete = async (id: string) => {
    try {
        await store.deletePlanAction(id)
        message.success('Plan deleted successfully')
    } catch {
        message.error('Failed to delete plan')
    }
}

onMounted(() => {
    store.fetchPlans()
})
</script>

<style scoped>
.page-header {
    background: #ffffff;
    border: 1px solid #e5e5e5;
}

.dark .page-header {
    background: #1f1f1f;
    border-color: #333333;
}
</style>
