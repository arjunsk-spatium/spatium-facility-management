import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhoneInput from '../../components/PhoneInput.vue'

describe('PhoneInput Component', () => {
    it('should render +91 prefix select and phone input', async () => {
        const wrapper = await mountSuspended(PhoneInput)
        expect(wrapper.text()).toContain('+91')
        expect(wrapper.find('.ant-input').exists()).toBe(true)
    })

    it('should display empty input when modelValue is empty', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '' }
        })
        const input = wrapper.find('.ant-input')
        expect(input.element.value).toBe('')
    })

    it('should strip +91 prefix from modelValue for display', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '+919876543210' }
        })
        const input = wrapper.find('.ant-input')
        expect((input.element as HTMLInputElement).value).toBe('9876543210')
    })

    it('should handle phone numbers with spaces in modelValue', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '+91 98765 43210' }
        })
        const input = wrapper.find('.ant-input')
        expect((input.element as HTMLInputElement).value).toBe('9876543210')
    })

    it('should emit +91 prefixed value when input changes', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '' }
        })
        const input = wrapper.find('.ant-input')
        await input.setValue('9876543210')
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['+919876543210'])
    })

    it('should strip non-digits from input before emitting', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '' }
        })
        const input = wrapper.find('.ant-input')
        await input.setValue('98765abc43210')
        expect(wrapper.emitted('update:modelValue')).toBeTruthy()
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['+919876543210'])
    })

    it('should emit empty string when input is cleared', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { modelValue: '+919876543210' }
        })
        const input = wrapper.find('.ant-input')
        await input.setValue('')
        expect(wrapper.emitted('update:modelValue')![0]).toEqual([''])
    })
})
