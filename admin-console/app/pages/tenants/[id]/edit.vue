<template>
    <div class="space-y-12 pb-20">
        <div class="flex items-center gap-4 border-b border-gray-200 pb-6 dark:border-gray-700">
            <NuxtLink :to="`/tenants`">
                <a-button type="text">
                    <ArrowLeftOutlined /> Back
                </a-button>
            </NuxtLink>
            <div>
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Edit Tenant</h1>
                <p class="text-gray-500 text-sm mt-1" v-if="tenant">Manage settings for {{ tenant.name }}</p>
            </div>
        </div>

        <div v-if="loading && !tenant" class="flex justify-center p-12">
            <a-spin size="large" />
        </div>

        <div v-else class="max-w-4xl mx-auto space-y-16">
            <!-- Section 1: Basic Info -->
            <section>
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Basic Information</h2>
                    <p class="text-gray-500 text-sm">Core tenant details and status.</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <a-form :model="basicForm" layout="vertical" @finish="updateBasicInfo">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a-form-item label="Tenant Name" name="name"
                                :rules="[{ required: true, message: 'Please enter tenant name' }]">
                                <a-input v-model:value="basicForm.name" size="large" />
                            </a-form-item>

                            <a-form-item label="Domain" name="domain">
                                <a-input v-model:value="basicForm.domain" size="large" disabled
                                    addon-after=".nexspace.app" />
                            </a-form-item>

                            <a-form-item label="Status" name="status">
                                <a-select v-model:value="basicForm.status" size="large">
                                    <a-select-option value="active">Active</a-select-option>
                                    <a-select-option value="trial">Trial</a-select-option>
                                    <a-select-option value="suspended">Suspended</a-select-option>
                                    <a-select-option value="inactive">Inactive</a-select-option>
                                </a-select>
                            </a-form-item>
                        </div>
                        <div class="flex justify-end mt-4">
                            <a-button type="primary" html-type="submit" :loading="loadingBasic">Update Basic
                                Info</a-button>
                        </div>
                    </a-form>
                </div>
            </section>

            <a-divider />

            <!-- Section 2: Subscription -->
            <section>
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Subscription Plan</h2>
                    <p class="text-gray-500 text-sm">Manage plan, billing cycle, and limits.</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <a-form :model="subscriptionForm" layout="vertical" @finish="updateSubscription">

                        <div class="mb-10">
                            <a-radio-group v-model:value="subscriptionForm.plan" class="w-full">
                                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div v-for="plan in plans" :key="plan.id"
                                        class="border rounded-xl p-5 cursor-pointer hover:border-primary-500 transition-all relative overflow-hidden bg-white dark:bg-gray-800"
                                        :class="{ 'border-primary-500 ring-1 ring-primary-500 bg-primary-50 dark:bg-primary-900/10': subscriptionForm.plan === plan.id, 'border-gray-200 dark:border-gray-700': subscriptionForm.plan !== plan.id }"
                                        @click="selectPlan(plan)">
                                        <div class="flex justify-between items-start mb-2">
                                            <h4 class="font-bold text-gray-900 dark:text-white text-sm">{{ plan.name }}
                                            </h4>
                                            <a-radio :value="plan.id" class="absolute top-4 right-4" />
                                        </div>
                                        <div class="text-lg font-bold text-primary-600 mb-1">
                                            {{ parseFloat(plan.price) === 0 ? 'Free' : `₹${plan.price}` }}
                                        </div>
                                        <a-tag v-if="plan.is_custom" color="orange" class="text-xs">Custom</a-tag>
                                    </div>
                                </div>
                            </a-radio-group>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a-form-item label="Billing Cycle">
                                <a-select v-model:value="subscriptionForm.billing_cycle" size="large">
                                    <a-select-option value="monthly">Monthly</a-select-option>
                                    <a-select-option value="yearly">Yearly</a-select-option>
                                </a-select>
                            </a-form-item>

                            <a-form-item label="Max Users">
                                <a-input-number v-model:value="subscriptionForm.max_users" class="w-full" :min="1"
                                    size="large" />
                            </a-form-item>

                            <a-form-item label="Start Date">
                                <a-date-picker v-model:value="subscriptionForm.start_date" class="w-full"
                                    value-format="YYYY-MM-DD" size="large" />
                            </a-form-item>
                            <a-form-item label="End Date">
                                <a-date-picker v-model:value="subscriptionForm.end_date" class="w-full"
                                    value-format="YYYY-MM-DD" size="large" />
                            </a-form-item>
                        </div>
                        <div class="flex justify-end mt-4">
                            <a-button type="primary" html-type="submit" :loading="loadingSubscription">Update
                                Subscription</a-button>
                        </div>
                    </a-form>
                </div>
            </section>

            <a-divider />

            <!-- Section 3: Modules -->
            <section>
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Assigned Modules</h2>
                    <p class="text-gray-500 text-sm">Enable or disable features.</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div v-for="mod in modules" :key="mod.id"
                            class="p-4 border rounded-xl hover:bg-white dark:hover:bg-gray-800 transition-all cursor-pointer flex items-start space-x-3 bg-white dark:bg-gray-800"
                            :class="selectedModules.includes(mod.id) ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/10' : 'border-gray-200 dark:border-gray-700'"
                            @click="toggleModule(mod.id)">
                            <a-checkbox :checked="selectedModules.includes(mod.id)" class="mt-1 pointer-events-none" />
                            <div>
                                <span class="font-medium block text-gray-900 dark:text-gray-100">{{ mod.name }}</span>
                                <span class="text-sm text-gray-500 mt-1 block">{{ mod.description }}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex justify-end mt-4">
                        <a-button type="primary" @click="updateModules" :loading="loadingModules">Update
                            Modules</a-button>
                    </div>
                </div>
            </section>

            <a-divider />

            <!-- Section 4: Branding -->
            <section>
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Branding & Identity</h2>
                    <p class="text-gray-500 text-sm">Logos, colors, and visual settings.</p>
                </div>
                <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
                    <a-form layout="vertical">
                        <div class="grid grid-cols-1 gap-8">
                            <ColorPicker label="Brand Color" v-model="brandingForm.primary_color" />

                            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <!-- Light Logo -->
                                <a-form-item label="Light Logo" class="mb-0">
                                    <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                        @click="$refs.lightLogoInput.click()">

                                        <input type="file" ref="lightLogoInput" style="display: none" accept="image/*"
                                            @change="(e: any) => handleFileSelect(e, 'logo')" />

                                        <img v-if="brandingForm.logoPreview || brandingForm.logoUrl"
                                            :src="brandingForm.logoPreview || brandingForm.logoUrl"
                                            class="h-32 w-auto object-contain mb-4 transition-transform group-hover:scale-105" />
                                        <div v-else
                                            class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                            <FileImageOutlined class="text-5xl" />
                                        </div>

                                        <div class="text-center">
                                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {{ brandingForm.logo?.name || 'Choose Light Logo' }}
                                            </p>
                                            <p class="text-xs text-gray-400" v-if="!brandingForm.logo">JPG, PNG, or SVG
                                            </p>
                                        </div>

                                        <div
                                            class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                            <div
                                                class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <CloudUploadOutlined /> Change Image
                                            </div>
                                        </div>
                                    </div>
                                </a-form-item>

                                <!-- Dark Logo -->
                                <a-form-item label="Dark Logo" class="mb-0">
                                    <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                        @click="$refs.darkLogoInput.click()">

                                        <input type="file" ref="darkLogoInput" style="display: none" accept="image/*"
                                            @change="(e: any) => handleFileSelect(e, 'dark_logo')" />

                                        <img v-if="brandingForm.darkLogoPreview || brandingForm.darkLogoUrl"
                                            :src="brandingForm.darkLogoPreview || brandingForm.darkLogoUrl"
                                            class="h-32 w-auto object-contain mb-4 transition-transform group-hover:scale-105" />
                                        <div v-else
                                            class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                            <FileImageOutlined class="text-5xl" />
                                        </div>

                                        <div class="text-center">
                                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {{ brandingForm.dark_logo?.name || 'Choose Dark Logo' }}
                                            </p>
                                            <p class="text-xs text-gray-400" v-if="!brandingForm.dark_logo">JPG, PNG, or
                                                SVG</p>
                                        </div>

                                        <div
                                            class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                            <div
                                                class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <CloudUploadOutlined /> Change Image
                                            </div>
                                        </div>
                                    </div>
                                </a-form-item>

                                <!-- Favicon -->
                                <a-form-item label="Favicon" class="mb-0">
                                    <div class="relative group cursor-pointer border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 transition-all hover:border-primary-500 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-white dark:bg-gray-800 h-64 flex flex-col items-center justify-center overflow-hidden"
                                        @click="$refs.faviconInput.click()">

                                        <input type="file" ref="faviconInput" style="display: none" accept="image/*"
                                            @change="(e: any) => handleFileSelect(e, 'favicon')" />

                                        <img v-if="brandingForm.faviconPreview || brandingForm.faviconUrl"
                                            :src="brandingForm.faviconPreview || brandingForm.faviconUrl"
                                            class="h-16 w-16 object-contain mb-4 transition-transform group-hover:scale-105" />
                                        <div v-else
                                            class="text-gray-300 dark:text-gray-600 mb-4 transition-colors group-hover:text-primary-400">
                                            <InfoCircleOutlined class="text-5xl" />
                                        </div>

                                        <div class="text-center">
                                            <p class="font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                {{ brandingForm.favicon?.name || 'Choose Favicon' }}
                                            </p>
                                            <p class="text-xs text-gray-400" v-if="!brandingForm.favicon">ICO or PNG</p>
                                        </div>

                                        <div
                                            class="absolute inset-0 bg-black/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl backdrop-blur-[1px]">
                                            <div
                                                class="bg-white dark:bg-gray-700 shadow-lg px-4 py-2 rounded-full text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                                <CloudUploadOutlined /> Change Image
                                            </div>
                                        </div>
                                    </div>
                                </a-form-item>
                            </div>
                        </div>
                        <div class="flex justify-end mt-8">
                            <a-button type="primary" size="large" @click="saveBranding" :loading="loadingBranding">
                                Update Branding
                            </a-button>
                        </div>
                    </a-form>
                </div>
            </section>

            <a-divider />

            <!-- Section 5: Organization -->
            <section>
                <div class="mb-6">
                    <h2 class="text-xl font-semibold text-gray-900 dark:text-white">Organization Details</h2>
                    <p class="text-gray-500 text-sm">Legal entity and contact information.</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border dark:border-gray-700">
                    <a-form layout="vertical" @finish="savePii">
                        <a-form-item label="GSTIN / Tax ID">
                            <a-input v-model:value="piiForm.gstin" size="large" />
                        </a-form-item>
                        <a-form-item label="Full Address">
                            <a-textarea v-model:value="piiForm.address" :rows="3" />
                        </a-form-item>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <a-form-item label="Contact Name">
                                <a-input v-model:value="piiForm.contact_name" size="large" />
                            </a-form-item>
                            <a-form-item label="Contact Email">
                                <a-input v-model:value="piiForm.email" size="large" />
                            </a-form-item>
                            <a-form-item label="Contact Phone">
                                <a-input v-model:value="piiForm.phone" size="large" />
                            </a-form-item>
                        </div>
                        <div class="flex justify-end mt-4">
                            <a-button type="primary" html-type="submit" :loading="loadingPii">Update
                                Organization</a-button>
                        </div>
                    </a-form>
                </div>
            </section>

        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { ArrowLeftOutlined, CloudUploadOutlined, FileImageOutlined, InfoCircleOutlined } from '@ant-design/icons-vue';
