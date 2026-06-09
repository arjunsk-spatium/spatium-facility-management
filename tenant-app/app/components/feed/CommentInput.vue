<template>
    <div class="flex gap-3">
        <a-avatar v-if="currentUser?.profile_photo" :src="currentUser.profile_photo" size="default" />
        <a-avatar v-else size="default">{{ getInitials(currentUser?.employee_name) }}</a-avatar>
        <div class="flex-1">
            <a-textarea v-model:value="commentText" :placeholder="placeholder" rows="2" />
            <div class="flex justify-end gap-2 mt-2">
                <a-button size="small" @click="handleCancel">Cancel</a-button>
                <a-button type="primary" size="small" :loading="loading" :disabled="!commentText.trim()"
                    @click="handleSubmit">
                    {{ submitText }}
                </a-button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
    placeholder?: string
    submitText?: string
    loading?: boolean
}>()

const emit = defineEmits<{
    submit: [text: string]
    cancel: []
}>()

const authStore = useAuthStore()
const commentText = ref('')

const currentUser = computed(() => ({
    employee_name: authStore.userFullName,
    profile_photo: authStore.user?.profile_photo || null,
}))

const getInitials = (name?: string) => {
    if (!name) return '?'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

const handleSubmit = () => {
    if (!commentText.value.trim()) return
    emit('submit', commentText.value.trim())
    commentText.value = ''
}

const handleCancel = () => {
    commentText.value = ''
    emit('cancel')
}
</script>
