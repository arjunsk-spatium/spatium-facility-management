<template>
    <div
        class="camera-capture relative w-full h-full bg-black overflow-hidden flex flex-col justify-center items-center">
        <!-- Error State -->
        <div v-if="permissionError" class="text-center px-6 z-10">
            <div class="text-white text-lg mb-2">Camera Access Required</div>
            <p class="text-gray-400 text-sm mb-6">{{ permissionError }}</p>
            <a-button type="primary" @click="retryCamera">Allow Camera Access</a-button>
        </div>

        <!-- Live Camera View -->
        <video v-show="!capturedImage && !permissionError" ref="videoRef" autoplay playsinline
            class="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"
            :class="{ '!scale-x-100': facingMode === 'environment' }"></video>

        <!-- Captured Image Preview -->
        <img v-if="capturedImage" :src="capturedImage" alt="Captured"
            class="absolute top-0 left-0 w-full h-full object-cover z-20" />

        <!-- Overlay Controls -->
        <div v-if="!permissionError" class="absolute bottom-0 left-0 right-0 p-6 bg-black/40 backdrop-blur-sm z-30">
            <!-- Capture Controls -->
            <div v-if="!capturedImage" class="flex justify-between items-center px-4">
                <!-- Switch Camera -->
                <div class="w-12 h-12 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:scale-95 transition-all cursor-pointer"
                    @click="switchCamera">
                    <RetweetOutlined class="text-xl" style="color: white !important;" />
                </div>

                <!-- Trigger -->
                <button
                    class="w-20 h-20 rounded-full border-4 border-white bg-white/20 flex items-center justify-center active:scale-95 transition-all"
                    @click="capture">
                    <div class="w-16 h-16 rounded-full bg-white"></div>
                </button>

                <!-- Spacer to balance layout (or flash toggle in future) -->
                <div class="w-12"></div>
            </div>

            <!-- Review Controls -->
            <div v-else class="flex justify-between items-center px-4 pb-4">
                <a-button size="large" class="bg-white/20 border-white text-white hover:bg-white/30" ghost
                    @click="retake">
                    Retake
                </a-button>

                <a-button type="primary" size="large" @click="confirm">
                    Use Photo
                </a-button>
            </div>
        </div>

        <!-- Canvas for capture (hidden) -->
        <canvas ref="canvasRef" class="hidden"></canvas>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { RetweetOutlined } from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';

const emit = defineEmits(['capture', 'close']);

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const stream = ref<MediaStream | null>(null);
const facingMode = ref<'user' | 'environment'>('user');
const capturedImage = ref<string | null>(null);
const permissionError = ref<string | null>(null);

const startCamera = async () => {
    stopCamera();
    permissionError.value = null; // Reset error

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        permissionError.value = 'Camera not supported in this browser or context (requires HTTPS).';
        return;
    }

    try {
        stream.value = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode.value,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        if (videoRef.value) {
            videoRef.value.srcObject = stream.value;
        }
    } catch (err: any) {
        console.error('Camera error:', err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            permissionError.value = 'Permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError') {
            permissionError.value = 'No camera device found.';
        } else {
            permissionError.value = 'Unable to access camera: ' + (err.message || 'Unknown error');
        }
    }
};

const stopCamera = () => {
    if (stream.value) {
        stream.value.getTracks().forEach(track => track.stop());
        stream.value = null;
    }
};

const switchCamera = () => {
    facingMode.value = facingMode.value === 'user' ? 'environment' : 'user';
    startCamera();
};

const retryCamera = () => {
    startCamera();
};

const capture = () => {
    if (!videoRef.value || !canvasRef.value) return;

    const video = videoRef.value;
    const canvas = canvasRef.value;
    const context = canvas.getContext('2d');

    if (context) {
        // Set canvas to match video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Mirror check if front camera
        if (facingMode.value === 'user') {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        capturedImage.value = canvas.toDataURL('image/jpeg', 0.8);
    }
};

const retake = () => {
    capturedImage.value = null;
};

const confirm = () => {
    emit('capture', capturedImage.value);
};

onMounted(() => {
    startCamera();
});

onUnmounted(() => {
    stopCamera();
});

// Expose internal methods if needed
defineExpose({ startCamera, stopCamera });
</script>

<style scoped>
.camera-capture {
    background-color: #000;
}
</style>
