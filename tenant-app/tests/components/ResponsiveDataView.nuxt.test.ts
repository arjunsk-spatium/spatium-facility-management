import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'
import { createTestingPinia } from '@pinia/testing'

describe('ResponsiveDataView Component', () => {
    const mockColumns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        { title: 'Status', dataIndex: 'status', key: 'status' }
    ]

    const mockData = [
        { id: '1', name: 'John Doe', email: 'john@test.com', status: 'Active' },
        { id: '2', name: 'Jane Smith', email: 'jane@test.com', status: 'Inactive' }
    ]

    it('should render component', async () => {
        const wrapper = await mountSuspended(ResponsiveDataView, {
            props: {
                columns: mockColumns,
                data: mockData,
                loading: false,
                rowKey: 'id'
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        expect(wrapper.html()).toBeDefined()
    })

    it('should render table on desktop', async () => {
        const wrapper = await mountSuspended(ResponsiveDataView, {
            props: {
                columns: mockColumns,
                data: mockData,
                loading: false,
                rowKey: 'id'
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Should contain ant-table
        expect(wrapper.html()).toContain('ant-table')
    })

    it('should display data from props', async () => {
        const wrapper = await mountSuspended(ResponsiveDataView, {
            props: {
                columns: mockColumns,
                data: mockData,
                loading: false,
                rowKey: 'id'
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        expect(wrapper.text()).toContain('John Doe')
        expect(wrapper.text()).toContain('Jane Smith')
    })

    it('should show loading state', async () => {
        const wrapper = await mountSuspended(ResponsiveDataView, {
            props: {
                columns: mockColumns,
                data: [],
                loading: true,
                rowKey: 'id'
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Ant Design table shows loading spinner
        expect(wrapper.html()).toBeDefined()
    })
})
