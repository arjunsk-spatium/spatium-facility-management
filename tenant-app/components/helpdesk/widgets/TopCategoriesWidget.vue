<template>
    <a-card title="Top Categories" :bordered="false" class="shadow-sm h-full">
        <a-list item-layout="horizontal" :data-source="data">
            <template #renderItem="{ item }">
                <a-list-item class="!px-0">
                    <a-list-item-meta>
                        <template #title>
                            <span class="font-medium dark:text-gray-200">{{ item.name }}</span>
                        </template>
                        <template #avatar>
                            <div class="bg-orange-50 dark:bg-orange-900/20 p-2 rounded-lg">
                                <TagsOutlined class="text-orange-500" />
                            </div>
                        </template>
                    </a-list-item-meta>
                    <div class="text-right">
                        <div class="font-bold text-lg dark:text-white">{{ item.count }}</div>
                        <div class="text-xs text-gray-500">Tickets</div>
                    </div>
                </a-list-item>
            </template>
        </a-list>
    </a-card>
</template>

<script setup lang="ts">
import { TagsOutlined } from '@ant-design/icons-vue';

const data = [
    { name: 'Electrical', count: 35 },
    { name: 'Air Conditioning', count: 28 },
    { name: 'Plumbing', count: 15 },
    { name: 'Housekeeping', count: 12 },
    { name: 'IT Support', count: 10 }
];
</script>