import { useTenantService } from '../../../composables/tenantService';
import { useModuleRegistry, type RegistryModule } from '../../../composables/useModuleRegistry';
import { usePlanService, type Plan } from '../../../composables/planService';

const route = useRoute();
const tenantId = route.params.id as string;
const {
    updateTenant,
    assignPlan,
    assignModules,
    getTenantModules,
    updateBranding,
    updatePii,
    getTenantById,
    getTenantSubscription,
    getTenantBranding,
    getTenantPii
} = useTenantService();
const { getRegistry } = useModuleRegistry();
const { getPlans } = usePlanService();

const loading = ref(true);
const tenant = ref<any>(null);

// Forms
const basicForm = reactive({ name: '', domain: '', status: '' });
const subscriptionForm = reactive({ plan: '', start_date: '', end_date: '', billing_cycle: 'monthly', max_users: 100 });
const selectedModules = ref<string[]>([]);
const brandingForm = reactive({
    primary_color: '#ffffff',
    logo: null as File | null,
    dark_logo: null as File | null,
    favicon: null as File | null,
    logoUrl: '',
    darkLogoUrl: '',
    faviconUrl: '',
    logoPreview: '',
    darkLogoPreview: '',
    faviconPreview: ''
});
const piiForm = reactive({ gstin: '', address: '', contact_name: '', email: '', phone: '' });

