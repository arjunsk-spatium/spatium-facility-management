<template>
    <div class="space-y-6 max-w-5xl mx-auto" v-if="currentRoom">
        <!-- Header -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div class="flex items-center gap-4">
                <a-button type="text" shape="circle" @click="navigateTo('/meeting-rooms')">
                    <template #icon>
                        <ArrowLeftOutlined />
                    </template>
                </a-button>
                <div>
                    <div class="flex items-center gap-3 mb-1">
                        <h1 class="text-2xl font-bold dark:text-white">{{ currentRoom.name }}</h1>
                        <RoomStatusBadge :status="currentRoom.status" />
                    </div>
                    <p class="text-gray-500 text-sm flex items-center gap-2">
                        <EnvironmentOutlined />
                        {{ currentRoom.facility }}
                    </p>
                </div>
            </div>

            <div class="flex gap-2">
                <a-button danger>
                    <a-popconfirm title="Delete this room?" @confirm="handleDelete" ok-text="Yes" cancel-text="No">
                        <template #icon><DeleteOutlined /></template>
                        Delete
                    </a-popconfirm>
                </a-button>
            </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Main Content -->
            <div class="lg:col-span-2 space-y-6">
                <!-- Images -->
                <div class="rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 h-64 flex items-center justify-center relative group">
                    <div v-if="!currentRoom.images?.length" class="text-gray-400 flex flex-col items-center">
                        <PictureOutlined class="text-4xl mb-2" />
                        <span>No images available</span>
                    </div>
                    <div v-else class="grid grid-cols-2 gap-2 p-2 w-full h-full">
                        <div v-for="img in currentRoom.images" :key="img.id" class="relative">
                            <img :src="img.image" class="w-full h-full object-cover rounded-lg" />
                            <div class="absolute top-1 right-1">
                                <a-popconfirm title="Delete this image?" @confirm="deleteImage(img.id)" ok-text="Yes" cancel-text="No">
                                    <a-button type="primary" danger size="small">
                                        <template #icon>
                                            <CloseOutlined />
                                        </template>
                                    </a-button>
                                </a-popconfirm>
                            </div>
                        </div>
                    </div>
                    <a-upload :show-upload-list="false" :before-upload="handleImageUpload" accept="image/*"
                        class="absolute bottom-3 right-3">
                        <a-button type="primary" size="small">
                            <template #icon>
                                <PlusOutlined />
                            </template>
                            Add Images
                        </a-button>
                    </a-upload>
                </div>

                <!-- Amenities -->
                <a-card title="Amenities">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div v-for="amenity in currentRoom.amenities_details" :key="amenity.id"
                            class="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <img v-if="amenity.amenity_details?.icon" :src="amenity.amenity_details.icon" class="w-5 h-5" />
                            <span class="font-medium dark:text-gray-200">{{ amenity.amenity_details?.name }}</span>
                        </div>
                    </div>
                </a-card>
            </div>

            <!-- Sidebar -->
            <div class="space-y-6">
                <!-- Pricing Card -->
                <a-card class="mb-6!">
                    <div class="flex justify-between items-center">
                        <span class="text-gray-500 font-medium">Hourly Rate</span>
                        <span class="text-2xl font-bold text-gray-900 dark:text-white">₹{{ currentRoom.price }}</span>
                    </div>
                    <div class="flex justify-between items-center border-t border-blue-200 dark:border-blue-800 pt-2 mt-2">
                        <span class="text-gray-500 font-medium">Credit Cost</span>
                        <div class="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-bold">
                            <ThunderboltOutlined />
                            {{ currentRoom.credits }} Credits
                        </div>
                    </div>
                </a-card>

                <!-- Details Card -->
                <a-card title="Configuration">
                    <div class="space-y-4">
                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Room Type</span>
                            <div class="text-base font-medium dark:text-white mt-1">{{ currentRoom.room_type_details?.name }}</div>
                        </div>

                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Seating Capacity</span>
                            <div class="flex items-center gap-2 mt-1 text-base font-medium dark:text-white">
                                <UserOutlined />
                                {{ currentRoom.pax }} Persons
                            </div>
                        </div>

                        <div>
                            <span class="block text-xs text-gray-500 uppercase">Room ID</span>
                            <div class="font-mono text-gray-600 dark:text-gray-400 mt-1">{{ currentRoom.id }}</div>
                        </div>
                    </div>
                </a-card>
            </div>
        </div>
    </div>

    <div v-else-if="loading" class="flex items-center justify-center h-screen">
        <a-spin size="large" />
    </div>

    <div v-else class="flex flex-col items-center justify-center h-96">
        <WarningOutlined class="text-4xl text-yellow-500 mb-4" />
        <h2 class="text-xl font-bold">Room Not Found</h2>
        <a-button type="link" @click="navigateTo('/meeting-rooms')">Back to Meeting Rooms</a-button>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { message } from 'ant-design-vue';
import { useMeetingRoomStore } from '../../../stores/meetingRoom';
import { useMeetingRoomService } from '../../../composables/meetingRoomService';
import { storeToRefs } from 'pinia';
import RoomStatusBadge from '../../../components/meeting-rooms/RoomStatusBadge.vue';
import {
    ArrowLeftOutlined,
    EnvironmentOutlined,
    UserOutlined,
    WarningOutlined,
    PictureOutlined,
    ThunderboltOutlined,
    PlusOutlined,
    CloseOutlined,
    DeleteOutlined
} from '@ant-design/icons-vue';

definePageMeta({
    middleware: 'auth'
});

const route = useRoute();
const store = useMeetingRoomStore();
const service = useMeetingRoomService();
const { currentRoom, loading } = storeToRefs(store);

const roomId = route.params.id as string;

const handleImageUpload = async (file: File) => {
    try {
        await service.uploadImages(roomId, [file])
        message.success('Image uploaded successfully')
        await store.fetchRoomById(roomId)
    } catch (e) {
        message.error('Failed to upload image')
    }
    return false
}

const deleteImage = async (imageId: string) => {
    try {
        await service.deleteImages(roomId, [imageId])
        message.success('Image deleted')
        await store.fetchRoomById(roomId)
    } catch (e) {
        message.error('Failed to delete image')
    }
}

const handleDelete = async () => {
    try {
        await store.deleteRoom(roomId)
        message.success('Room deleted')
        navigateTo('/meeting-rooms')
    } catch (e) {
        message.error('Failed to delete room')
    }
}

onMounted(() => {
    if (roomId) {
        store.fetchRoomById(roomId);
    }
});
</script>
