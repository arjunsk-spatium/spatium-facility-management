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
        <div class="w-full flex justify-center">
            <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
            <a-form :model="formState" layout="vertical" @finish="handleSubmit">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a-form-item label="Visitor Name" name="name"
                        :rules="[{ required: true, message: 'Please enter visitor name' }]">
                        <a-input v-model:value="formState.name" placeholder="Enter visitor's full name" size="large" />
                    </a-form-item>

                    <a-form-item label="Phone Number" name="phone"
                        :rules="[{ required: true, message: 'Please enter phone number' }]">
                        <a-input-group compact>
                            <a-select v-model:value="formState.countryCode" style="width: 90px" size="large" disabled>
                                <a-select-option value="+91">+91</a-select-option>
                            </a-select>
                            <a-input v-model:value="formState.phone" placeholder="98765 43210" size="large"
                                style="width: calc(100% - 90px)" />
                        </a-input-group>
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
                            use12-hours :disabled-time="disabledTime" :show-now="false" />
                    </a-form-item>

                    <a-form-item label="Facility" name="facilityId"
                        :rules="[{ required: true, message: 'Please select facility' }]">
                        <a-select v-model:value="formState.facilityId" placeholder="Select facility" size="large"
                            show-search :filter-option="filterOption">
                            <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id">
                                {{ facility.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Purpose of Visit" name="purpose"
                        :rules="[{ required: true, message: 'Please select purpose' }]">
                        <a-select v-model:value="formState.purpose" placeholder="Select purpose" size="large"
                            show-search :filter-option="filterOption">
                            <a-select-option v-for="purpose in purposes" :key="purpose.id" :value="purpose.id">
                                {{ purpose.name }}
                            </a-select-option>
                        </a-select>
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
            </a-card>
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
    passcode?: string
}

const store = useSpocStore()
const { loading, purposes, facilities, error } = storeToRefs(store)

const showSuccess = ref(false)
const lastInvited = ref<SpocVisitor | null>(null)

const formState = reactive({
    name: '',
    countryCode: '+91',
    phone: '',
    email: '',
    visitDate: null as Dayjs | null,
    visitTime: null as Dayjs | null,
    purpose: null as string | null,
    facilityId: null as string | null
})

const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf('day')
}

const disabledTime = () => {
    const now = dayjs()
    const isToday = formState.visitDate?.isSame(now, 'day')

    if (!isToday) {
        return { disabledHours: () => [], disabledMinutes: () => [] }
    }

    const disabledHours: number[] = []
    
    for (let h = 0; h < now.hour(); h++) {
        disabledHours.push(h)
    }

    return {
        disabledHours: () => disabledHours,
        disabledMinutes: (hour: number) => {
            if (hour === now.hour()) {
                const mins: number[] = []
                for (let m = 0; m < now.minute(); m++) {
                    mins.push(m)
                }
                return mins
            }
            return []
        }
    }
}

const filterOption = (input: string, option: any) => {
    return option.value.toLowerCase().includes(input.toLowerCase())
}

const resetForm = () => {
    formState.name = ''
    formState.countryCode = '+91'
    formState.phone = ''
    formState.email = ''
    formState.visitDate = null
    formState.visitTime = null
    formState.purpose = null
    formState.facilityId = null
}

const handleSubmit = async () => {
    try {
        const data = {
            name: formState.name,
            phone: formState.countryCode + formState.phone,
            email: formState.email || undefined,
            visitDate: formState.visitDate?.format('YYYY-MM-DD'),
            visitTime: formState.visitTime ? formState.visitTime.format('HH:mm') : undefined,
            purpose: formState.purpose || 'General Visit',
            facility_id: formState.facilityId || undefined,
            purpose_of_visit_id: formState.purpose || undefined
        }

        const visitor = await store.inviteVisitor(data)
        lastInvited.value = visitor
        showSuccess.value = true
        resetForm()
    } catch (err: any) {
        message.error(error.value || 'Failed to send invitation')
    }
}

onMounted(async () => {
    await Promise.all([
        store.fetchPurposesOfVisit(),
        store.fetchFacilities()
    ])
})
</script>
