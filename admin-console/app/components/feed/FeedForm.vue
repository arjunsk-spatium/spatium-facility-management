<template>
    <a-form layout="vertical" :model="formState" @finish="handleSubmit">
        <a-card :title="isEditing ? 'Edit Post' : 'Create Post'" :loading="loading">
            <a-form-item label="Category" name="category_id"
                :rules="[{ required: true, message: 'Please select a category' }]">
                <a-select v-model:value="formState.category_id" placeholder="Select category" :loading="categoriesLoading">
                    <a-select-option v-for="cat in categories" :key="cat.id" :value="cat.id">
                        {{ cat.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Title" name="title"
                :rules="[{ required: true, message: 'Please enter a title' }]">
                <a-input v-model:value="formState.title" placeholder="Enter post title" />
            </a-form-item>

            <a-form-item label="Description" name="description"
                :rules="[{ required: true, message: 'Please enter a description' }]">
                <a-textarea v-model:value="formState.description" rows="4" placeholder="Enter post description" />
            </a-form-item>

            <a-form-item label="Scope" name="scope_type"
                :rules="[{ required: true, message: 'Please select a scope' }]">
                <a-radio-group v-model:value="formState.scope_type">
                    <a-radio value="all_tenants">All Tenants</a-radio>
                    <a-radio value="selected_tenants">Selected Tenants</a-radio>
                </a-radio-group>
            </a-form-item>

            <a-form-item v-if="formState.scope_type === 'selected_tenants'" label="Select Tenants" name="tenant_ids"
                :rules="[{ required: formState.scope_type === 'selected_tenants', message: 'Please select at least one tenant' }]">
                <a-select v-model:value="formState.tenant_ids" mode="multiple" placeholder="Select tenants"
                    :loading="tenantsLoading" show-search option-filter-prop="label">
                    <a-select-option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id"
                        :label="tenant.name">
                        {{ tenant.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item label="Post Image">
                <a-upload :before-upload="beforeUpload" :show-upload-list="false" accept="image/*">
                    <a-button>
                        <template #icon>
                            <UploadOutlined />
                        </template>
                        {{ imagePreview ? 'Change Image' : 'Upload Image' }}
                    </a-button>
                </a-upload>
                <div v-if="imagePreview" class="mt-3">
                    <img :src="imagePreview" alt="Preview" class="max-h-48 rounded-lg border" />
                    <a-button type="link" danger size="small" @click="clearImage" class="mt-1">
                        Remove Image
                    </a-button>
                </div>
            </a-form-item>

            <a-form-item>
                <a-checkbox v-model:checked="formState.is_event">This is an event</a-checkbox>
            </a-form-item>

            <template v-if="formState.is_event">
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Event Date" name="event_date"
                            :rules="[{ required: formState.is_event, message: 'Please select event date' }]">
                            <a-date-picker v-model:value="eventDateValue" class="w-full" format="YYYY-MM-DD" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="Venue" name="venue"
                            :rules="[{ required: formState.is_event, message: 'Please enter venue' }]">
                            <a-input v-model:value="formState.event.venue" placeholder="Event venue" />
                        </a-form-item>
                    </a-col>
                </a-row>
                <a-row :gutter="16">
                    <a-col :span="12">
                        <a-form-item label="Start Time" name="start_time"
                            :rules="[{ required: formState.is_event, message: 'Please select start time' }]">
                            <a-time-picker v-model:value="startTimeValue" class="w-full" format="HH:mm:ss" />
                        </a-form-item>
                    </a-col>
                    <a-col :span="12">
                        <a-form-item label="End Time" name="end_time"
                            :rules="[{ required: formState.is_event, message: 'Please select end time' }]">
                            <a-time-picker v-model:value="endTimeValue" class="w-full" format="HH:mm:ss" />
                        </a-form-item>
                    </a-col>
                </a-row>
            </template>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item>
                        <a-checkbox v-model:checked="formState.allow_likes">Allow Likes</a-checkbox>
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Published At">
                        <a-date-picker v-model:value="publishedAtValue" class="w-full" show-time
                            format="YYYY-MM-DD HH:mm:ss" placeholder="Optional - defaults to now" />
                    </a-form-item>
                </a-col>
            </a-row>

            <div class="flex justify-end gap-3 pt-4 border-t">
                <a-button @click="handleCancel">Cancel</a-button>
                <a-button type="primary" html-type="submit" :loading="submitting">
                    {{ submitText }}
                </a-button>
            </div>
        </a-card>
    </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useFeedService, type FeedCategory } from '../../composables/feedService'

const props = defineProps<{
    submitText?: string
    submitting?: boolean
    loading?: boolean
    isEditing?: boolean
}>()

const emit = defineEmits<{
    submit: [payload: any]
    cancel: []
}>()

const { getCategories } = useFeedService()
const tenantStore = useTenantStore()

const categories = ref<FeedCategory[]>([])
const categoriesLoading = ref(false)
const tenantsLoading = ref(false)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const eventDateValue = ref<Dayjs | null>(null)
const startTimeValue = ref<Dayjs | null>(null)
const endTimeValue = ref<Dayjs | null>(null)
const publishedAtValue = ref<Dayjs | null>(null)

const formState = reactive({
    category_id: '',
    title: '',
    description: '',
    scope_type: 'all_tenants' as 'all_tenants' | 'selected_tenants',
    tenant_ids: [] as string[],
    allow_likes: true,
    is_event: false,
    event: {
        event_date: '',
        start_time: '',
        end_time: '',
        venue: '',
    },
    published_at: '',
})

const tenants = computed(() => tenantStore.tenants)

const fetchCategories = async () => {
    categoriesLoading.value = true
    try {
        categories.value = await getCategories()
    } catch (err) {
        console.error('Failed to fetch categories:', err)
    } finally {
        categoriesLoading.value = false
    }
}

const fetchTenants = async () => {
    tenantsLoading.value = true
    try {
        await tenantStore.fetchTenants()
    } catch (err) {
        console.error('Failed to fetch tenants:', err)
    } finally {
        tenantsLoading.value = false
    }
}

const beforeUpload = (file: File) => {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
    return false
}

const clearImage = () => {
    imageFile.value = null
    imagePreview.value = null
}

const handleSubmit = () => {
    const payload: any = {
        category_id: formState.category_id,
        title: formState.title,
        description: formState.description,
        scope_type: formState.scope_type,
        allow_likes: formState.allow_likes,
    }

    if (formState.scope_type === 'selected_tenants' && formState.tenant_ids.length > 0) {
        payload.tenant_ids = formState.tenant_ids
    }

    if (imageFile.value) {
        payload.image = imageFile.value
    }

    if (formState.is_event) {
        payload.event = {
            event_date: eventDateValue.value ? eventDateValue.value.format('YYYY-MM-DD') : '',
            start_time: startTimeValue.value ? startTimeValue.value.format('HH:mm:ss') : '',
            end_time: endTimeValue.value ? endTimeValue.value.format('HH:mm:ss') : '',
            venue: formState.event.venue,
        }
    }

    if (publishedAtValue.value) {
        payload.published_at = publishedAtValue.value.toISOString()
    }

    emit('submit', payload)
}

const handleCancel = () => {
    emit('cancel')
}

onMounted(() => {
    fetchCategories()
    fetchTenants()
})
</script>
