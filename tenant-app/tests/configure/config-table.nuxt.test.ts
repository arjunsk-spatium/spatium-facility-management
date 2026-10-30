import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConfigTable from '../../components/configure/ConfigTable.vue'
import ResponsiveDataView from '../../components/ResponsiveDataView.vue'

describe('ConfigTable Component', () => {
    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Key', dataIndex: 'key', key: 'key' }
    ]

    const data = [
        { id: '1', name: 'Item 1', key: 'item_1' },
        { id: '2', name: 'Item 2', key: 'item_2' }
    ]

    it('mounts and passes default pagination config to ResponsiveDataView when no pagination prop is passed', async () => {
        const wrapper = await mountSuspended(ConfigTable, {
            props: {
                title: 'Items',
                columns,
                data
            }
        })

        const dataView = wrapper.findComponent(ResponsiveDataView)
        expect(dataView.exists()).toBe(true)

        const pagination = dataView.props('pagination')
        expect(pagination).toBeDefined()
        expect(pagination.pageSize).toBe(10)
        expect(pagination.showSizeChanger).toBe(true)
        expect(pagination.pageSizeOptions).toEqual(['10', '20', '50'])
    })

    it('passes custom pagination configuration to ResponsiveDataView when pagination prop is provided', async () => {
        const customPagination = {
            current: 2,
            pageSize: 25,
            total: 100,
            showSizeChanger: true,
            onChange: vi.fn()
        }

        const wrapper = await mountSuspended(ConfigTable, {
            props: {
                title: 'Items',
                columns,
                data,
                pagination: customPagination
            }
        })

        const dataView = wrapper.findComponent(ResponsiveDataView)
        expect(dataView.exists()).toBe(true)

        const pagination = dataView.props('pagination')
        expect(pagination).toEqual(customPagination)
        expect(pagination.current).toBe(2)
        expect(pagination.pageSize).toBe(25)
        expect(pagination.total).toBe(100)
    })
})
