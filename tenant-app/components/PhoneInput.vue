<template>
    <a-input-group compact>
        <a-select :value="prefix" disabled :style="{ width: selectWidth }">
            <a-select-option value="+91">+91</a-select-option>
        </a-select>
        <a-input
            :value="displayValue"
            :placeholder="placeholder"
            :size="size"
            :disabled="disabled"
            :maxlength="maxlength"
            :style="{ width: `calc(100% - ${selectWidth})` }"
            @input="handleInput"
        />
    </a-input-group>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
    modelValue?: string;
    placeholder?: string;
    size?: 'large' | 'default' | 'small';
    disabled?: boolean;
    maxlength?: number;
    selectWidth?: string;
}>(), {
    modelValue: '',
    placeholder: 'Enter phone number',
    size: 'default',
    disabled: false,
    maxlength: 10,
    selectWidth: '70px'
});

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void;
}>();

const prefix = '+91';

const displayValue = computed(() => {
    if (!props.modelValue) return '';
    const digits = props.modelValue.replace(/\D/g, '');
    // Strip the 91 country-code prefix only when it was added by this component (value has '+')
    if (props.modelValue.includes('+') && digits.startsWith('91')) {
        return digits.slice(2);
    }
    return digits.slice(-10);
});

const handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const digits = target.value.replace(/\D/g, '');
    const last10 = digits.slice(-10);
    emit('update:modelValue', last10 ? `+91${last10}` : '');
};
</script>
