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
                    <a-input v-model:value="formState.phone_number" placeholder="+1234567890" />
                </a-form-item>

                <div class="flex justify-end gap-2 mt-6">
                    <NuxtLink to="/users">
                        <a-button>Cancel</a-button>
                    </NuxtLink>
                    <a-button type="primary" html-type="submit" :loading="loading">Create User</a-button>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { createUser } = useUserService();
const loading = ref(false);

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
    } catch (error) {
        message.error('Failed to create user');
    } finally {
        loading.value = false;
    }
};
</script>
