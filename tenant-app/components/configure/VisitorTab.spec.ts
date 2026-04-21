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

    it('fetches purposes of visit on mount', async () => {
        mockApi.mockResolvedValueOnce({
            success: true,
            data: {
                results: [
                    { id: '1', name: 'Meeting', code: 'MTG' }
                ]
            }
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
})
