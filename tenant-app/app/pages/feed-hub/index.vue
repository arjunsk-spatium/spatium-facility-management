<template>
    <div class="max-w-3xl mx-auto space-y-6">
        <!-- Header -->
        <div class="flex justify-between items-center">
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Feed Hub</h1>
            <NuxtLink to="/feed-hub/create">
                <a-button type="primary">
                    <template #icon>
                        <PlusOutlined />
                    </template>
                    Create Post
                </a-button>
            </NuxtLink>
        </div>

        <!-- Category Filter -->
        <div class="flex flex-wrap gap-2">
            <a-button :type="selectedCategory === null ? 'primary' : 'default'" size="small"
                @click="selectedCategory = null">
                All
            </a-button>
            <a-button v-for="cat in categories" :key="cat.id"
                :type="selectedCategory === cat.id ? 'primary' : 'default'" size="small"
                @click="selectedCategory = cat.id">
                {{ cat.name }}
            </a-button>
        </div>

        <!-- Posts -->
        <div v-if="loading && hubPosts.length === 0" class="flex justify-center py-12">
            <a-spin size="large" />
        </div>
        <div v-else-if="filteredPosts.length === 0" class="text-center py-12">
            <a-empty description="No posts yet" />
        </div>
        <div v-else class="space-y-4">
            <FeedHubCard v-for="post in filteredPosts" :key="post.id" :post="post" @like-toggled="handleLikeToggled"
                @deleted="handleDeleted" />

            <!-- Pagination -->
            <div v-if="hubCount > pageSize" class="flex justify-center pt-4">
                <a-pagination :current="currentPage" :total="hubCount" :page-size="pageSize"
                    @change="handlePageChange" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import FeedHubCard from '../../components/feed/FeedHubCard.vue'

definePageMeta({ layout: 'default', middleware: ['auth'] })

const store = useFeedStore()
const loading = computed(() => store.loading)
const hubPosts = computed(() => store.hubPosts)
const hubCount = computed(() => store.hubCount)
const categories = computed(() => store.categories)

const selectedCategory = ref<string | null>(null)
const currentPage = ref(1)
const pageSize = ref(10)

const filteredPosts = computed(() => {
    if (!selectedCategory.value) return hubPosts.value
    return hubPosts.value.filter((p) => p.category?.id === selectedCategory.value)
})

const handleLikeToggled = () => {
    // The store already updated the post locally
}

const handleDeleted = () => {
    store.fetchHubPosts({ page: currentPage.value, page_size: pageSize.value })
}

const handlePageChange = (page: number) => {
    currentPage.value = page
    store.fetchHubPosts({ page, page_size: pageSize.value })
}

watch(selectedCategory, () => {
    currentPage.value = 1
})

onMounted(() => {
    store.fetchCategories()
    store.fetchHubPosts({ page: 1, page_size: pageSize.value })
})
</script>
