<template>
    <div class="max-w-4xl mx-auto">
        <PlanForm :initial-values="plan" :is-editing="true" :submitting="submitting" :loading="loading"
            @submit="handleUpdate" @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { usePlanService, type Plan } from '../../../composables/planService';
import PlanForm from '../../../components/plans/PlanForm.vue';

const route = useRoute();
const router = useRouter();
const { updatePlan, getPlan } = usePlanService();

const planId = route.params.id as string;
const plan = ref<Plan | null>(null);
const loading = ref(false);
const submitting = ref(false);

const fetchPlanDetails = async () => {
    loading.value = true;
    try {
        const response = await getPlan(planId);
        if (response.success) {
            plan.value = response.data;
        }
    } catch (error) {
        message.error('Failed to load plan details');
        router.push('/plans');
    } finally {
        loading.value = false;
    }
};

const handleCancel = () => {
    router.push('/plans');
};

const handleUpdate = async (values: any) => {
    submitting.value = true;
    try {
        await updatePlan(planId, values);
        message.success('Plan updated successfully');
        router.push('/plans');
    } catch (error: any) {
        message.error(error.data?.message || 'Failed to update plan');
    } finally {
        submitting.value = false;
    }
};

onMounted(() => {
    fetchPlanDetails();
});
</script>
