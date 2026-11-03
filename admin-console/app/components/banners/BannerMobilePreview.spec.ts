import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Antd from 'ant-design-vue'
import BannerMobilePreview from './BannerMobilePreview.vue'

describe('BannerMobilePreview.vue (admin-console)', () => {
    const mountComponent = (props = {}) => {
        return mount(BannerMobilePreview, {
            props,
            global: {
                plugins: [Antd],
            },
        })
    }

    it('renders with default placeholders matching Spatium app', () => {
        const wrapper = mountComponent()
        expect(wrapper.text()).toContain('Spatium Commercio')
        expect(wrapper.text()).toContain('Hi, Dafiya')
        expect(wrapper.text()).not.toContain('Book Meeting Rooms')
        expect(wrapper.text()).not.toContain('Block the perfect meeting room in just a few taps')
        expect(wrapper.text()).toContain('Book Now')
        expect(wrapper.text()).toContain('Quick Actions')
        expect(wrapper.text()).toContain('Bookings')
    })

    it('updates tenant, user and category button in real-time when props change', () => {
        const wrapper = mountComponent({
            tenantName: 'Acme Tower',
            userName: 'Alex',
            category: 'announcement',
        })
        expect(wrapper.text()).toContain('Acme Tower')
        expect(wrapper.text()).toContain('Hi, Alex')
        expect(wrapper.text()).toContain('Learn More')
    })

    it('renders image and displays action button when imageUrl is provided', () => {
        const wrapper = mountComponent({
            imageUrl: 'https://example.com/banner.png',
            linkTitle: 'Register Now',
        })
        const img = wrapper.find('img[alt="Uploaded Banner"]')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('https://example.com/banner.png')
        expect(wrapper.text()).toContain('Register Now')
    })

    it('displays custom linkTitle as button name on the banner card', () => {
        const wrapper = mountComponent({
            linkTitle: 'Reserve Seat',
        })
        expect(wrapper.text()).toContain('Reserve Seat')
    })

    it('switches between mobile view and card 16:9 view', async () => {
        const wrapper = mountComponent({
            linkTitle: 'Claim Offer',
        })
        const cardViewBtn = wrapper.findAll('button').find(b => b.text().includes('Banner Card (16:9)'))
        await cardViewBtn?.trigger('click')

        expect(wrapper.text()).toContain('Claim Offer')
        expect(wrapper.text()).not.toContain('Book Meeting Rooms')
        expect(wrapper.text()).toContain('Aspect ratio: 16:9')
    })
})
