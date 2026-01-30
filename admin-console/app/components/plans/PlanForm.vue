<template>
    <a-form layout="vertical" :model="formState" @finish="handleSubmit">
        <a-card :title="isEditing ? 'Edit Plan' : 'Create Plan'" :loading="loading">
            <template #extra>
                <a-tag :color="formState.is_active ? 'green' : 'red'" v-if="isEditing">
                    {{ formState.is_active ? 'Active' : 'Inactive' }}
                </a-tag>
            </template>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Plan Name" name="name"
                        :rules="[{ required: true, message: 'Please enter plan name' }]">
                        <a-input v-model:value="formState.name" placeholder="e.g. Pro Plan" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Plan Code" name="code"
                        :rules="[{ required: true, message: 'Please enter plan code' }]">
                        <a-input v-model:value="formState.code" placeholder="e.g. Pro" :disabled="isEditing" />
                    </a-form-item>
                </a-col>
            </a-row>

            <a-form-item label="Description" name="description">
                <a-textarea v-model:value="formState.description" rows="3"
                    placeholder="Brief description of the plan" />
            </a-form-item>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Price" name="price"
                        :rules="[{ required: !formState.is_custom, message: 'Please enter price' }]">
                        <a-input-number v-model:value="formState.price" :min="0" class="w-full"
                            :disabled="formState.is_custom"
                            :formatter="(value: any) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
                            :parser="(value: any) => value.replace(/\₹\s?|(,*)/g, '')" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Billing Cycle" name="billing_cycle">
                        <a-select v-model:value="formState.billing_cycle">
                            <a-select-option value="monthly">Monthly</a-select-option>
                            <a-select-option value="yearly">Yearly</a-select-option>
                        </a-select>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-row :gutter="16">
                <a-col :span="12">
                    <a-form-item label="Max Users" name="max_users">
                        <a-input-number v-model:value="formState.max_users" :min="0" class="w-full"
                            help="0 for unlimited" />
                    </a-form-item>
                </a-col>
                <a-col :span="12">
                    <a-form-item label="Options">
                        <div class="flex flex-col gap-2">
                            <a-checkbox v-model:checked="formState.is_custom">Custom Pricing</a-checkbox>
                            <a-checkbox v-model:checked="formState.is_active">Active</a-checkbox>
                        </div>
                    </a-form-item>
                </a-col>
            </a-row>

            <a-divider orientation="left">Modules</a-divider>
            <a-form-item name="modules">
                <div v-if="modulesLoading" class="text-center py-4">
                    <a-spin />
                </div>
                <a-checkbox-group v-else v-model:value="formState.modules" class="w-full">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="mod in modules" :key="mod.id"
                            class="border p-3 rounded-lg flex items-start gap-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <a-checkbox :value="mod.key" class="mt-1" />
                            <div>
                                <div class="font-medium">{{ mod.name }}</div>
                                <div class="text-xs text-gray-500">{{ mod.description }}</div>
                            </div>
                        </div>
                    </div>
                </a-checkbox-group>
            </a-form-item>

            <a-divider orientation="left">Features</a-divider>
            <a-form-item label="Plan Features">
                <div class="space-y-2">
                    <div v-for="(feature, index) in formState.features" :key="index" class="flex gap-2">
                        <a-input v-model:value="formState.features[index]" placeholder="Feature description" />
                        <a-button type="text" danger @click="removeFeature(index)">
                            <template #icon>
                                <DeleteOutlined />
                            </template>
                        </a-button>
                    </div>
                    <a-button type="dashed" @click="addFeature" block>
                        <template #icon>
                            <PlusOutlined />
                        </template>
                        Add Feature
                    </a-button>
                </div>
            </a-form-item>

            <div class="flex justify-end gap-4 mt-8">
                <a-button @click="$emit('cancel')">Cancel</a-button>
                <a-button type="primary" html-type="submit" :loading="submitting">
                    {{ isEditing ? 'Update Plan' : 'Create Plan' }}
                </a-button>
            </div>
        </a-card>
    </a-form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons-vue';
import { useModuleRegistry } from '../../composables/useModuleRegistry';

const props = defineProps<{
    initialValues?: any;
    isEditing?: boolean;
    submitting?: boolean;
    loading?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const { getRegistry } = useModuleRegistry();
const modules = ref<any[]>([]);
const modulesLoading = ref(false);

const formState = reactive({
    code: '',
    name: '',
    description: '',
    price: 0,
    billing_cycle: 'monthly',
    max_users: 0,
    is_custom: false,
    is_active: true,
    modules: [] as string[],
    features: [] as string[]
});

watch(() => props.initialValues, (newVal) => {
    if (newVal) {
        Object.assign(formState, {
            ...newVal,
            price: Number(newVal.price),
            features: newVal.features || [],
            modules: newVal.modules || [] // Assuming backend returns array of module keys
        });
    }
}, { immediate: true });

onMounted(async () => {
    modulesLoading.value = true;
    try {
        const res = await getRegistry({ page_size: 100 });
        if (res.success) {
            modules.value = res.data.results;
        }
    } catch (e) {
        console.error('Failed to load modules', e);
    } finally {
        modulesLoading.value = false;
    }
});

const addFeature = () => {
    formState.features.push('');
};

const removeFeature = (index: number) => {
    formState.features.splice(index, 1);
};

const handleSubmit = () => {
    emit('submit', {
        ...formState,
        features: formState.features.filter(f => f.trim())
    });
};
</script>
