<template>
    <div class="max-w-4xl mx-auto">
        <PlanForm :submitting="submitting" @submit="handleCreate" @cancel="handleCancel" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { usePlanService } from '../../composables/planService';
import PlanForm from '../../components/plans/PlanForm.vue';

const router = useRouter();
const { createPlan } = usePlanService();
const submitting = ref(false);

const handleCancel = () => {
    router.push('/plans');
};

const handleCreate = async (values: any) => {
    submitting.value = true;
    try {
        await createPlan(values);
        message.success('Plan created successfully');
        router.push('/plans');
    } catch (error: any) {
        message.error(error.data?.message || 'Failed to create plan');
    } finally {
        submitting.value = false;
    }
};
</script>
