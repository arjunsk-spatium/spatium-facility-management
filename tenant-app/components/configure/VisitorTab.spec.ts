import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import VisitorTab from './VisitorTab.vue'

// Mock ant-design-vue message
vi.mock('ant-design-vue', () => ({
    message: {
        success: vi.fn(),
        error: vi.fn()
    }
}))

// Mock useNuxtApp
const mockApi = vi.fn()
vi.mock('#app', () => ({
    useNuxtApp: () => ({
        $api: mockApi
    })
}))

// Mock useTenantService
const mockGetTenantConfig = vi.fn()
const mockUpdateTenantConfig = vi.fn()
const mockGetCurrentTenantId = vi.fn().mockReturnValue('tenant-c')
vi.mock('../../composables/tenantService', () => ({
    useTenantService: () => ({
        getCurrentTenantId: mockGetCurrentTenantId,
        getTenantConfig: mockGetTenantConfig,
        updateTenantConfig: mockUpdateTenantConfig
    })
}))

describe('VisitorTab.vue', () => {
    beforeEach(() => {
        mockApi.mockClear()
    })

    const mountComponent = (props = {}) => {
        return mount(VisitorTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true,
                ...props
            },
            global: {
                stubs: {
                    'a-tabs': { template: '<div><slot /></div>' },
                    'a-tab-pane': { template: '<div><slot /></div>' },
                    'a-card': { template: '<div class="a-card"><slot /><slot name="title" /></div>' },
                    'a-switch': {
                        name: 'ASwitch',
                        template: '<button class="a-switch" @click="$emit(\'change\', !checked)"><slot /></button>',
                        props: ['checked', 'loading']
                    },
                    'a-divider': { template: '<hr class="a-divider" />' },
                    'ConfigTable': {
                        name: 'ConfigTable',
                        template: '<div class="config-table">{{ title }}</div>',
                        props: ['title', 'columns', 'data', 'loading', 'fields', 'canCreate', 'canUpdate', 'canDelete']
                    }
                }
            }
        })
    }

    it('mounts successfully', () => {
        const wrapper = mountComponent()
        expect(wrapper.exists()).toBe(true)
        expect(wrapper.find('h2').text()).toContain('Visitor Management Settings')
    })

    it('fetches visitor config on mount', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: true,
            visitor_email_required: false
        })

        mountComponent()
        await flushPromises()

        expect(mockGetTenantConfig).toHaveBeenCalledWith('tenant-c')
    })

    it('renders form configuration card', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })

        const wrapper = mountComponent()
        await flushPromises()

        expect(wrapper.text()).toContain('Visitor Form Fields')
        expect(wrapper.text()).toContain('Company Required')
        expect(wrapper.text()).toContain('Email Required')
    })

    it('toggles company required setting', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })
        mockUpdateTenantConfig.mockResolvedValueOnce({
            visitor_company_required: true,
            visitor_email_required: false
        })

        const wrapper = mountComponent()
        await flushPromises()

        const switches = wrapper.findAllComponents({ name: 'ASwitch' })
        expect(switches.length).toBe(2)

        await switches[0].trigger('click')
        await flushPromises()

        expect(mockUpdateTenantConfig).toHaveBeenCalledWith('tenant-c', { visitor_company_required: true })
    })

    it('toggles email required setting', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })
        mockUpdateTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: true
        })

        const wrapper = mountComponent()
        await flushPromises()

        const switches = wrapper.findAllComponents({ name: 'ASwitch' })
        expect(switches.length).toBe(2)

        await switches[1].trigger('click')
        await flushPromises()

        expect(mockUpdateTenantConfig).toHaveBeenCalledWith('tenant-c', { visitor_email_required: true })
    })

    it('fetches purposes of visit on mount', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: {
                results: [
                    { id: '1', name: 'Meeting', code: 'MTG' }
                ]
            }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })

        mountComponent()
        await flushPromises()

        expect(mockApi).toHaveBeenCalledWith('/api/portal/masters/purposes-of-visit/')
    })

    it('renders ConfigTable with correct title for Purpose of Visit', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })

        const wrapper = mountComponent()
        await flushPromises()

        const configTable = wrapper.find('.config-table')
        expect(configTable.exists()).toBe(true)
        expect(configTable.text()).toBe('Purposes of Visit')
    })

    it('passes permission props to ConfigTable', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: false,
            visitor_email_required: false
        })

        const wrapper = mountComponent({
            canCreate: false,
            canUpdate: true,
            canDelete: false
        })
        await flushPromises()

        const configTable = wrapper.findComponent({ name: 'ConfigTable' })
        expect(configTable.props('canCreate')).toBe(false)
        expect(configTable.props('canUpdate')).toBe(true)
        expect(configTable.props('canDelete')).toBe(false)
    })

    it('displays read-only state when canUpdate is false', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: { results: [] }
        })
        mockGetTenantConfig.mockResolvedValueOnce({
            visitor_company_required: true,
            visitor_email_required: false
        })

        const wrapper = mountComponent({ canUpdate: false })
        await flushPromises()

        expect(wrapper.text()).toContain('Required')
        expect(wrapper.text()).toContain('Optional')
    })
})
