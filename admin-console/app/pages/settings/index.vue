<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex justify-between items-center p-4 transition-colors duration-300">
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
                <p class="text-gray-500 text-sm">Configure admin console settings</p>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- General Settings -->
            <a-card class="lg:col-span-2">
                <template #title>
                    <div class="flex items-center gap-2">
                        <SettingOutlined />
                        <span>General Settings</span>
                    </div>
                </template>

                <a-form layout="vertical" class="max-w-xl">
                    <a-form-item label="Platform Name">
                        <a-input v-model:value="settings.platformName" />
                    </a-form-item>

                    <a-form-item label="Support Email">
                        <a-input v-model:value="settings.supportEmail" />
                    </a-form-item>

                    <a-form-item label="Default Trial Period (days)">
                        <a-input-number v-model:value="settings.trialDays" :min="1" :max="90" style="width: 150px" />
                    </a-form-item>

                    <a-form-item label="Default Plan for New Tenants">
                        <a-select v-model:value="settings.defaultPlan" style="width: 200px">
                            <a-select-option value="starter">Starter</a-select-option>
                            <a-select-option value="pro">Pro</a-select-option>
                            <a-select-option value="enterprise">Enterprise</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item>
                        <a-button type="primary" @click="saveSettings">Save Changes</a-button>
                    </a-form-item>
                </a-form>
            </a-card>

            <!-- Quick Actions -->
            <a-card>
                <template #title>
                    <div class="flex items-center gap-2">
                        <ThunderboltOutlined />
                        <span>Quick Actions</span>
                    </div>
                </template>

                <div class="space-y-3">
                    <a-button block>
                        <SyncOutlined /> Sync All Tenants
                    </a-button>
                    <a-button block>
                        <MailOutlined /> Send System Notification
                    </a-button>
                    <a-button block>
                        <DatabaseOutlined /> Backup Database
                    </a-button>
                    <a-button block danger>
                        <ClearOutlined /> Clear Cache
                    </a-button>
                </div>
            </a-card>
        </div>

        <!-- Notifications Settings -->
        <a-card>
            <template #title>
                <div class="flex items-center gap-2">
                    <BellOutlined />
                    <span>Notification Settings</span>
                </div>
            </template>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">New Tenant Notifications</div>
                            <div class="text-sm text-gray-500">Get notified when new tenants sign up</div>
                        </div>
                        <a-switch v-model:checked="notifications.newTenant" />
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">Payment Alerts</div>
                            <div class="text-sm text-gray-500">Get notified about payment issues</div>
                        </div>
                        <a-switch v-model:checked="notifications.paymentAlerts" />
                    </div>
                </div>

                <div class="space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">Usage Alerts</div>
                            <div class="text-sm text-gray-500">Get notified when tenants exceed limits</div>
                        </div>
                        <a-switch v-model:checked="notifications.usageAlerts" />
                    </div>

                    <div class="flex items-center justify-between">
                        <div>
                            <div class="font-medium">System Updates</div>
                            <div class="text-sm text-gray-500">Get notified about system updates</div>
                        </div>
                        <a-switch v-model:checked="notifications.systemUpdates" />
                    </div>
                </div>
            </div>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import {
    SettingOutlined,
    ThunderboltOutlined,
    SyncOutlined,
    MailOutlined,
    DatabaseOutlined,
    ClearOutlined,
    BellOutlined
} from '@ant-design/icons-vue'

const settings = ref({
    platformName: 'Spatium Facility Management',
    supportEmail: 'support@spatium.app',
    trialDays: 14,
    defaultPlan: 'starter'
})

const notifications = ref({
    newTenant: true,
    paymentAlerts: true,
    usageAlerts: false,
    systemUpdates: true
})

const saveSettings = () => {
    message.success('Settings saved successfully')
}
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
