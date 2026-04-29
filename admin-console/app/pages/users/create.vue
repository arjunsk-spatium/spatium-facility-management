<template>
    <div class="p-6 max-w-2xl mx-auto">
        <div class="mb-6">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Create User</h1>
        </div>

        <a-card class="shadow-sm">
            <a-form :model="formState" layout="vertical" @finish="onFinish">
                <a-form-item label="Full Name" name="full_name"
                    :rules="[{ required: true, message: 'Please input full name!' }]">
                    <a-input v-model:value="formState.full_name" placeholder="John Doe" />
                </a-form-item>

                <a-form-item label="Email" name="email"
                    :rules="[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Please enter a valid email!' }]">
                    <a-input v-model:value="formState.email" placeholder="john@example.com" />
                </a-form-item>

                <a-form-item label="Phone Number" name="phone_number"
                    :rules="[{ required: true, message: 'Please input phone number!' }]">
                    <PhoneInput v-model="formState.phone_number" />
                </a-form-item>

                <div class="flex justify-end gap-2 mt-6">
                    <NuxtLink to="/users">
                        <a-button>Cancel</a-button>
                    </NuxtLink>
                    <a-button type="primary" html-type="submit" :loading="loading">Create User</a-button>
                </div>
            </a-form>
        </a-card>

        <a-modal
            v-model:open="confirmationVisible"
            title="User Already Exists"
            @ok="handleConfirmAdd"
            :confirmLoading="loading"
        >
            <p>{{ existingUserMessage }}</p>
            <p>Do you want to add this person to the admin portal?</p>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { createUser, patchUser } = useUserService();
const loading = ref(false);
const confirmationVisible = ref(false);
const existingUserId = ref('');
const existingUserMessage = ref('');

const formState = reactive({
    app_name: 'admin',
    full_name: '',
    email: '',
    phone_number: '',
});

const onFinish = async (values: any) => {
    loading.value = true;
    try {
        await createUser({ ...values, app_name: 'admin' });
        message.success('User created successfully');
        router.push('/users');
    } catch (error: any) {
        if (error.data?.code === 'USER_CREATION_ERROR' && error.data?.error?.type === 'VALIDATION_ERROR') {
            const userIdError = error.data?.error?.fields?.user_id?.[0];
            const emailError = error.data?.error?.fields?.email?.[0];
            
            if (userIdError) {
                existingUserId.value = userIdError.message;
                existingUserMessage.value = emailError?.message || 'User already exists in another app.';
                confirmationVisible.value = true;
                return;
            }
        }
        message.error('Failed to create user');
    } finally {
        loading.value = false;
    }
};

const handleConfirmAdd = async () => {
    loading.value = true;
    confirmationVisible.value = false;
    try {
        await patchUser(existingUserId.value, { ...formState, app_name: 'admin' });
        message.success('User added to admin portal successfully');
        router.push('/users');
    } catch (error) {
        message.error('Failed to add existing user to admin portal');
    } finally {
        loading.value = false;
    }
};
</script>
