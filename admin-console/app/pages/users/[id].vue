<template>
    <div class="p-6 max-w-2xl mx-auto">
        <div class="mb-6 flex justify-between items-center">
            <h1 class="text-2xl font-semibold text-gray-900 dark:text-gray-100">Edit User</h1>
            <a-popconfirm title="Are you sure delete this user?" ok-text="Yes" cancel-text="No" @confirm="handleDelete">
                <a-button danger>Delete User</a-button>
            </a-popconfirm>
        </div>

        <div v-if="pending" class="flex justify-center p-8">
            <a-spin size="large" />
        </div>

        <a-card v-else class="shadow-sm">
            <a-form :model="formState" layout="vertical" @finish="onFinish">
                <a-form-item label="Full Name" name="full_name"
                    :rules="[{ required: true, message: 'Please input full name!' }]">
                    <a-input v-model:value="formState.full_name" placeholder="John Doe" />
                </a-form-item>

                <a-form-item label="Email" name="email"
                    :rules="[{ required: true, message: 'Please input email!' }, { type: 'email', message: 'Please enter a valid email!' }]">
                    <a-input v-model:value="formState.email" placeholder="john@example.com" />
                    <a-alert v-if="user?.apps?.length > 1" type="warning" show-icon class="mt-2">
                        <template #message>
                            This email is connected to multiple apps: <strong>{{ user.apps.join(', ') }}</strong>.
                            Changing it will affect all linked accounts.
                        </template>
                    </a-alert>
                </a-form-item>

                <a-form-item label="Phone Number" name="phone_number"
                    :rules="[{ required: true, message: 'Please input phone number!' }]">
                    <a-input v-model:value="formState.phone_number" placeholder="+1234567890" />
                </a-form-item>

                <div class="flex justify-end gap-2 mt-6">
                    <NuxtLink to="/users">
                        <a-button>Cancel</a-button>
                    </NuxtLink>
                    <a-button type="primary" html-type="submit" :loading="saving">Save Changes</a-button>
                </div>
            </a-form>
        </a-card>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { message } from 'ant-design-vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
const userId = route.params.id as string;
const { getUserById, updateUser, deleteUser } = useUserService();

const saving = ref(false);

const formState = reactive({
    app_name: '',
    full_name: '',
    email: '',
    phone_number: '',
    apps: [] as string[]
});

const { data: user, pending, error } = await useAsyncData(() => getUserById(userId));

if (error.value) {
    message.error('Failed to load user');
    router.push('/users');
}

watch(user, (newUser) => {
    if (newUser) {
        Object.assign(formState, {
            ...newUser,
            apps: newUser.apps || []
        });
    }
}, { immediate: true });

const onFinish = async (values: any) => {
    saving.value = true;
    try {
        await updateUser(userId, { ...values, apps: formState.apps });
        message.success('User updated successfully');
        router.push('/users');
    } catch (error) {
        message.error('Failed to update user');
    } finally {
        saving.value = false;
    }
};

const handleDelete = async () => {
    try {
        await deleteUser(userId);
        message.success('User deleted successfully');
        router.push('/users');
    } catch (error) {
        message.error('Failed to delete user');
    }
};
</script>
