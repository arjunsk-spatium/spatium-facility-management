<template>
    <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 class="text-xl font-semibold dark:text-white">Room Meta Settings</h2>
        </div>

        <!-- Sub-tabs -->
        <a-tabs v-model:activeKey="activeSubTab" type="card">
            <a-tab-pane key="roomTypes" tab="Room Types">
                <div class="py-4">
                    <ConfigTable title="Room Types" :columns="roomTypeColumns" :data="roomTypes" :loading="loading"
                        @add="handleAddRoomType" @edit="handleEditRoomType" @delete="handleDeleteRoomType" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="pax" tab="PAX (Capacity)">
                <div class="py-4">
                    <ConfigTable title="PAX Values" :columns="paxColumns" :data="paxValues" :loading="loading"
                        :fields="paxFields" @add="handleAddPax" @edit="handleEditPax" @delete="handleDeletePax" />
                </div>
            </a-tab-pane>

            <a-tab-pane key="amenities" tab="Amenities">
                <div class="py-4">
                    <ConfigTable title="Amenities" :columns="amenityColumns" :data="amenities" :loading="loading"
                        @add="handleAddAmenity" @edit="handleEditAmenity" @delete="handleDeleteAmenity" />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'

const activeSubTab = ref('roomTypes')
const loading = ref(false)

// Room Types data
const roomTypes = ref<any[]>([])

// PAX data
const paxValues = ref<any[]>([])

// Amenities data
const amenities = ref<any[]>([])

// Columns
const roomTypeColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Action', key: 'action', width: 150 }
]

const paxColumns = [
    { title: 'Value', dataIndex: 'value', key: 'value' },
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'Action', key: 'action', width: 150 }
]

const paxFields = [
    { name: 'value', label: 'Max Persons', type: 'number' as const },
    { name: 'label', label: 'Label (e.g., "1-5 persons")', type: 'text' as const }
]

const amenityColumns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Icon', dataIndex: 'icon', key: 'icon' },
    { title: 'Action', key: 'action', width: 150 }
]

// Mock data for now
onMounted(() => {
    // TODO: Replace with API calls
    roomTypes.value = [
        { id: 1, name: 'Conference Room', description: 'Large meeting space' },
        { id: 2, name: 'Huddle Room', description: 'Small team meetings' },
        { id: 3, name: 'Training Room', description: 'Training and workshops' },
        { id: 4, name: 'Board Room', description: 'Executive meetings' }
    ]
    paxValues.value = [
        { id: 1, value: 5, label: '1-5 persons' },
        { id: 2, value: 10, label: '6-10 persons' },
        { id: 3, value: 20, label: '11-20 persons' },
        { id: 4, value: 50, label: '21-50 persons' }
    ]
    amenities.value = [
        { id: 1, name: 'Projector', icon: 'projector' },
        { id: 2, name: 'Whiteboard', icon: 'whiteboard' },
        { id: 3, name: 'Video Conference', icon: 'video' },
        { id: 4, name: 'TV Screen', icon: 'tv' },
        { id: 5, name: 'Coffee Machine', icon: 'coffee' }
    ]
})

// Room Type Handlers
const handleAddRoomType = (data: any) => {
    message.success('Room type added successfully')
    roomTypes.value.push({ id: Date.now(), ...data })
}

const handleEditRoomType = (record: any, data: any) => {
    message.success('Room type updated successfully')
    const index = roomTypes.value.findIndex(r => r.id === record.id)
    if (index > -1) roomTypes.value[index] = { ...record, ...data }
}

const handleDeleteRoomType = (record: any) => {
    message.success('Room type deleted successfully')
    roomTypes.value = roomTypes.value.filter(r => r.id !== record.id)
}

// PAX Handlers
const handleAddPax = (data: any) => {
    message.success('PAX value added successfully')
    paxValues.value.push({ id: Date.now(), ...data })
}

const handleEditPax = (record: any, data: any) => {
    message.success('PAX value updated successfully')
    const index = paxValues.value.findIndex(p => p.id === record.id)
    if (index > -1) paxValues.value[index] = { ...record, ...data }
}

const handleDeletePax = (record: any) => {
    message.success('PAX value deleted successfully')
    paxValues.value = paxValues.value.filter(p => p.id !== record.id)
}

// Amenity Handlers
const handleAddAmenity = (data: any) => {
    message.success('Amenity added successfully')
    amenities.value.push({ id: Date.now(), ...data })
}

const handleEditAmenity = (record: any, data: any) => {
    message.success('Amenity updated successfully')
    const index = amenities.value.findIndex(a => a.id === record.id)
    if (index > -1) amenities.value[index] = { ...record, ...data }
}

const handleDeleteAmenity = (record: any) => {
    message.success('Amenity deleted successfully')
    amenities.value = amenities.value.filter(a => a.id !== record.id)
}
</script>
