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
                        :fields="amenityFields" @add="handleAddAmenity" @edit="handleEditAmenity" @delete="handleDeleteAmenity" />
                </div>
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import ConfigTable from './ConfigTable.vue'
import { useAuthFetch } from '../../composables/useAuthFetch'

const { authFetch } = useAuthFetch()

const API_BASE = '/api/portal/meeting-rooms/room-types'
const AMENITY_API_BASE = '/api/portal/meeting-rooms/amenities'

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

const amenityFields = [
    { name: 'name', label: 'Name', type: 'text' as const }
]

// API Functions
const fetchRoomTypes = async () => {
    loading.value = true
    try {
        const result = await authFetch<any>(API_BASE + '/')
        if (result.success) {
            roomTypes.value = result.data.results || []
        }
    } catch (error) {
        console.error('Failed to fetch room types:', error)
        message.error('Failed to load room types')
    } finally {
        loading.value = false
    }
}

const createRoomType = async (data: { name: string }) => {
    try {
        const result = await authFetch<any>(API_BASE + '/', {
            method: 'POST',
            body: { name: data.name }
        })
        if (result.success) {
            message.success('Room type added successfully')
            await fetchRoomTypes()
        } else {
            message.error(result.message || 'Failed to add room type')
        }
    } catch (error) {
        message.error('Failed to add room type')
    }
}

const updateRoomType = async (record: any, data: { name: string }) => {
    try {
        const result = await authFetch<any>(API_BASE + '/' + record.id + '/', {
            method: 'PATCH',
            body: { name: data.name }
        })
        if (result.success) {
            message.success('Room type updated successfully')
            await fetchRoomTypes()
        } else {
            message.error(result.message || 'Failed to update room type')
        }
    } catch (error) {
        message.error('Failed to update room type')
    }
}

const deleteRoomType = async (record: any) => {
    try {
        await authFetch<any>(API_BASE + '/' + record.id + '/', {
            method: 'DELETE'
        })
        message.success('Room type deleted successfully')
        await fetchRoomTypes()
    } catch (error) {
        message.error('Failed to delete room type')
    }
}

// Amenities API Functions
const fetchAmenities = async () => {
    loading.value = true
    try {
        const result = await authFetch<any>(AMENITY_API_BASE + '/')
        if (result.success) {
            amenities.value = result.data.results || []
        }
    } catch (error) {
        console.error('Failed to fetch amenities:', error)
        message.error('Failed to load amenities')
    } finally {
        loading.value = false
    }
}

const createAmenity = async (data: { name: string; icon?: File }) => {
    try {
        const body: any = { name: data.name }
        
        const result = await authFetch<any>(AMENITY_API_BASE + '/', {
            method: 'POST',
            body: body
        })
        if (result.success) {
            message.success('Amenity added successfully')
            await fetchAmenities()
        } else {
            message.error(result.message || 'Failed to add amenity')
        }
    } catch (error) {
        message.error('Failed to add amenity')
    }
}

const updateAmenity = async (record: any, data: { name: string; icon?: File }) => {
    try {
        const body: any = { name: data.name }

        const result = await authFetch<any>(AMENITY_API_BASE + '/' + record.id + '/', {
            method: 'PATCH',
            body: body
        })
        if (result.success) {
            message.success('Amenity updated successfully')
            await fetchAmenities()
        } else {
            message.error(result.message || 'Failed to update amenity')
        }
    } catch (error) {
        message.error('Failed to update amenity')
    }
}

const deleteAmenity = async (record: any) => {
    try {
        await authFetch<any>(AMENITY_API_BASE + '/' + record.id + '/', {
            method: 'DELETE'
        })
        message.success('Amenity deleted successfully')
        await fetchAmenities()
    } catch (error) {
        message.error('Failed to delete amenity')
    }
}

onMounted(async () => {
    await fetchRoomTypes()
    await fetchAmenities()
    paxValues.value = [
        { id: 1, value: 5, label: '1-5 persons' },
        { id: 2, value: 10, label: '6-10 persons' },
        { id: 3, value: 20, label: '11-20 persons' },
        { id: 4, value: 50, label: '21-50 persons' }
    ]
})

// Room Type Handlers
const handleAddRoomType = async (data: any) => {
    await createRoomType(data)
}

const handleEditRoomType = async (record: any, data: any) => {
    await updateRoomType(record, data)
}

const handleDeleteRoomType = async (record: any) => {
    await deleteRoomType(record)
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
const handleAddAmenity = async (data: any) => {
    await createAmenity(data)
}

const handleEditAmenity = async (record: any, data: any) => {
    await updateAmenity(record, data)
}

const handleDeleteAmenity = async (record: any) => {
    await deleteAmenity(record)
}
</script>
