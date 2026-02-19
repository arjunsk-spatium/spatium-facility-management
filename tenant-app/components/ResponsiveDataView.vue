<template>
    <div>
        <!-- Desktop Table View -->
        <a-table v-if="!isMobile" :columns="columns" :data-source="data" :loading="loading" :row-key="rowKey"
            :pagination="pagination" :scroll="{ x: 'max-content' }">
            <template #bodyCell="{ column, record }">
                <slot name="bodyCell" :column="column" :record="record"></slot>
            </template>
        </a-table>

        <!-- Mobile Card View -->
        <div v-else class="space-y-4">
            <div v-if="loading" class="flex justify-center p-8">
                <a-spin size="large" />
            </div>
            <div v-else-if="!data || data.length === 0" class="text-center p-8 text-neutral-500">
                No data found.
            </div>
            <template v-else>
                <!-- Card Render Loop -->
                <div v-for="item in paginatedMobileData" :key="getRowKey(item)" class="mobile-card-wrapper">
                    <slot name="mobileCard" :record="item"></slot>
                </div>

                <!-- Mobile Pagination -->
                <div class="flex justify-center pt-4" v-if="data.length > mobilePageSize">
                    <a-pagination v-model:current="currentMobilePage" v-model:pageSize="pageSizeRef"
                        :total="data.length" :show-size-changer="false" size="small" />
                </div>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useSidebar } from '../composables/useSidebar'

const props = defineProps({
    columns: {
        type: Array as () => any[],
        required: true
    },
    data: {
        type: Array as () => any[],
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    rowKey: {
        type: [String, Function],
        default: 'id'
    },
    pagination: {
        type: Object,
        default: () => ({})
    },
    mobilePageSize: {
        type: Number,
        default: 5
    }
})

const { isMobile } = useSidebar()

// Mobile Pagination State
const currentMobilePage = ref(1)
const pageSizeRef = ref(props.mobilePageSize)

// Reset pagination when data changes (e.g., search filter applied)
watch(() => props.data, () => {
    currentMobilePage.value = 1
})

// Helper check for rowKey to support both string and function
const getRowKey = (record: any) => {
    if (typeof props.rowKey === 'function') {
        return props.rowKey(record)
    }
    return record[props.rowKey]
}

// Compute sliced data for mobile view
const paginatedMobileData = computed(() => {
    const start = (currentMobilePage.value - 1) * pageSizeRef.value
    const end = start + pageSizeRef.value
    return props.data.slice(start, end)
})
</script>
