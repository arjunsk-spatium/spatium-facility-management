<template>
    <div class="max-w-2xl mx-auto">
        <!-- Category Chips -->
        <div class="mb-6">
            <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                Choose a category
            </label>
            <div class="flex flex-wrap gap-2">
                <button v-for="cat in categories" :key="cat.id" type="button"
                    class="category-chip"
                    :class="{
                        'category-chip--active': formState.category_id === cat.id,
                        [`category-chip--${cat.slug}`]: true
                    }"
                    @click="formState.category_id = cat.id">
                    {{ cat.name }}
                </button>
            </div>
        </div>

        <a-form layout="vertical" :model="formState" @finish="handleSubmit">
            <!-- Title -->
            <a-form-item name="title" :rules="[{ required: true, message: 'Give your post a title' }]">
                <a-input v-model:value="formState.title" size="large"
                    placeholder="What's this post about?" class="font-medium" />
            </a-form-item>

            <!-- Description -->
            <a-form-item name="description" :rules="[{ required: true, message: 'Write something...' }]">
                <a-textarea v-model:value="formState.description" :rows="4"
                    placeholder="Share the details with your team..." class="text-base" />
            </a-form-item>

            <!-- Link -->
            <a-form-item name="link">
                <a-input v-model:value="formState.link" size="middle"
                    placeholder="Add a link (optional)">
                    <template #prefix>
                        <LinkOutlined class="text-neutral-400" />
                    </template>
                </a-input>
            </a-form-item>

            <!-- Image Upload -->
            <div class="mb-6">
                <div v-if="!imagePreview"
                    class="upload-zone"
                    :class="{ 'upload-zone--dragover': isDragOver }"
                    @dragenter.prevent="isDragOver = true"
                    @dragleave.prevent="isDragOver = false"
                    @dragover.prevent
                    @drop.prevent="handleDrop">
                    <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileChange">
                    <div class="flex flex-col items-center gap-2 py-8 cursor-pointer" @click="fileInput?.click()">
                        <PictureOutlined class="text-3xl text-neutral-400" />
                        <span class="text-sm text-neutral-500">Click or drag an image here</span>
                        <span class="text-xs text-neutral-400">Optional</span>
                    </div>
                </div>
                <div v-else class="relative rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
                    <img :src="imagePreview" alt="Preview" class="w-full max-h-80 object-cover" />
                    <button type="button"
                        class="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                        @click="clearImage">
                        <CloseOutlined class="text-sm" />
                    </button>
                </div>
            </div>

            <!-- Audience (Optional) -->
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-6">
                <div class="flex items-center gap-2 mb-3">
                    <TeamOutlined class="text-neutral-500" />
                    <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Audience</span>
                    <span class="text-xs text-neutral-400">(Optional — leave empty for everyone)</span>
                </div>

                <div class="space-y-3">
                    <a-form-item class="mb-0" label="Target Companies">
                        <a-select v-model:value="formState.company_ids" mode="multiple"
                            placeholder="Select companies (optional)" :loading="companiesLoading"
                            show-search option-filter-prop="label" size="middle">
                            <a-select-option v-for="company in companies" :key="company.id" :value="company.id"
                                :label="company.name">
                                {{ company.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>

                    <a-form-item class="mb-0" label="Target Facilities">
                        <a-select v-model:value="formState.facility_ids" mode="multiple"
                            placeholder="Select facilities (optional)" :loading="facilitiesLoading"
                            show-search option-filter-prop="label" size="middle">
                            <a-select-option v-for="facility in facilities" :key="facility.id" :value="facility.id"
                                :label="facility.name">
                                {{ facility.name }}
                            </a-select-option>
                        </a-select>
                    </a-form-item>
                </div>
            </div>

            <!-- Event Toggle -->
            <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 overflow-hidden mb-6">
                <button type="button"
                    class="w-full flex items-center justify-between p-4 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    @click="formState.is_event = !formState.is_event">
                    <div class="flex items-center gap-2">
                        <CalendarOutlined class="text-neutral-500" />
                        <span class="text-sm font-medium text-neutral-700 dark:text-neutral-300">This is an event</span>
                    </div>
                    <a-switch :checked="formState.is_event" size="small" />
                </button>

                <div v-show="formState.is_event"
                    class="px-4 pb-4 border-t border-neutral-100 dark:border-neutral-700">
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
                        <a-form-item class="mb-0" label="Event Date">
                            <a-date-picker v-model:value="eventDateValue" class="w-full" format="YYYY-MM-DD" />
                        </a-form-item>
                        <a-form-item class="mb-0" label="Venue">
                            <a-input v-model:value="formState.event.venue" placeholder="Where is it happening?" />
                        </a-form-item>
                        <a-form-item class="mb-0" label="Start Time">
                            <a-time-picker v-model:value="startTimeValue" class="w-full" format="HH:mm" />
                        </a-form-item>
                        <a-form-item class="mb-0" label="End Time">
                            <a-time-picker v-model:value="endTimeValue" class="w-full" format="HH:mm" />
                        </a-form-item>
                    </div>
                </div>
            </div>

            <!-- Allow Likes -->
            <div class="flex items-center justify-between mb-6">
                <div class="flex items-center gap-2">
                    <HeartOutlined class="text-neutral-500" />
                    <span class="text-sm text-neutral-700 dark:text-neutral-300">Allow likes on this post</span>
                </div>
                <a-switch v-model:checked="formState.allow_likes" size="small" />
            </div>

            <!-- Actions -->
            <div class="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                <a-button size="large" @click="handleCancel">Cancel</a-button>
                <a-button type="primary" size="large" html-type="submit" :loading="submitting">
                    {{ submitText }}
                </a-button>
            </div>
        </a-form>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import {
    PictureOutlined,
    CloseOutlined,
    TeamOutlined,
    CalendarOutlined,
    HeartOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue'
import dayjs, { type Dayjs } from 'dayjs'
import { useFeedService, type FeedCategory } from '../../../composables/feedService'
import { useAllFacilityStore } from '../../../stores/allFacility'

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
const allFacilityStore = useAllFacilityStore()
const companyStore = useCompanyStore()

const categories = ref<FeedCategory[]>([])
const categoriesLoading = ref(false)
const companiesLoading = ref(false)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const isDragOver = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const eventDateValue = ref<Dayjs | null>(null)
const startTimeValue = ref<Dayjs | null>(null)
const endTimeValue = ref<Dayjs | null>(null)

const formState = reactive({
    category_id: '',
    title: '',
    description: '',
    link: '',
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
const facilities = computed(() => allFacilityStore.facilities)
const facilitiesLoading = computed(() => allFacilityStore.loading)

const fetchCategories = async () => {
    categoriesLoading.value = true
    try {
        categories.value = await getCategories()
        // Pre-select "General" category by default
        const general = categories.value.find(c => c.slug === 'general')
        if (general && !formState.category_id) {
            formState.category_id = general.id
        }
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
    try {
        await allFacilityStore.fetchAllFacilities({ page_size: 999 })
    } catch (err) {
        console.error('Failed to fetch facilities:', err)
    }
}

const handleFileChange = (e: Event) => {
    const target = e.target as HTMLInputElement
    if (target.files?.[0]) {
        setImage(target.files[0])
    }
}

const handleDrop = (e: DragEvent) => {
    isDragOver.value = false
    if (e.dataTransfer?.files[0]) {
        setImage(e.dataTransfer.files[0])
    }
}

const setImage = (file: File) => {
    imageFile.value = file
    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const clearImage = () => {
    imageFile.value = null
    imagePreview.value = null
    if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = () => {
    // Determine scope_type based on selections
    let scope_type: 'companies' | 'facilities' = 'companies'
    if (formState.company_ids.length > 0) {
        scope_type = 'companies'
    } else if (formState.facility_ids.length > 0) {
        scope_type = 'facilities'
    }

    const payload: any = {
        category_id: formState.category_id,
        title: formState.title,
        description: formState.description,
        scope_type,
        allow_likes: formState.allow_likes,
    }

    if (formState.link) {
        payload.link = formState.link
    }

    if (formState.company_ids.length > 0) {
        payload.company_ids = formState.company_ids
    }
    if (formState.facility_ids.length > 0) {
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

<style scoped>
@reference "../../../assets/styles/main.css";

.category-chip {
    @apply px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200;
    @apply bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700;
    @apply text-neutral-600 dark:text-neutral-400;
    @apply hover:border-neutral-400 hover:dark:border-neutral-500;
}

.category-chip--active {
    @apply ring-2 ring-offset-1 dark:ring-offset-neutral-900;
}

.category-chip--announcement.category-chip--active {
    @apply bg-blue-50 dark:bg-blue-900/30 border-blue-400 text-blue-700 dark:text-blue-300 ring-blue-300;
}

.category-chip--appreciation.category-chip--active {
    @apply bg-amber-50 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300 ring-amber-300;
}

.category-chip--birthday.category-chip--active {
    @apply bg-pink-50 dark:bg-pink-900/30 border-pink-400 text-pink-700 dark:text-pink-300 ring-pink-300;
}

.category-chip--event.category-chip--active {
    @apply bg-orange-50 dark:bg-orange-900/30 border-orange-400 text-orange-700 dark:text-orange-300 ring-orange-300;
}

.category-chip--general.category-chip--active {
    @apply bg-neutral-100 dark:bg-neutral-700 border-neutral-500 text-neutral-800 dark:text-neutral-200 ring-neutral-400;
}

.category-chip--work_anniversary.category-chip--active {
    @apply bg-emerald-50 dark:bg-emerald-900/30 border-emerald-400 text-emerald-700 dark:text-emerald-300 ring-emerald-300;
}

.upload-zone {
    @apply rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 transition-colors;
}

.upload-zone--dragover {
    @apply border-primary-400 bg-primary-50 dark:bg-primary-900/20;
}
</style>
