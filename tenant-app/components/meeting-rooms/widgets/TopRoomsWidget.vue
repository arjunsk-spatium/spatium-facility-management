<template>
    <a-card title="Top Meeting Rooms" >
        <a-list item-layout="horizontal" :data-source="data">
            <template #renderItem="{ item, index }">
                <a-list-item class="!px-0">
                    <a-list-item-meta>
                        <template #title>
                            <span class="font-medium dark:text-gray-200">{{ item.name }}</span>
                        </template>
                        <template #avatar>
                            <div
                                class="w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full font-bold text-gray-500">
                                {{ index + 1 }}
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
const data = [
    { name: 'Alpha Conference', count: 42 },
    { name: 'Brainstorm Pod', count: 35 },
    { name: 'Glass Room', count: 28 },
    { name: 'Training Center', count: 22 },
    { name: 'Corner Office', count: 18 }
];
</script>
