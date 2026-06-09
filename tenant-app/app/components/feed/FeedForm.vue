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
                    <a-radio value="companies">Companies</a-radio>
                    <a-radio value="facilities">Facilities</a-radio>
                </a-radio-group>
            </a-form-item>

            <a-form-item v-if="formState.scope_type === 'companies'" label="Select Companies (optional)" name="company_ids">
                <a-select v-model:value="formState.company_ids" mode="multiple" placeholder="Leave empty for all companies"
                    :loading="companiesLoading" show-search option-filter-prop="label">
                    <a-select-option v-for="company in companies" :key="company.id" :value="company.id"
                        :label="company.name">
                        {{ company.name }}
                    </a-select-option>
                </a-select>
            </a-form-item>

            <a-form-item v-if="formState.scope_type === 'facilities'" label="Select Facilities (optional)" name="facility_ids">
                <a-select v-model:value="formState.facility_ids" mode="multiple" placeholder="Leave empty for all facilities"
                    :loading="facilitiesLoading" show-search option-filter-prop="label">
                    <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id"
                        :label="facility.name">
                        {{ facility.name }}
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

            <a-form-item>
                <a-checkbox v-model:checked="formState.allow_likes">Allow Likes</a-checkbox>
            </a-form-item>

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
import { useFeedService, type FeedCategory } from '../../../composables/feedService'

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
const companyStore = useCompanyStore()
const facilityStore = useFacilityStore()

const categories = ref<FeedCategory[]>([])
const categoriesLoading = ref(false)
const companiesLoading = ref(false)
const facilitiesLoading = ref(false)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)

const eventDateValue = ref<Dayjs | null>(null)
const startTimeValue = ref<Dayjs | null>(null)
const endTimeValue = ref<Dayjs | null>(null)

const formState = reactive({
    category_id: '',
    title: '',
    description: '',
    scope_type: 'companies' as 'companies' | 'facilities',
    company_ids: [] as string[],
    facility_ids: [] as string[],
    allow_likes: true,
    is_event: false,
    event: {
        event_date: '',
        start_time: '',
        end_time: '',
        venue: '',
    },
})

const companies = computed(() => companyStore.companies)
const facilities = computed(() => facilityStore.facilities)

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

const fetchCompanies = async () => {
    companiesLoading.value = true
    try {
        await companyStore.fetchCompanies()
    } catch (err) {
        console.error('Failed to fetch companies:', err)
    } finally {
        companiesLoading.value = false
    }
}

const fetchFacilities = async () => {
    facilitiesLoading.value = true
    try {
        await facilityStore.fetchFacilities()
    } catch (err) {
        console.error('Failed to fetch facilities:', err)
    } finally {
        facilitiesLoading.value = false
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

    if (formState.scope_type === 'companies' && formState.company_ids.length > 0) {
        payload.company_ids = formState.company_ids
    }
    if (formState.scope_type === 'facilities' && formState.facility_ids.length > 0) {
        payload.facility_ids = formState.facility_ids
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

    emit('submit', payload)
}

const handleCancel = () => {
    emit('cancel')
}

onMounted(() => {
    fetchCategories()
    fetchCompanies()
    fetchFacilities()
})
</script>