// Lists
const plans = ref<Plan[]>([]);
const modules = ref<RegistryModule[]>([]);

// Loading States
const loadingBasic = ref(false);
const loadingSubscription = ref(false);
const loadingModules = ref(false);
const loadingBranding = ref(false);
const loadingPii = ref(false);

const fetchData = async () => {
    loading.value = true;
    try {
        // 1. Fetch Tenant Basic Info
        const fetchedTenant = await getTenantById(tenantId);
        if (fetchedTenant) {
            tenant.value = fetchedTenant;
            basicForm.name = fetchedTenant.name;
            // Remove suffix for display/edit if desired, but keep simple for now
            basicForm.domain = fetchedTenant.domain.replace('.nexspace.app', '');
            basicForm.status = fetchedTenant.status || 'active';
        }

        // 2. Fetch Plans & Registry
        const [plansRes, modulesRes] = await Promise.all([getPlans(), getRegistry()]);
        if (plansRes) plans.value = plansRes.data?.results || plansRes.data || [];
        if (modulesRes) modules.value = modulesRes.data?.results || [];

        // 3. Fetch Sub-Resources (Prefill)
        // Subscription
        try {
            const subRes = await getTenantSubscription(tenantId);
            if (subRes && subRes.data) {
                const results = subRes.data.results || subRes.data;
                const sub = Array.isArray(results) ? results[0] : results;
                if (sub) {
                    subscriptionForm.plan = sub.plan; // might need plan ID mapping
                    subscriptionForm.start_date = sub.start_date;
                    subscriptionForm.end_date = sub.end_date;
                    subscriptionForm.billing_cycle = sub.billing_cycle;
                    subscriptionForm.max_users = sub.max_users;
                }
            }
        } catch (e) {
            console.warn('No subscription found or error fetching', e);
        }

        // Modules
        try {
            // getTenantModules returns assignment list
            const modRes = await getTenantModules(tenantId);
            if (modRes && modRes.data) {
                const assignments = modRes.data.results || modRes.data || [];
                // Only map if assignments is an array
                if (Array.isArray(assignments)) {
                    selectedModules.value = assignments.map((a: any) => a.module || a.module_id);
                }
            }
        } catch (e) { console.warn('No modules found', e); }

        // Branding
        try {
            const brandRes = await getTenantBranding(tenantId);
            if (brandRes && brandRes.data) {
                const results = brandRes.data.results || brandRes.data;
                const b = Array.isArray(results) ? results[0] : results;

                if (b) {
                    brandingForm.primary_color = b.primary_color || '#ffffff';
                    brandingForm.logoUrl = b.logo;
                    brandingForm.darkLogoUrl = b.dark_logo;
                    brandingForm.faviconUrl = b.favicon;
                }
            }
        } catch (e) { console.warn('No branding found', e); }

        // PII
        try {
            const piiRes = await getTenantPii(tenantId);
            if (piiRes && piiRes.data) {
                const results = piiRes.data.results || piiRes.data;
                const p = Array.isArray(results) ? results[0] : results;

                if (p) {
                    piiForm.gstin = p.gstin;
                    piiForm.address = p.address;
                    piiForm.contact_name = p.contact_name;
                    piiForm.email = p.email;
                    piiForm.phone = p.phone;
                }
            }
        } catch (e) { console.warn('No PII found', e); }

    } catch (e) {
        console.error('Failed to load tenant data', e);
        message.error('Failed to load some tenant details');
    } finally {
        loading.value = false;
    }
};

