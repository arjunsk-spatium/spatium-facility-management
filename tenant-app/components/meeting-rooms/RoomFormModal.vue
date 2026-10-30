<template>
    <a-modal v-model:open="visible" :title="isEdit ? 'Edit Room' : 'Add New Room'" :width="600" @cancel="handleCancel"
        :footer="null">
        <a-form :model="formState" :rules="rules" layout="vertical" @finish="handleSubmit" ref="formRef">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a-form-item label="Room Name" name="name" class="col-span-2">
                    <a-input v-model:value="formState.name" placeholder="e.g. Alpha Conference" size="large" />
                </a-form-item>

                <a-form-item label="Room Type" name="type">
                    <a-select v-model:value="formState.type" placeholder="Select type" size="large">
                        <a-select-option value="Meeting Room">Meeting Room</a-select-option>
                        <a-select-option value="Discussion Room">Discussion Room</a-select-option>
                        <a-select-option value="Board Room">Board Room</a-select-option>
                        <a-select-option value="Training Room">Training Room</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Capacity (PAX)" name="capacity">
                    <a-input-number v-model:value="formState.capacity" :min="1" :max="100" class="w-full" size="large"
                        placeholder="e.g. 12" />
                </a-form-item>

                <a-form-item label="Facility" name="facilityId">
                    <a-select v-model:value="formState.facilityId" placeholder="Select facility" size="large">
                        <a-select-option v-for="fac in facilities" :key="fac.id" :value="fac.id">
                            {{ fac.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Location Details" name="locationDetails">
                    <a-input v-model:value="formState.locationDetails" placeholder="e.g. Tower A, 12th Floor"
                        size="large" />
                </a-form-item>

                <a-form-item label="Price per 30 min (₹)" name="pricePerHour">
                    <a-input-number v-model:value="formState.pricePerHour" :min="0" class="w-full" size="large"
                        placeholder="e.g. 50" />
                </a-form-item>

                <a-form-item label="Credit Cost" name="creditCost">
                    <a-input-number v-model:value="formState.creditCost" :min="0" class="w-full" size="large"
                        placeholder="e.g. 10" />
                </a-form-item>

                <a-form-item label="Status" name="status">
                    <a-select v-model:value="formState.status" size="large">
                        <a-select-option value="Active">Active</a-select-option>
                        <a-select-option value="Inactive">Inactive</a-select-option>
                        <a-select-option value="Maintenance">Maintenance</a-select-option>
                    </a-select>
                </a-form-item>

                <a-form-item label="Amenities" name="amenities" class="col-span-2">
                    <a-checkbox-group v-model:value="formState.amenities" class="w-full">
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-2">
                            <a-checkbox v-for="amenity in amenityOptions" :key="amenity" :value="amenity">
                                {{ amenity }}
                            </a-checkbox>
                        </div>
                    </a-checkbox-group>
                </a-form-item>
            </div>

            <div class="flex justify-end gap-3 mt-6 pt-4 border-t dark:border-neutral-700">
                <a-button @click="handleCancel">Cancel</a-button>
                <a-button type="primary" html-type="submit" :loading="loading">
                    {{ isEdit ? 'Update Room' : 'Create Room' }}
                </a-button>
            </div>
        </a-form>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import { message } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import type { MeetingRoom } from '../../composables/meetingRoomService'

interface Props {
    open: boolean
    room?: MeetingRoom | null
    facilities: Array<{ id: string; name: string }>
}

const props = defineProps<Props>()
const emit = defineEmits<{
    'update:open': [value: boolean]
    'success': [room: MeetingRoom]
}>()

const visible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
})

const isEdit = computed(() => !!props.room)

const formRef = ref<FormInstance>()
const loading = ref(false)

const amenityOptions = ['TV', 'Video Conf', 'Whiteboard', 'Projector', 'Sound System', 'Wifi', 'Phone', 'AC']

const formState = reactive({
    name: '',
    type: undefined as MeetingRoom['type'] | undefined,
    capacity: undefined as number | undefined,
    facilityId: undefined as string | undefined,
    locationDetails: '',
    pricePerHour: undefined as number | undefined,
    creditCost: undefined as number | undefined,
    status: 'Active' as MeetingRoom['status'],
    amenities: [] as string[]
})

const rules = {
    name: [{ required: true, message: 'Please enter room name' }],
    type: [{ required: true, message: 'Please select room type' }],
    capacity: [{ required: true, message: 'Please enter capacity' }],
    facilityId: [{ required: true, message: 'Please select facility' }],
    pricePerHour: [{ required: true, message: 'Please enter price per hour' }],
    status: [{ required: true, message: 'Please select status' }]
}

// Reset form helper - must be defined before watcher that uses it
const resetForm = () => {
    formState.name = ''
    formState.type = undefined
    formState.capacity = undefined
    formState.facilityId = undefined
    formState.locationDetails = ''
    formState.pricePerHour = undefined
    formState.creditCost = undefined
    formState.status = 'Active'
    formState.amenities = []
}

// Re-populate form when editing
watch(() => props.room, (newRoom) => {
    if (newRoom) {
        formState.name = newRoom.name
        formState.type = newRoom.type
        formState.capacity = newRoom.capacity
        formState.facilityId = newRoom.facilityId
        formState.locationDetails = newRoom.locationDetails
        formState.pricePerHour = newRoom.pricePerHour
        formState.creditCost = newRoom.creditCost
        formState.status = newRoom.status
        formState.amenities = [...newRoom.amenities]
    } else {
        resetForm()
    }
}, { immediate: true })

const { createRoom, updateRoom } = useMeetingRoomService()

const handleSubmit = async () => {
    loading.value = true
    try {
        const facilityName = props.facilities.find(f => f.id === formState.facilityId)?.name || ''
        const roomData = {
            name: formState.name,
            type: formState.type!,
            capacity: formState.capacity!,
            facilityId: formState.facilityId!,
            facilityName,
            locationDetails: formState.locationDetails,
            pricePerHour: formState.pricePerHour!,
            creditCost: formState.creditCost || 0,
            status: formState.status,
            amenities: formState.amenities,
            images: []
        }

        let result: MeetingRoom | undefined
        if (isEdit.value && props.room) {
            result = await updateRoom(props.room.id, roomData)
            message.success('Room updated successfully!')
        } else {
            result = await createRoom(roomData)
            message.success('Room created successfully!')
        }

        if (result) {
            emit('success', result)
            visible.value = false
        }
    } catch (e) {
        message.error(isEdit.value ? 'Failed to update room' : 'Failed to create room')
    } finally {
        loading.value = false
    }
}

const handleCancel = () => {
    resetForm()
    visible.value = false
}
</script>
