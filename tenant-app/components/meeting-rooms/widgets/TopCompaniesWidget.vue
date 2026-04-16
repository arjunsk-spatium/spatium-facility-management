<template>
    <a-card title="Top Companies by Bookings" >
        <a-list item-layout="horizontal" :data-source="data">
            <template #renderItem="{ item, index }">
                <a-list-item class="!px-0">
                    <a-list-item-meta>
                        <template #title>
                            <span class="font-medium dark:text-gray-200">{{ item.name }}</span>
                        </template>
                        <template #avatar>
                            <div class="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg">
                                <TeamOutlined class="text-blue-500" />
                            </div>
                        </template>
                    </a-list-item-meta>
                    <div class="text-right">
                        <div class="font-bold text-lg dark:text-white">{{ item.count }}</div>
                        <div class="text-xs text-gray-500">Bookings</div>
                    </div>
                </a-list-item>
            </template>
        </a-list>
    </a-card>
</template>

<script setup lang="ts">
import { TeamOutlined } from '@ant-design/icons-vue';

const data = [
    { name: 'Acme Corp', count: 55 },
    { name: 'Globex Inc', count: 42 },
    { name: 'Initech', count: 30 },
    { name: 'Umbrella Corp', count: 12 },
    { name: 'Stark Ind', count: 6 }
];
</script>