const selectPlan = (plan: Plan) => {
    subscriptionForm.plan = plan.id;
    subscriptionForm.max_users = plan.max_users;
    if (plan.billing_cycle) {
        subscriptionForm.billing_cycle = plan.billing_cycle;
    }
};

const updateBasicInfo = async () => {
    loadingBasic.value = true;
    try {
        await updateTenant(tenantId, { ...basicForm, domain: `${basicForm.domain}.nexspace.app` });
        message.success('Basic info updated');
    } catch (e) { message.error('Failed to update basic info'); }
    finally { loadingBasic.value = false; }
};

const updateSubscription = async () => {
    loadingSubscription.value = true;
    try {
        const selectedPlan = plans.value.find(p => p.id === subscriptionForm.plan);
        const price = selectedPlan ? parseFloat(selectedPlan.price) : 0;
        const payload = {
            tenant: tenantId,
            ...subscriptionForm,
            price
        };
        await assignPlan(payload);
        message.success('Subscription updated');
    } catch (e) { message.error('Failed to update subscription'); }
    finally { loadingSubscription.value = false; }
};

const toggleModule = (moduleId: string) => {
    if (selectedModules.value.includes(moduleId)) {
        selectedModules.value = selectedModules.value.filter(id => id !== moduleId);
    } else {
        selectedModules.value.push(moduleId);
    }
};

