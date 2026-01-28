import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import ColorPicker from './ColorPicker.vue'

describe('ColorPicker.vue', () => {
    it('renders correctly', () => {
        const wrapper = mount(ColorPicker, {
            props: {
                modelValue: '#ff0000',
                label: 'Test Color'
            }
        })
        expect(wrapper.text()).toContain('Test Color')
        expect(wrapper.text()).toContain('#ff0000')
    })

    it('toggles picker on click', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                modelValue: '#ff0000'
            }
        })
        
        // Initial state: closed
        expect(wrapper.find('.absolute.z-50').exists()).toBe(false)
        
        // Click to open
        await wrapper.find('.flex-grow').trigger('click')
        expect(wrapper.find('.absolute.z-50').exists()).toBe(true)
        
        // Click backdrop to close
        await wrapper.find('.fixed.inset-0').trigger('click')
        expect(wrapper.find('.absolute.z-50').exists()).toBe(false)
    })

    it('updates internal state when prop changes', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                modelValue: '#000000'
            }
        })
        
        await wrapper.setProps({ modelValue: '#ffffff' })
        expect(wrapper.text()).toContain('#ffffff')
    })

    it('validates and emits hex updates', async () => {
        const wrapper = mount(ColorPicker, {
            props: {
                modelValue: '#000000'
            }
        })
        
        await wrapper.find('.flex-grow').trigger('click')
        const input = wrapper.find('input[type="text"]')
        
        await input.setValue('#123456')
        expect(wrapper.emitted()['update:modelValue'][0]).toEqual(['#123456'])
    })
})
