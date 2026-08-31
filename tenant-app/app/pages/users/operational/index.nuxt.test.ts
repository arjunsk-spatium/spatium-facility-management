import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import OperationalStaffPage from './index.vue'

const mockStaff = [
    {
        id: 'staff-1',
        full_name: 'Alice Operational',
        email: 'alice.op@example.com',
        phone_number: '+91 99999 88888',
        username: 'aliceop',
        facility_ids: ['fac-1', 'fac-2'],
        is_all_facilities: false,
        role_id: 'role-1',
        role_name: 'Supervisor',
        status: 'active'
    },
    {
        id: 'staff-2',
        full_name: 'Bob Operator',
        email: 'bob@example.com',
        phone_number: '+91 99999 77777',
        username: 'bobop',
        facility_ids: [],
        is_all_facilities: true,
        role_id: 'role-2',
        role_name: 'Technician',
        status: 'active'
    }
]

const mockFacilities = [
    { id: 'fac-1', name: 'HQ Building' },
    { id: 'fac-2', name: 'Annex Branch' }
]

const mockAssignUserFacilities = vi.fn().mockResolvedValue(true)
const mockGetUserFacilities = vi.fn().mockResolvedValue({
    facility_ids: ['fac-1'],
    is_all_facilities: false
})

const mockGetOperationalStaff = vi.fn().mockImplementation(() => Promise.resolve({
    results: mockStaff,
    count: mockStaff.length
}))

vi.mock('../../../composables/userService', () => ({
    useUserService: () => ({
        getOperationalStaff: mockGetOperationalStaff,
        createOperationalStaff: vi.fn().mockResolvedValue(mockStaff[0]),
        updateOperationalStaff: vi.fn().mockResolvedValue(mockStaff[0]),
        deleteOperationalStaff: vi.fn().mockResolvedValue(true),
        getUserFacilities: mockGetUserFacilities,
        assignUserFacilities: mockAssignUserFacilities
    })
}))

vi.mock('../../../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue({ facilities: mockFacilities }),
        getFacilityById: vi.fn().mockResolvedValue(mockFacilities[0])
    })
}))

describe('Operational Staff Page', () => {
    it('should render page header and operational staff table with multiple facilities', async () => {
        const wrapper = await mountSuspended(OperationalStaffPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users', 'users-operational'] }
                    }
                })]
            }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(wrapper.text()).toContain('Operational Staff')
        expect(wrapper.text()).toContain('Alice Operational')
        expect(wrapper.text()).toContain('Bob Operator')
        expect(wrapper.text()).toContain('HQ Building')
        expect(wrapper.text()).toContain('Annex Branch')
        expect(wrapper.text()).toContain('All facilities')
    })

    it('should have Manage Facilities buttons for staff members', async () => {
        const wrapper = await mountSuspended(OperationalStaffPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users', 'users-operational'] }
                    }
                })]
            }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const manageButtons = wrapper.findAllComponents({ name: 'ATooltip' })
            .filter(c => c.props('title') === 'Manage Facilities')

        expect(manageButtons.length).toBeGreaterThan(0)
    })

    it('should configure table pagination and invoke API when page_size or page changes', async () => {
        mockGetOperationalStaff.mockClear()

        const wrapper = await mountSuspended(OperationalStaffPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users', 'users-operational'] }
                    }
                })]
            }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        // Initial fetch call
        expect(mockGetOperationalStaff).toHaveBeenCalledWith(expect.objectContaining({
            page: 1,
            page_size: 10
        }))

        const table = wrapper.findComponent({ name: 'ATable' })
        expect(table.exists()).toBe(true)

        const pagination = table.props('pagination')
        expect(pagination).toBeTruthy()
        expect(pagination.total).toBe(2)
        expect(pagination.current).toBe(1)
        expect(pagination.pageSize).toBe(10)
        expect(pagination.showSizeChanger).toBe(true)

        // Trigger changing page size: onChange(1, 20)
        pagination.onChange(1, 20)
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockGetOperationalStaff).toHaveBeenCalledWith(expect.objectContaining({
            page: 1,
            page_size: 20
        }))

        // Trigger changing page number: onChange(2, 20)
        pagination.onChange(2, 20)
        await wrapper.vm.$nextTick()
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockGetOperationalStaff).toHaveBeenCalledWith(expect.objectContaining({
            page: 2,
            page_size: 20
        }))
    })
})
