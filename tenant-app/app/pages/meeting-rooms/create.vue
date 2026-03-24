<template>
    <div class="space-y-6">
        <div class="flex items-center gap-4 mb-6">
            <div>
                <h1 class="text-2xl-white">Add New Room</h1 font-bold dark:text>
                <p class="text-gray-600 dark:text-gray-400">Create a new meeting room configuration.</p>
            </div>
        </div>
        <div class="flex justify-center">
        <a-card class="w-full sm:max-w-4xl" :bodyStyle="{ padding: '16px 24px' }">
            <a-form :model="formState" :rules="rules" layout="vertical" @finish="handleSubmit" ref="formRef">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <a-form-item label="Room Name" name="name" class="col-span-2 md:col-span-1">
                        <a-input v-model:value="formState.name" placeholder="e.g. Alpha Conference" size="large" />
                    </a-form-item>

                    <a-form-item label="Room Type" name="room_type">
                        <a-select v-model:value="formState.room_type" placeholder="Select type" size="large">
                            <a-select-option v-for="rt in roomTypes" :key="rt.id" :value="rt.id">
                                {{ rt.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Capacity (PAX)" name="pax">
                        <a-input-number v-model:value="formState.pax" :min="1" :max="100" class="w-full"
                            size="large" placeholder="e.g. 12" />
                    </a-form-item>

                    <a-form-item label="Facility" name="facility">
                        <a-select v-model:value="formState.facility" placeholder="Select facility" size="large">
                            <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">
                                {{ fac.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Price (₹)" name="price">
                        <a-input-number v-model:value="formState.price" :min="0" class="w-full" size="large"
                            placeholder="e.g. 150" />
                    </a-form-item>

                    <a-form-item label="Credits" name="credits">
                        <a-input-number v-model:value="formState.credits" :min="0" class="w-full" size="large"
                            placeholder="e.g. 15" />
                    </a-form-item>

                    <a-form-item label="Status" name="status">
                        <a-select v-model:value="formState.status" size="large">
                            <a-select-option value="ACTIVE">Active</a-select-option>
                            <a-select-option value="INACTIVE">Inactive</a-select-option>
                            <a-select-option value="MAINTENANCE">Maintenance</a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item label="Amenities" name="amenities">
                        <a-select v-model:value="formState.amenities" mode="multiple" placeholder="Select amenities" size="large">
                            <a-select-option v-for="amenity in amenitiesList" :key="amenity.id" :value="amenity.id">
                                {{ amenity.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </div>

                <div class="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-neutral-700">
                    <a-button @click="navigateTo('/meeting-rooms')">Cancel</a-button>
                    <a-button type="primary" html-type="submit" :loading="loading">
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Create Room
                    </a-button>
                </div>
            </a-form>
        </a-card>
    </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useNuxtApp } from '#app'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import { useMeetingRoomStore } from '../../../stores/meetingRoom'
import { useFacilityStore } from '../../../stores/facility'
import { useMeetingRoomService, type MeetingRoom } from '../../../composables/meetingRoomService'
import { storeToRefs } from 'pinia'

definePageMeta({
    middleware: 'auth'
})

const { $api } = useNuxtApp()
const facilityStore = useFacilityStore()
const roomStore = useMeetingRoomStore()
const { facilities } = storeToRefs(facilityStore)

const formRef = ref<FormInstance>()
const loading = ref(false)
const roomTypes = ref<any[]>([])
const amenitiesList = ref<any[]>([])

const formState = reactive({
    name: '',
    room_type: undefined as string | undefined,
    pax: undefined as number | undefined,
    facility: undefined as string | undefined,
    price: undefined as number | undefined,
    credits: undefined as number | undefined,
    status: 'ACTIVE' as string,
    amenities: [] as string[]
})

const rules = {
    name: [{ required: true, message: 'Please enter room name' }],
    room_type: [{ required: true, message: 'Please select room type' }],
    pax: [{ required: true, message: 'Please enter capacity' }],
    facility: [{ required: true, message: 'Please select facility' }],
    price: [{ required: true, message: 'Please enter price' }],
    status: [{ required: true, message: 'Please select status' }]
}

const { createRoom } = useMeetingRoomService()

const fetchDropdowns = async () => {
    try {
        const [rtResult, amResult] = await Promise.all([
            $api<any>('/api/portal/meeting-rooms/room-types/'),
            $api<any>('/api/portal/meeting-rooms/amenities/')
        ])
        if (rtResult.success) {
            roomTypes.value = rtResult.data.results || []
        }
        if (amResult.success) {
            amenitiesList.value = amResult.data.results || []
        }
    } catch (e) {
        console.error('Failed to fetch dropdowns:', e)
    }
}

const handleSubmit = async () => {
    loading.value = true
    try {
        const roomData = {
            name: formState.name,
            pax: formState.pax,
            room_type: formState.room_type,
            facility: formState.facility,
            price: String(formState.price || ''),
            credits: formState.credits || 0,
            status: formState.status,
            amenities: formState.amenities
        }

        await createRoom(roomData)
        message.success('Room created successfully!')

        await roomStore.fetchRooms(true)

        navigateTo('/meeting-rooms')
    } catch (e) {
        message.error('Failed to create room')
    } finally {
        loading.value = false
    }
}

onMounted(async () => {
    await Promise.all([
        facilityStore.fetchFacilities(),
        fetchDropdowns()
    ])
})
</script>
