<template>
    <a-modal 
        v-model:open="isOpen" 
        :footer="null"
        :width="800"
        :centered="true"
        @cancel="handleClose"
    >
        <div class="flex items-center justify-center p-4">
            <img 
                :src="src" 
                :alt="alt" 
                class="max-w-full max-h-[70vh] object-contain rounded-lg"
                @click.stop
            />
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
    open: boolean;
    src: string;
    alt?: string;
}>();

const emit = defineEmits<{
    'update:open': [value: boolean];
}>();

const isOpen = ref(props.open);

watch(() => props.open, (val) => {
    isOpen.value = val;
});

watch(isOpen, (val) => {
    emit('update:open', val);
});

const handleClose = () => {
    isOpen.value = false;
};
</script>
