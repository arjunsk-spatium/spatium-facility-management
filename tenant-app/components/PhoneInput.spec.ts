import { describe, it, expect } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import PhoneInput from './PhoneInput.vue'

describe('PhoneInput', () => {
    it('applies the same size to the prefix select and the input so they stay aligned', async () => {
        const wrapper = await mountSuspended(PhoneInput, {
            props: { size: 'large', selectWidth: '90px' }
        })

        const select = wrapper.findComponent({ name: 'ASelect' })
        const input = wrapper.findComponent({ name: 'AInput' })

        expect(select.exists()).toBe(true)
        expect(input.exists()).toBe(true)
        expect(select.props('size')).toBe('large')
        expect(input.props('size')).toBe('large')
    })

    it('defaults both controls to the default size', async () => {
        const wrapper = await mountSuspended(PhoneInput)

        const select = wrapper.findComponent({ name: 'ASelect' })
        const input = wrapper.findComponent({ name: 'AInput' })

        expect(select.props('size')).toBe('default')
        expect(input.props('size')).toBe('default')
    })
})
