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
})
