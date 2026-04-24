import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import VisitorList from './VisitorList.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('../../stores/auth', () => ({
    useAuthStore: () => ({
        permissions: ['visitor_sticker_print'],
        token: 'mock-token'
    })
}))

// Mock composables that would be auto-imported by Nuxt
vi.mock('#imports', () => ({
    useRuntimeConfig: () => ({ public: { apiBaseUrl: 'http://localhost:8000' } }),
    useCookie: () => ({ value: 'test-tenant' })
}))

describe('VisitorList.vue', () => {
    let wrapper: any

    const mockVisitors = [
        { id: '1', name: 'John Doe', status: 'Approved', visitor_type: 'walk_in', facility_name: 'HQ', check_out_time: null },
        { id: '2', name: 'Jane Smith', status: 'Pending', visitor_type: 'pre_invite', facility_name: 'HQ' }
    ]

    beforeEach(() => {
        wrapper = mount(VisitorList, {
            props: {
                visitors: mockVisitors,
                loading: false,
                showActions: true
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })],
                stubs: {
                    ResponsiveDataView: {
                        template: '<div><slot name="bodyCell" :column="{key: \'actions\'}" :record="data[0]"></slot></div>',
                        props: ['data', 'columns', 'loading', 'mobilePageSize', 'pagination']
                    },
                    'a-button': { template: '<button @click="$emit(\'click\')"><slot/></button>' },
                    'a-tag': true,
                    'a-avatar': true,
                    'a-card': true,
                    'VisitorDetailsModal': true,
                    'ImagePreviewModal': true,
                    'a-modal': true,
                    'a-textarea': true
                },
                mocks: {
                    useRuntimeConfig: () => ({ public: { apiBaseUrl: 'http://localhost' } }),
                    useCookie: () => ({ value: 'test-tenant' })
                }
            }
        })
    })

    it('mounts successfully', () => {
        expect(wrapper.exists()).toBe(true)
    })

    it('shows Print Sticker button for approved visitors when permission is present', () => {
        const buttons = wrapper.findAll('button')
        const printButton = buttons.find((b: any) => b.text().includes('Print Sticker'))
        expect(printButton).toBeDefined()
    })
})
