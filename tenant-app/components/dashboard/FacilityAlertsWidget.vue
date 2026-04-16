<template>
    <a-card title="Facility Alerts">
        <div class="space-y-3">
            <div v-for="alert in alerts" :key="alert.id"
                class="flex items-start gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer">
                <div class="mt-1">
                    <component :is="alert.icon" :class="alert.color" />
                </div>
                <div>
                    <div class="font-medium text-sm">{{ alert.message }}</div>
                    <div class="text-xs text-gray-500">{{ alert.location }} • {{ alert.time }}</div>
                </div>
            </div>
            <div v-if="alerts.length === 0" class="text-center text-gray-500 py-4">
                No active alerts.
            </div>
        </div>
    </a-card>
</template>

<script setup lang="ts">
import { WarningOutlined, ToolOutlined, SafetyCertificateOutlined } from '@ant-design/icons-vue';

const alerts = [
    { id: 1, message: 'HVAC Maintenance Due', location: 'Building A, Floor 3', time: '2h ago', icon: ToolOutlined, color: 'text-orange-500' },
    { id: 2, message: 'Fire Alarm Test', location: 'All Buildings', time: '5h ago', icon: SafetyCertificateOutlined, color: 'text-blue-500' },
    { id: 3, message: 'High Water Usage', location: 'Cafeteria', time: '1d ago', icon: WarningOutlined, color: 'text-red-500' },
];
</script>
