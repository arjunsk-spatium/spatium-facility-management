<template>
    <a-modal :open="visible"
        :title="`Manage Facilities - ${userName}`"
        width="600px"
        style="top: 20px;"
        :destroy-on-close="true"
        @cancel="closeModal"
        @update:open="handleUpdateOpen">
        <template #footer>
            <a-button @click="closeModal">Cancel</a-button>
            <a-button type="primary" :loading="saving" @click="saveFacilities">
                Save Changes
            </a-button>
        </template>

        <div v-if="props.user" class="mt-4 space-y-4">
            <a-checkbox :checked="allFacilities" @change="toggleAllFacilities">
                All facilities
            </a-checkbox>

            <div v-if="!allFacilities" class="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div v-if="loading" class="flex justify-center py-8">
                    <a-spin />
                </div>
                <div v-else-if="facilities.length === 0" class="text-center py-8 text-gray-500">
                    <p>No facilities available.</p>
                    <a-button type="link" @click="navigateTo('/facilities/create')">
                        Add a facility
                    </a-button>
                </div>
                <div v-else class="max-h-80 overflow-y-auto pr-1 space-y-2">
                    <a-checkbox v-for="facility in facilities"
                        :key="facility.id"
                        :checked="selectedFacilityIds.has(facility.id)"
                        @change="toggleFacility(facility.id)">
                        {{ facility.name }} <span v-if="facility.city_details" class="text-gray-500">- {{ facility.city_details.name }}</span>
                    </a-checkbox>
                </div>
            </div>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useUserService, type User, type OperationalStaff } from '../composables/userService'
import { useFacilityService, type Facility } from '../composables/facilityService'

const props = defineProps<{
    user: User | OperationalStaff | any
    open: boolean
}>()

const emit = defineEmits<{
    'update:open': [value: boolean]
    'saved': [payload?: { facility_ids: string[]; is_all_facilities: boolean }]
}>()

const userName = computed(() => {
    if (!props.user) return ''
    return props.user.name || props.user.full_name || props.user.username || ''
})

const { getUserFacilities, assignUserFacilities } = useUserService()
const facilityService = useFacilityService()

const visible = computed({
    get: () => props.open,
    set: (val) => emit('update:open', val)
})

const facilities = ref<Facility[]>([])
const selectedFacilityIds = ref<Set<string>>(new Set())
const allFacilities = ref(false)
const saving = ref(false)
const loading = ref(false)

const handleUpdateOpen = (val: boolean) => {
    visible.value = val
}

const closeModal = () => {
    visible.value = false
}

const loadData = async () => {
    if (!props.user) return
    loading.value = true
    try {
        const [allFacilitiesData, userFacilitiesData] = await Promise.all([
            facilityService.getAllFacilities({ page_size: 999 }),
            getUserFacilities(props.user.id)
        ])
        facilities.value = allFacilitiesData.facilities || []
        allFacilities.value = userFacilitiesData.is_all_facilities
        selectedFacilityIds.value = new Set(userFacilitiesData.facility_ids || [])
    } catch (error) {
        message.error('Failed to load facility data')
    } finally {
        loading.value = false
    }
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        loadData()
    }
}, { immediate: true })

const toggleAllFacilities = () => {
    allFacilities.value = !allFacilities.value
}

const toggleFacility = (facilityId: string) => {
    if (selectedFacilityIds.value.has(facilityId)) {
        selectedFacilityIds.value.delete(facilityId)
    } else {
        selectedFacilityIds.value.add(facilityId)
    }
}

const saveFacilities = async () => {
    if (!props.user) return
    saving.value = true
    try {
        const payload = {
            facility_ids: Array.from(selectedFacilityIds.value),
            is_all_facilities: allFacilities.value
        }
        await assignUserFacilities(props.user.id, payload)
        message.success('Facilities updated successfully')
        emit('saved', payload)
        closeModal()
    } catch (error) {
        message.error('Failed to update facilities')
    } finally {
        saving.value = false
    }
}
</script>
