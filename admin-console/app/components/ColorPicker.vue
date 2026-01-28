<template>
    <div class="color-picker-component relative" ref="containerRef">
        <label v-if="label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{{ label }}</label>

        <!-- Trigger -->
        <div class="flex items-center gap-3">
            <div class="h-12 flex-grow rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer transition-all relative overflow-hidden group shadow-sm hover:shadow-md"
                :style="{ backgroundColor: modelValue }" @click="togglePicker">
                <div
                    class="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 dark:bg-white/10 transition-opacity">
                </div>
            </div>

            <!-- Hex Display -->
            <div class="text-sm font-mono text-gray-500 uppercase min-w-[4.5rem]">
                {{ modelValue }}
            </div>
        </div>

        <!-- Popover -->
        <div v-if="isOpen"
            class="absolute z-50 top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 w-64 select-none">

            <!-- Saturation/Brightness Box -->
            <div class="w-full h-40 rounded-lg mb-4 relative cursor-crosshair"
                :style="{ backgroundColor: `hsl(${hue}, 100%, 50%)` }" @mousedown="startDragSaturation">
                <div class="absolute inset-0 bg-gradient-to-r from-white to-transparent"></div>
                <div class="absolute inset-0 bg-gradient-to-b from-transparent to-black"></div>

                <div class="absolute w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    :style="{ left: `${saturation}%`, top: `${100 - brightness}%` }"></div>
            </div>

            <!-- Hue Slider -->
            <div class="relative w-full h-4 rounded-full mb-4 cursor-pointer overflow-hidden hue-slider">
                <input type="range" min="0" max="360" v-model.number="hue"
                    class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    @input="updateColorFromControls" />
                <div class="w-full h-full absolute inset-0 pointer-events-none"
                    style="background: linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)">
                </div>
                <div class="absolute top-0 bottom-0 w-2 bg-white border border-gray-300 shadow rounded-sm pointer-events-none transform -translate-x-1/2"
                    :style="{ left: `${(hue / 360) * 100}%` }"></div>
            </div>

            <!-- Inputs -->
            <div class="flex gap-2">
                <div class="flex-grow">
                    <input type="text" v-model="hexInput" @change="updateFromHex" @blur="updateFromHex"
                        class="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-transparent dark:text-white font-mono uppercase focus:ring-2 focus:ring-primary-500 focus:outline-none"
                        placeholder="#000000" />
                </div>
            </div>
        </div>

        <!-- Backdrop for closing -->
        <div v-if="isOpen" class="fixed inset-0 z-40" @click="closePicker"></div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';

const props = defineProps<{
    modelValue: string;
    label?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const containerRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const hue = ref(0);
const saturation = ref(100);
const brightness = ref(100);
const hexInput = ref(props.modelValue);

// Utils
const hexToHsb = (hex: string) => {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === r) h = ((g - b) / delta) % 6;
        else if (max === g) h = (b - r) / delta + 2;
        else h = (r - g) / delta + 4;
    }

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    const s = max === 0 ? 0 : delta / max;
    const v = max;

    return { h, s: s * 100, b: v * 100 };
};

const hsbToHex = (h: number, s: number, b: number) => {
    s /= 100;
    b /= 100;

    const c = b * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = b - c;

    let r = 0, g = 0, bl = 0;

    if (0 <= h && h < 60) { r = c; g = x; bl = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; bl = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; bl = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; bl = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; bl = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; bl = x; }

    const toHex = (n: number) => {
        const hex = Math.round((n + m) * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(bl)}`;
};

// Logic
const togglePicker = () => {
    isOpen.value = !isOpen.value;
    if (isOpen.value) {
        const { h, s, b } = hexToHsb(props.modelValue);
        hue.value = h;
        saturation.value = s;
        brightness.value = b;
        hexInput.value = props.modelValue;
    }
};

const closePicker = () => {
    isOpen.value = false;
};

const updateColorFromControls = () => {
    const hex = hsbToHex(hue.value, saturation.value, brightness.value);
    hexInput.value = hex;
    emit('update:modelValue', hex);
};

const updateFromHex = () => {
    let val = hexInput.value;
    if (!val.startsWith('#')) val = '#' + val;

    if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
        const { h, s, b } = hexToHsb(val);
        hue.value = h;
        saturation.value = s;
        brightness.value = b;
        emit('update:modelValue', val);
    }
};

// Dragging Logic for Saturation Box
const isDragging = ref(false);

const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging.value) return;

    // Find the closest .saturation-box parent or use saved reference if added
    const box = (containerRef.value as HTMLElement)?.querySelector('.cursor-crosshair');
    if (!box) return;

    const rect = box.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    // Clamp
    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    saturation.value = (x / rect.width) * 100;
    brightness.value = 100 - (y / rect.height) * 100;

    updateColorFromControls();
};

const handleMouseUp = () => {
    isDragging.value = false;
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
};

const startDragSaturation = (e: MouseEvent) => {
    isDragging.value = true;
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    handleMouseMove(e); // Trigger once immediately
};

watch(() => props.modelValue, (newVal) => {
    if (newVal !== hexInput.value) {
        hexInput.value = newVal;
    }
});

</script>

<style scoped>
/* Custom styled range slider for Hue */
input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    height: 16px;
    width: 16px;
    border-radius: 50%;
    background: #ffffff;
    cursor: pointer;
    box-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
    margin-top: -2px;
    /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
}
</style>