const updateModules = async () => {
    loadingModules.value = true;
    try {
        const modulePayload = {
            tenant: tenantId,
            modules: selectedModules.value.map((mid, idx) => ({ module: mid, priority: 10 - idx }))
        };
        await assignModules(modulePayload);
        message.success('Modules updated');
    } catch (e) { message.error('Failed to update modules'); }
    finally { loadingModules.value = false; }
};

const handleFileSelect = (event: any, field: 'logo' | 'dark_logo' | 'favicon') => {
    const file = event.target.files[0];
    if (file) {
        if (field === 'logo') {
            brandingForm.logo = file;
            brandingForm.logoPreview = URL.createObjectURL(file);
        } else if (field === 'dark_logo') {
            brandingForm.dark_logo = file;
            brandingForm.darkLogoPreview = URL.createObjectURL(file);
        } else if (field === 'favicon') {
            brandingForm.favicon = file;
            brandingForm.faviconPreview = URL.createObjectURL(file);
        }
    }
};

const saveBranding = async () => {
    loadingBranding.value = true;
    try {
        const formData = new FormData();
        formData.append('tenant', tenantId);
        if (brandingForm.primary_color) formData.append('primary_color', brandingForm.primary_color);
        if (brandingForm.logo) formData.append('logo', brandingForm.logo);
        if (brandingForm.dark_logo) formData.append('dark_logo', brandingForm.dark_logo);
        if (brandingForm.favicon) formData.append('favicon', brandingForm.favicon);

        await updateBranding(formData);
        message.success('Branding updated');
    } catch (e) { message.error('Failed to update branding'); }
    finally { loadingBranding.value = false; }
};

const savePii = async () => {
    loadingPii.value = true;
    try {
        await updatePii({ tenant: tenantId, ...piiForm });
        message.success('Organization details updated');
    } catch (e) { message.error('Failed to update organization'); }
    finally { loadingPii.value = false; }
};

onMounted(() => {
    fetchData();
});
</script>
