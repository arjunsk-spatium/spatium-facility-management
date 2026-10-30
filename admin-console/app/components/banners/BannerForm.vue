<template>
    <div class="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
        <!-- Form Fields Column -->
        <div class="xl:col-span-7">
            <a-form layout="vertical" :model="formState" @finish="handleSubmit">
                <!-- Title -->
                <a-form-item label="Title" name="title" :rules="[{ required: true, message: 'Please enter a title' }]">
                    <a-input v-model:value="formState.title" size="large" placeholder="e.g. Platform-wide Maintenance" />
                </a-form-item>

                <!-- Description -->
                <a-form-item label="Description" name="description" :rules="[{ required: true, message: 'Please enter a description' }]">
                    <a-textarea v-model:value="formState.description" :rows="4" placeholder="Describe the banner message" />
                </a-form-item>

                <!-- Category -->
                <a-form-item label="Category" name="category" :rules="[{ required: true, message: 'Please select a category' }]">
                    <a-select v-model:value="formState.category" placeholder="Select category" size="large">
                        <a-select-option v-for="cat in categories" :key="cat.value" :value="cat.value">
                            {{ cat.label }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <!-- Link -->
                <a-form-item label="Link (Optional)" name="link">
                    <a-input v-model:value="formState.link" placeholder="https://example.com" size="middle">
                        <template #prefix>
                            <LinkOutlined class="text-neutral-400" />
                        </template>
                    </a-input>
                </a-form-item>

                <!-- Button Text (Link Title) -->
                <a-form-item label="Button Text (Link Title)" name="link_title"
                    extra="Label shown on the banner action button (e.g. Book Now, Learn More)">
                    <a-input v-model:value="formState.link_title" placeholder="e.g. Book Now" size="middle" :maxlength="50" />
                </a-form-item>

                <!-- Image Upload -->
                <div class="mb-6">
                    <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Banner Image <span class="text-xs font-normal text-neutral-500 dark:text-neutral-400">(Aspect ratio 16:9)</span>
                    </label>
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
                            <span class="text-xs text-neutral-400">Recommended aspect ratio: 16:9 (e.g. 1920×1080) &middot; Optional for create</span>
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
                    <p class="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">Recommended aspect ratio: 16:9 (e.g. 1920×1080)</p>
                </div>

                <!-- Toggles -->
                <div class="rounded-xl border border-neutral-200 dark:border-neutral-700 p-4 mb-6 space-y-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Active</div>
                            <div class="text-xs text-neutral-500">Show this banner to users</div>
                        </div>
                        <a-switch v-model:checked="formState.is_active" size="small" />
                    </div>
                    <div class="flex items-center justify-between">
                        <div>
                            <div class="text-sm font-medium text-neutral-700 dark:text-neutral-300">Global</div>
                            <div class="text-xs text-neutral-500">Show across all tenants</div>
                        </div>
                        <a-switch v-model:checked="formState.is_global" size="small" />
                    </div>
                </div>

                <!-- Tenant Selection -->
                <a-form-item v-if="!formState.is_global" label="Tenants" name="tenant_ids"
                    :rules="[{ required: true, message: 'Please select at least one tenant', type: 'array' }]">
                    <a-select v-model:value="formState.tenant_ids" mode="multiple" placeholder="Select tenants"
                        :loading="tenantsLoading" show-search option-filter-prop="label" size="large">
                        <a-select-option v-for="tenant in tenants" :key="tenant.id" :value="tenant.id" :label="tenant.name">
                            {{ tenant.name }}
                        </a-select-option>
                    </a-select>
                </a-form-item>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-neutral-200 dark:border-neutral-700">
                    <a-button size="large" @click="handleCancel">Cancel</a-button>
                    <a-button type="primary" size="large" html-type="submit" :loading="submitting">
                        {{ submitText }}
                    </a-button>
                </div>
            </a-form>
        </div>

        <!-- Live Mobile Preview Column -->
        <div class="xl:col-span-5 flex flex-col items-center xl:sticky xl:top-6 bg-neutral-50/70 dark:bg-neutral-800/40 rounded-2xl p-4 border border-neutral-200/70 dark:border-neutral-700/60">
            <div class="w-full mb-3 text-center">
                <h3 class="text-sm font-bold text-neutral-800 dark:text-neutral-200">Mobile Live Preview</h3>
                <p class="text-xs text-neutral-500 mt-0.5">Real-time preview of how the banner appears in Spatium</p>
            </div>
            <BannerMobilePreview
                :title="formState.title"
                :description="formState.description"
                :image-url="imagePreview"
                :link="formState.link"
                :link-title="formState.link_title"
                :category="formState.category"
                :tenant-name="firstSelectedTenantName"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import {
    PictureOutlined,
    CloseOutlined,
    LinkOutlined,
} from '@ant-design/icons-vue'
import BannerMobilePreview from './BannerMobilePreview.vue'

interface BannerFormValues {
    title: string
    description: string
    category: string
    link: string
    link_title?: string | null
    is_active: boolean
    is_global: boolean
    image_url?: string | null
    tenant?: string | string[] | null
}

const props = defineProps<{
    submitText?: string
    submitting?: boolean
    loading?: boolean
    isEditing?: boolean
    initialValues?: BannerFormValues | null
}>()

const emit = defineEmits<{
    submit: [payload: any]
    cancel: []
}>()

const categories = [
    { label: 'Maintenance', value: 'maintenance' },
    { label: 'Announcement', value: 'announcement' },
    { label: 'Promotion', value: 'promotion' },
    { label: 'General', value: 'general' },
]

const tenantStore = useTenantStore()

const fileInput = ref<HTMLInputElement | null>(null)
const imagePreview = ref<string | null>(null)
const imageFile = ref<File | null>(null)
const isDragOver = ref(false)
const imageChanged = ref(false)

const tenants = computed(() => tenantStore.tenants)
const tenantsLoading = computed(() => tenantStore.loading)

const formState = reactive({
    title: '',
    description: '',
    category: '',
    link: '',
    link_title: '',
    is_active: true,
    is_global: true,
    tenant_ids: [] as string[],
})

const firstSelectedTenantName = computed(() => {
    if (formState.is_global) return 'Spatium Commercio'
    if (formState.tenant_ids.length > 0) {
        const found = tenants.value?.find(t => t.id === formState.tenant_ids[0])
        return found?.name || 'Spatium Commercio'
    }
    return 'Spatium Commercio'
})

const setInitialValues = () => {
    const values = props.initialValues
    if (!values) return

    formState.title = values.title || ''
    formState.description = values.description || ''
    formState.category = values.category || ''
    formState.link = values.link || ''
    formState.link_title = values.link_title || ''
    formState.is_active = values.is_active !== undefined ? values.is_active : true
    formState.is_global = values.is_global !== undefined ? values.is_global : true

    if (values.tenant) {
        formState.tenant_ids = Array.isArray(values.tenant) ? values.tenant : [values.tenant]
    } else {
        formState.tenant_ids = []
    }

    if (values.image_url) {
        imagePreview.value = values.image_url
    }
}

watch(() => props.initialValues, setInitialValues, { immediate: true })

watch(() => formState.is_global, (isGlobal) => {
    if (isGlobal) {
        formState.tenant_ids = []
    }
})

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
    imageChanged.value = true
    const reader = new FileReader()
    reader.onload = (e) => {
        imagePreview.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
}

const clearImage = () => {
    imageFile.value = null
    imagePreview.value = null
    imageChanged.value = true
    if (fileInput.value) fileInput.value.value = ''
}

const handleSubmit = () => {
    const payload: any = {
        title: formState.title,
        description: formState.description,
        category: formState.category,
        is_active: formState.is_active,
        is_global: formState.is_global,
    }

    if (formState.link) {
        payload.link = formState.link
    }

    if (formState.link_title) {
        payload.link_title = formState.link_title
    }

    if (props.isEditing) {
        if (imageChanged.value) {
            payload.image = imageFile.value
        }
    } else {
        if (imageFile.value) {
            payload.image = imageFile.value
        }
    }

    if (!formState.is_global && formState.tenant_ids.length > 0) {
        payload.tenant = formState.tenant_ids
    }

    emit('submit', payload)
}

const handleCancel = () => {
    emit('cancel')
}

const fetchTenants = async () => {
    try {
        await tenantStore.fetchTenants()
    } catch (err) {
        console.error('Failed to fetch tenants:', err)
    }
}

onMounted(() => {
    setInitialValues()
    fetchTenants()
})
</script>

<style scoped>
@reference "../../assets/styles/main.css";

.upload-zone {
    @apply rounded-xl border-2 border-dashed border-neutral-300 dark:border-neutral-600 transition-colors;
}

.upload-zone--dragover {
    @apply border-primary-400 bg-primary-50 dark:bg-primary-900/20;
}
</style>
