import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import UsersManagementPage from '../../app/pages/users/management/index.vue'
import OperationalStaffPage from '../../app/pages/users/operational/index.vue'

const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '+91 98765 43210', role: 'Admin', status: 'active', apps: ['org_portal'] },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '', role: 'Manager', status: 'active', apps: ['org_portal'] }
]

const mockStaff = [
    { id: 's1', full_name: 'Alice Worker', email: 'alice@example.com', phone_number: '1234567890', username: 'alice', status: 'active' },
    { id: 's2', full_name: 'Bob Operator', email: 'bob@example.com', phone_number: '0987654321', username: 'bob', status: 'active' }
]

vi.mock('../../composables/userService', () => ({
    useUserService: () => ({
        getUsers: vi.fn().mockResolvedValue(mockUsers),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn(),
        getOperationalStaff: vi.fn().mockResolvedValue({ results: mockStaff, count: 2 }),
        createOperationalStaff: vi.fn().mockResolvedValue({ id: 's3' }),
        updateOperationalStaff: vi.fn().mockResolvedValue({ id: 's1' }),
        deleteOperationalStaff: vi.fn().mockResolvedValue({ success: true }),
        getUserFacilities: vi.fn().mockResolvedValue({ facility_ids: [], is_all_facilities: false }),
        assignUserFacilities: vi.fn().mockResolvedValue({ success: true })
    })
}))

vi.mock('../../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue({ facilities: [], count: 0, next: null, previous: null }),
        getFacilityById: vi.fn().mockResolvedValue(null)
    })
}))

describe('Users Module Management Page', () => {
    it('should render users page with header', async () => {
        const wrapper = await mountSuspended(UsersManagementPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(wrapper.text()).toContain('User')
    })

    it('should have Add User button', async () => {
        const wrapper = await mountSuspended(UsersManagementPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        await new Promise(resolve => setTimeout(resolve, 0))
        
        expect(wrapper.html()).toContain('Add')
    })

    it('should render Manage Facilities buttons', async () => {
        const wrapper = await mountSuspended(UsersManagementPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(wrapper.text()).toContain('Manage Facilities')
    })

    it('should render View buttons for each user', async () => {
        const wrapper = await mountSuspended(UsersManagementPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const buttons = wrapper.findAll('button')
        const viewButtons = buttons.filter(b => b.text().includes('View'))
        expect(viewButtons.length).toBeGreaterThan(0)
    })
})

describe('Operational Staff Page', () => {
    it('should filter staff list with displayedStaff computed property', async () => {
        const wrapper = await mountSuspended(OperationalStaffPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users-operational'] }
                    }
                })]
            }
        })
        await new Promise(resolve => setTimeout(resolve, 0))

        const vm = wrapper.vm as any
        vm.staffList = mockStaff
        vm.searchQuery = 'Alice'
        await wrapper.vm.$nextTick()

        expect(vm.displayedStaff.length).toBe(1)
        expect(vm.displayedStaff[0].full_name).toBe('Alice Worker')
    })
})
