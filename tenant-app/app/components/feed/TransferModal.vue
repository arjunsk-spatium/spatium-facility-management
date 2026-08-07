<template>
    <a-modal :open="visible" title="Transfer to Facilities" @ok="handleOk" @cancel="handleCancel"
        :confirm-loading="loading" ok-text="Transfer" width="600px">
        <div class="py-4">
            <p class="text-neutral-600 dark:text-neutral-300 mb-4">
                Select the facilities where this post should be visible. If no facilities are selected, the post will be
                visible to all facilities.
            </p>
            <a-form-item label="Facilities">
                <a-select v-model:value="selectedFacilities" mode="multiple" placeholder="Select facilities (optional - leave empty for all)"
                    :loading="facilitiesLoading" show-search option-filter-prop="label">
                    <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id"
                        :label="facility.name">
                        {{ facility.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = defineProps<{
    visible: boolean
    postId: string | null
}>()

const emit = defineEmits<{
    ok: [postId: string, facilityIds: string[]]
    cancel: []
}>()

const facilityStore = useFacilityStore()
const selectedFacilities = ref<string[]>([])
const loading = ref(false)
const facilitiesLoading = ref(false)

const facilities = computed(() => facilityStore.facilities)

watch(() => props.visible, (isVisible) => {
    if (isVisible) {
        selectedFacilities.value = []
        fetchFacilities()
    }
})

const fetchFacilities = async () => {
    facilitiesLoading.value = true
    try {
        await facilityStore.fetchAllFacilities()
    } catch (err) {
        console.error('Failed to fetch facilities:', err)
    } finally {
        facilitiesLoading.value = false
    }
}

const handleOk = () => {
    if (props.postId) {
        emit('ok', props.postId, selectedFacilities.value)
    }
}

const handleCancel = () => {
    emit('cancel')
}
</script>
