<template>
    <div class="space-y-6">
        <!-- Page Header -->
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
                <h1 class="text-2xl font-bold mb-1 dark:text-white">Invite Visitor</h1>
                <p class="text-gray-600 dark:text-gray-400">Send an invitation code to your visitor.</p>
            </div>
            <NuxtLink to="/spoc/visitors">
                <a-button>
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                    Back to List
                </a-button>
            </NuxtLink>
        </div>

        <!-- Invite Form -->
        <div
            class="bg-white dark:bg-neutral-800 rounded-xl border border-gray-100 dark:border-neutral-700 p-4 sm:p-6 max-w-2xl">
            <a-form :model="formState" layout="vertical" @finish="handleSubmit">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a-form-item label="Visitor Name" name="name"
                        :rules="[{ required: true, message: 'Please enter visitor name' }]">
                        <a-input v-model:value="formState.name" placeholder="Enter visitor's full name" size="large" />
                    </a-form-item>

                    <a-form-item label="Phone Number" name="phone"
                        :rules="[{ required: true, message: 'Please enter phone number' }]">
                        <a-input v-model:value="formState.phone" placeholder="+91 98765 43210" size="large" />
                    </a-form-item>

                    <a-form-item label="Email" name="email" class="sm:col-span-2">
                        <a-input v-model:value="formState.email" placeholder="visitor@email.com" size="large" />
                    </a-form-item>

                    <a-form-item label="Visit Date" name="visitDate"
                        :rules="[{ required: true, message: 'Please select visit date' }]">
                        <a-date-picker v-model:value="formState.visitDate" class="w-full" size="large"
                            :disabled-date="disabledDate" format="DD/MM/YYYY" />
                    </a-form-item>

                    <a-form-item label="Visit Time" name="visitTime">
                        <a-time-picker v-model:value="formState.visitTime" class="w-full" size="large" format="hh:mm A"
                            use12-hours />
                    </a-form-item>

                    <a-form-item label="Purpose of Visit" name="purpose"
                        :rules="[{ required: true, message: 'Please select purpose' }]" class="sm:col-span-2">
                        <a-select v-model:value="formState.purpose" placeholder="Select purpose" size="large">
                            <a-select-option value="Business Meeting">Business Meeting</a-select-option>
                            <a-select-option value="Interview">Interview</a-select-option>
                            <a-select-option value="Delivery">Delivery</a-select-option>
                            <a-select-option value="Vendor Visit">Vendor Visit</a-select-option>
                            <a-select-option value="Personal">Personal</a-select-option>
                            <a-select-option value="Other">Other</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Host Employee" name="hostName" class="sm:col-span-2">
                        <a-select v-model:value="formState.hostName" placeholder="Select host employee" size="large"
                            show-search :filter-option="filterOption">
                            <a-select-option v-for="emp in employees" :key="emp.id" :value="emp.name">
                                {{ emp.name }} - {{ emp.department }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Additional Notes" name="notes" class="sm:col-span-2">
                        <a-textarea v-model:value="formState.notes" placeholder="Any special instructions..."
                            :rows="3" />
                    </a-form-item>
                </div>

                <div class="flex flex-col sm:flex-row gap-3 pt-4">
                    <a-button type="primary" html-type="submit" :loading="loading" size="large"
                        class="w-full sm:w-auto">
                        <template #icon>
                            <SendOutlined />
                        </template>
                        Send Invitation
                    </a-button>
                    <a-button size="large" class="w-full sm:w-auto" @click="resetForm">
                        Reset
                    </a-button>
                </div>
            </a-form>
        </div>

        <!-- Success Modal -->
        <a-modal v-model:open="showSuccess" title="Invitation Sent!" centered :footer="null">
            <div class="text-center py-4">
                <div
                    class="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircleOutlined class="text-3xl" />
                </div>
                <p class="text-gray-600 dark:text-gray-300 mb-2">
                    An invitation has been sent to <strong>{{ lastInvited?.name }}</strong>
                </p>
                <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    The visitor will receive an SMS/Email with their passcode.
                </p>
                <div class="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4 mb-4">
                    <p class="text-sm text-gray-500 dark:text-gray-400">Passcode</p>
                    <p class="text-2xl font-bold font-mono text-gray-900 dark:text-white">{{ lastInvited?.passcode }}
                    </p>
                </div>
                <a-button type="primary" @click="showSuccess = false" block>Done</a-button>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { message } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import {
    ArrowLeftOutlined,
    SendOutlined,
    CheckCircleOutlined
} from '@ant-design/icons-vue'

definePageMeta({
    middleware: 'auth'
})

interface SpocVisitor {
    id: string
    name: string
    phone: string
    email?: string
    visitDate: string
    visitTime?: string
    purpose: string
    status: string
    hostName?: string
    passcode?: string
}

const store = useSpocStore()
const { employees, loading } = storeToRefs(store)

const showSuccess = ref(false)
const lastInvited = ref<SpocVisitor | null>(null)

const formState = reactive({
    name: '',
    phone: '',
    email: '',
    visitDate: null as Dayjs | null,
    visitTime: null as Dayjs | null,
    purpose: null as string | null,
    hostName: null as string | null,
    notes: ''
})

const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day')
}

const filterOption = (input: string, option: any) => {
    return option.value.toLowerCase().includes(input.toLowerCase())
}

const resetForm = () => {
    formState.name = ''
    formState.phone = ''
    formState.email = ''
    formState.visitDate = null
    formState.visitTime = null
    formState.purpose = null
    formState.hostName = null
    formState.notes = ''
}

const handleSubmit = async () => {
    try {
        const data = {
            name: formState.name,
            phone: formState.phone,
            email: formState.email || undefined,
            visitDate: formState.visitDate?.format('YYYY-MM-DD'),
            visitTime: formState.visitTime?.format('hh:mm A'),
            purpose: formState.purpose || 'General Visit',
            hostName: formState.hostName || undefined
        }

        const visitor = await store.inviteVisitor(data)
        lastInvited.value = visitor
        showSuccess.value = true
        resetForm()
    } catch (err) {
        message.error('Failed to send invitation')
    }
}

onMounted(() => {
    store.fetchEmployees()
})
</script>
