<template>
    <a-modal
        :open="open"
        :title="`Worker Capacity — ${userName || 'Worker'}`"
        width="520px"
        :confirm-loading="saving"
        @ok="handleSave"
        @cancel="handleClose"
    >
        <div class="space-y-4 py-2" v-if="!loading">
            <a-alert
                type="info"
                show-icon
                message="Capacity throttle prevents worker overload. When exceeded, ScopeLadder considers next candidates and manual assigns show a warning."
                class="mb-4"
            />

            <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div>
                    <div class="font-medium text-sm text-gray-900 dark:text-white">Capacity Limits</div>
                    <div class="text-xs text-gray-500">
                        {{ hasLimit ? 'Custom capacity limit active' : 'Unlimited (no throttling active)' }}
                    </div>
                </div>
                <a-switch
                    :checked="hasLimit"
                    @change="handleLimitToggle"
                    checked-children="Enabled"
                    un-checked-children="Unlimited"
                />
            </div>

            <div v-if="hasLimit" class="space-y-4 pt-2">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Throttle (Max Open Tickets) *
                    </label>
                    <a-input-number
                        v-model:value="form.throttle"
                        :min="1"
                        :max="100"
                        class="w-full"
                        placeholder="e.g. 6"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Maximum number of active (assigned / acknowledged / in progress) tickets.
                    </p>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Effort Capacity (Minutes)
                    </label>
                    <a-input-number
                        v-model:value="form.effort_capacity_min"
                        :min="1"
                        :max="10080"
                        class="w-full"
                        placeholder="Optional, e.g. 480 for 8 hours"
                    />
                    <p class="text-xs text-gray-500 mt-1">
                        Total estimated effort budget in minutes. Leave empty if unconstrained.
                    </p>
                </div>
            </div>
        </div>
        <div v-else class="py-12 flex justify-center">
            <a-spin />
        </div>

        <template #footer>
            <div class="flex justify-between items-center">
                <div>
                    <a-button
                        v-if="hasExistingCapacity"
                        type="link"
                        danger
                        size="small"
                        :loading="deleting"
                        @click="handleRemoveLimit"
                    >
                        Remove Limit
                    </a-button>
                </div>
                <div class="flex gap-2">
                    <a-button @click="handleClose">Cancel</a-button>
                    <a-button type="primary" :loading="saving" @click="handleSave">
                        Save Capacity
                    </a-button>
                </div>
            </div>
        </template>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { useHelpdeskService } from '../../../composables/helpdeskService'

const props = defineProps<{
    open: boolean
    userId: string
    userName?: string
}>()

const emit = defineEmits<{
    (e: 'update:open', val: boolean): void
    (e: 'saved'): void
}>()

const helpdeskService = useHelpdeskService()

const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const hasLimit = ref(false)
const hasExistingCapacity = ref(false)

const form = ref<{
    throttle: number
    effort_capacity_min: number | null
}>({
    throttle: 6,
    effort_capacity_min: null
})

const loadCapacity = async () => {
    if (!props.userId) return
    loading.value = true
    try {
        const capacity = await helpdeskService.getStaffCapacity(props.userId)
        if (capacity) {
            hasLimit.value = true
            hasExistingCapacity.value = true
            form.value = {
                throttle: capacity.throttle ?? 6,
                effort_capacity_min: capacity.effort_capacity_min ?? null
            }
        } else {
            hasLimit.value = false
            hasExistingCapacity.value = false
            form.value = {
                throttle: 6,
                effort_capacity_min: null
            }
        }
    } catch (err: any) {
        message.error(err.message || 'Failed to load worker capacity')
    } finally {
        loading.value = false
    }
}

const handleLimitToggle = (checked: boolean) => {
    hasLimit.value = checked
    if (checked && !form.value.throttle) {
        form.value.throttle = 6
    }
}

const handleSave = async () => {
    if (!hasLimit.value) {
        if (hasExistingCapacity.value) {
            await handleRemoveLimit()
        } else {
            handleClose()
        }
        return
    }

    if (!form.value.throttle || form.value.throttle < 1) {
        message.warning('Throttle limit must be at least 1')
        return
    }

    saving.value = true
    try {
        await helpdeskService.setStaffCapacity(props.userId, {
            throttle: form.value.throttle,
            effort_capacity_min: form.value.effort_capacity_min || null
        })
        message.success('Worker capacity updated successfully')
        emit('saved')
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to save capacity')
    } finally {
        saving.value = false
    }
}

const handleRemoveLimit = async () => {
    deleting.value = true
    try {
        await helpdeskService.deleteStaffCapacity(props.userId)
        message.success('Worker capacity limit removed (now unlimited)')
        emit('saved')
        handleClose()
    } catch (err: any) {
        message.error(err.message || 'Failed to remove capacity limit')
    } finally {
        deleting.value = false
    }
}

const handleClose = () => {
    emit('update:open', false)
}

watch(() => props.open, (isOpen) => {
    if (isOpen) {
        loadCapacity()
    }
})
</script>
