import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocConfigPage from '../../app/pages/spoc/config/index.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('../../composables/departmentService', () => ({
    useDepartmentService: () => ({
        fetchDepartments: vi.fn().mockResolvedValue([]),
        createDepartment: vi.fn(),
        updateDepartment: vi.fn(),
        deleteDepartment: vi.fn(),
    }),
}))

describe('SPOC Config Page', () => {
    it('should render config page with header', async () => {
        const wrapper = await mountSuspended(SpocConfigPage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })

        expect(wrapper.text()).toContain('SPOC Configuration')
    })

    it('should have Departments tab', async () => {
        const wrapper = await mountSuspended(SpocConfigPage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })

        expect(wrapper.text()).toContain('Departments')
    })
    it('should configure Slug column as copyable', async () => {
        const wrapper = await mountSuspended(SpocConfigPage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })

        // Find the ConfigTable component and check its columns prop
        const configTable = wrapper.findComponent({ name: 'ConfigTable' })
        expect(configTable.exists()).toBe(true)

        const columns = configTable.props('columns') as Array<any>
        const slugColumn = columns.find(col => col.key === 'slug')
        
        expect(slugColumn).toBeDefined()
        expect(slugColumn.copyable).toBe(true)
    })
})
