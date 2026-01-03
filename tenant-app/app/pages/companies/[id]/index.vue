<template>
    <div class="max-w-3xl mx-auto space-y-6">
        <div class="flex items-center space-x-4">
            <NuxtLink to="/companies">
                <a-button type="text">
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                </a-button>
            </NuxtLink>
            <h1 class="text-2xl font-bold text-gray-900">Company Details</h1>
        </div>

        <div v-if="loading" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <a-card v-else-if="company" :bordered="false" class="shadow-sm">
            <template #extra>
                <NuxtLink :to="`/companies/${company.id}/edit`">
                    <a-button type="primary">Edit Company</a-button>
                </NuxtLink>
            </template>

            <a-descriptions title="Company Information" bordered
                :column="{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }">
                <a-descriptions-item label="Name">{{ company.name }}</a-descriptions-item>
                <a-descriptions-item label="Status">
                    <a-tag :color="company.status === 'active' ? 'green' : 'red'">
                        {{ company.status.toUpperCase() }}
                    </a-tag>
                </a-descriptions-item>
                <a-descriptions-item label="Address" :span="2">{{ company.address }}</a-descriptions-item>
                <a-descriptions-item label="Contact Email">{{ company.contactEmail || 'N/A' }}</a-descriptions-item>
                <a-descriptions-item label="Contact Phone">{{ company.contactPhone || 'N/A' }}</a-descriptions-item>
            </a-descriptions>
        </a-card>

        <div v-else class="text-center p-12 text-gray-500">
            <a-empty description="Company not found" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useCompanyStore } from '../../../../stores/company'
import { ArrowLeftOutlined } from '@ant-design/icons-vue'

const route = useRoute()
const store = useCompanyStore()
const company = computed(() => store.currentCompany)
const loading = computed(() => store.loading)

onMounted(() => {
    const id = route.params.id as string
    if (id) {
        store.fetchCompany(id)
    }
})
</script>
