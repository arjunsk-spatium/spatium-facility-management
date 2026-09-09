import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Antd from 'ant-design-vue'
import BannerForm from './BannerForm.vue'

describe('BannerForm.vue (tenant-app)', () => {
    const mountComponent = (props = {}) => {
        return mount(BannerForm, {
            props: {
                submitText: 'Create Banner',
                ...props,
            },
            global: {
                plugins: [Antd],
            },
        })
    }

    it('renders the form with default values', () => {
        const wrapper = mountComponent()
        expect(wrapper.text()).toContain('Title')
        expect(wrapper.text()).toContain('Description')
        expect(wrapper.text()).toContain('Category')
        expect(wrapper.text()).toContain('Banner Image')
    })

    it('mentions the 16:9 aspect ratio for banner image upload', () => {
        const wrapper = mountComponent()
        expect(wrapper.text()).toContain('16:9')
        expect(wrapper.text()).toContain('Recommended aspect ratio: 16:9')
    })

    it('populates initial values when provided', async () => {
        const wrapper = mountComponent({
            initialValues: {
                title: 'Test Banner',
                description: 'Test description',
                category: 'promotion',
                link: 'https://example.com',
                is_active: false,
            },
        })
        await wrapper.vm.$nextTick()
        const titleInput = wrapper.find('input[placeholder="Enter banner title"]')
        expect((titleInput.element as HTMLInputElement).value).toBe('Test Banner')
    })

    it('emits cancel event when cancel button is clicked', async () => {
        const wrapper = mountComponent()
        const cancelButton = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
        await cancelButton?.trigger('click')
        expect(wrapper.emitted('cancel')).toBeTruthy()
    })
})
