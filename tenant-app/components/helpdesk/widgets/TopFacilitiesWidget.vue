<template>
    <a-card title="Top Facilities by Volume" :bordered="false" class="shadow-sm h-full">
        <a-list item-layout="horizontal" :data-source="data">
            <template #renderItem="{ item }">
                <a-list-item class="!px-0">
                    <a-list-item-meta>
                        <template #title>
                            <span class="font-medium dark:text-gray-200">{{ item.name }}</span>
                        </template>
                        <template #avatar>
                            <div class="bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                                <BankOutlined class="text-gray-500" />
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
import { BankOutlined } from '@ant-design/icons-vue';

const data = [
    { name: 'Headquarters', count: 45 },
    { name: 'North Wing', count: 22 },
    { name: 'East Campus', count: 18 },
    { name: 'Warehouse', count: 5 }
];
</script>
