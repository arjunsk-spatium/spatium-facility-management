import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import Antd from 'ant-design-vue'
import BannerForm from './BannerForm.vue'

const mountForm = (props = {}) => {
    const pinia = createPinia()
    setActivePinia(pinia)
    const tenantStore = useTenantStore()
    tenantStore.tenants = [
        { id: 'tenant-1', name: 'Acme Corp' },
        { id: 'tenant-2', name: 'Globex' },
    ] as any
    tenantStore.fetchTenants = vi.fn()

    return mount(BannerForm, {
        props: {
            submitText: 'Create Banner',
            ...props,
        },
        global: {
            plugins: [Antd, pinia],
        },
    })
}

describe('BannerForm.vue', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('renders with empty initial values', () => {
        const wrapper = mountForm()

        expect(wrapper.text()).toContain('Create Banner')
        expect(wrapper.text()).toContain('Title')
        expect(wrapper.text()).toContain('Description')
    })

    it('mentions 16:9 aspect ratio for banner image upload', () => {
        const wrapper = mountForm()

        expect(wrapper.text()).toContain('16:9')
        expect(wrapper.text()).toContain('Recommended aspect ratio: 16:9')
    })

    it('populates form with initial values when editing', async () => {
        const wrapper = mountForm({
            isEditing: true,
            initialValues: {
                title: 'Maintenance Banner',
                description: 'Downtime notice',
                category: 'maintenance',
                link: 'https://example.com',
                is_active: false,
                is_global: false,
                image_url: 'https://example.com/banner.jpg',
                tenant: ['tenant-1'],
            },
        })

        await wrapper.vm.$nextTick()

        const titleInput = wrapper.find('input[type="text"]')
        expect(titleInput.element.value).toBe('Maintenance Banner')
    })

    it('shows tenant selection when global is off', async () => {
        const wrapper = mountForm({
            initialValues: {
                title: 'Tenant Banner',
                description: 'Description',
                category: 'announcement',
                link: '',
                is_active: true,
                is_global: false,
                image_url: null,
            },
        })

        await wrapper.vm.$nextTick()

        expect(wrapper.text()).toContain('Tenants')
    })

    it('hides tenant selection when global is on', async () => {
        const wrapper = mountForm({
            initialValues: {
                title: 'Global Banner',
                description: 'Description',
                category: 'announcement',
                link: '',
                is_active: true,
                is_global: true,
                image_url: null,
            },
        })

        await wrapper.vm.$nextTick()

        expect(wrapper.text()).not.toContain('Tenants')
    })

    it('emits submit payload on form submit', async () => {
        const wrapper = mountForm({
            initialValues: {
                title: 'New Banner',
                description: 'Banner description',
                category: 'announcement',
                link: 'https://example.com',
                is_active: true,
                is_global: false,
                image_url: null,
                tenant: ['tenant-1'],
            },
        })

        await wrapper.vm.$nextTick()

        const form = wrapper.findComponent({ name: 'AForm' })
        await form.vm.$emit('finish')
        await wrapper.vm.$nextTick()

        expect(wrapper.emitted('submit')).toBeTruthy()
        const payload = wrapper.emitted('submit')![0][0] as any
        expect(payload.title).toBe('New Banner')
        expect(payload.description).toBe('Banner description')
        expect(payload.category).toBe('announcement')
        expect(payload.link).toBe('https://example.com')
        expect(payload.is_active).toBe(true)
        expect(payload.is_global).toBe(false)
        expect(payload.tenant).toEqual(['tenant-1'])
    })

    it('emits cancel event', async () => {
        const wrapper = mountForm()

        const cancelButton = wrapper.findAll('button').find(b => b.text().includes('Cancel'))
        await cancelButton?.trigger('click')

        expect(wrapper.emitted('cancel')).toBeTruthy()
    })
})
