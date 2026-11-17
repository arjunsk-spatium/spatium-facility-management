import { describe, it, expect, vi, beforeEach } from 'vitest'
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

const { mockGetUsersPage } = vi.hoisted(() => ({ mockGetUsersPage: vi.fn() }))

vi.mock('../../composables/userService', () => ({
    useUserService: () => ({
        getUsers: vi.fn().mockResolvedValue(mockUsers),
        getUsersPage: mockGetUsersPage,
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

beforeEach(() => {
    mockGetUsersPage.mockReset()
    mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: mockUsers.length })
})

const mountManagementPage = async () => {
    const wrapper = await mountSuspended(UsersManagementPage, {
        global: {
            plugins: [createTestingPinia({
                createSpy: vi.fn,
                initialState: { auth: { modules: ['users'] } }
            })]
        }
    })
    await new Promise(resolve => setTimeout(resolve, 0))
    return wrapper
}

describe('Users Management pagination', () => {
    it('loads the first page of 10 users and shows the total', async () => {
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 23 })
        const wrapper = await mountManagementPage()

        expect(mockGetUsersPage).toHaveBeenCalledWith(1, 10, '')
        expect(wrapper.find('[data-testid="users-pagination"]').exists()).toBe(true)
        expect(wrapper.text()).toContain('Showing 1–10 of 23 users')
    })

    it('fetches the selected page', async () => {
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 23 })
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any

        await vm.handlePageChange(3, 10)
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockGetUsersPage).toHaveBeenLastCalledWith(3, 10, '')
        expect(vm.currentPage).toBe(3)
        expect(wrapper.text()).toContain('Showing 21–23 of 23 users')
    })

    it('goes back to page 1 when the page size changes', async () => {
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 60 })
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any

        await vm.handlePageChange(4, 10)
        await vm.handlePageChange(4, 50)
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockGetUsersPage).toHaveBeenLastCalledWith(1, 50, '')
        expect(vm.currentPage).toBe(1)
    })

    it('steps back a page when the current page comes back empty (e.g. after deleting its last user)', async () => {
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 21 })
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any

        mockGetUsersPage
            .mockResolvedValueOnce({ results: [], count: 20 })
            .mockResolvedValueOnce({ results: mockUsers, count: 20 })
        await vm.handlePageChange(3, 10)
        await new Promise(resolve => setTimeout(resolve, 0))

        expect(mockGetUsersPage).toHaveBeenLastCalledWith(2, 10, '')
        expect(vm.currentPage).toBe(2)
    })

    it('sends the search term to the backend from page 1 instead of filtering in the browser', async () => {
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 23 })
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any
        await vm.handlePageChange(3, 10)

        // Backend returns only the match; the page must show exactly what it returned
        mockGetUsersPage.mockResolvedValue({ results: [mockUsers[1]], count: 1 })
        vm.searchQuery = 'jane'
        await vm.runSearch()
        await wrapper.vm.$nextTick()

        expect(mockGetUsersPage).toHaveBeenLastCalledWith(1, 10, 'jane')
        expect(vm.currentPage).toBe(1)
        expect(wrapper.text()).toContain('Jane Smith')
        expect(wrapper.text()).not.toContain('John Doe')
        expect(wrapper.text()).toContain('Showing 1–1 of 1 users')
    })

    it('debounces typing into a single search request', async () => {
        // Mount with real timers (mountSuspended hangs under fake timers), then fake them for the debounce
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any
        mockGetUsersPage.mockClear()
        vi.useFakeTimers()
        try {

            vm.searchQuery = 'j'
            await wrapper.vm.$nextTick()
            vm.searchQuery = 'ja'
            await wrapper.vm.$nextTick()
            vm.searchQuery = 'jan'
            await wrapper.vm.$nextTick()
            expect(mockGetUsersPage).not.toHaveBeenCalled()

            await vi.advanceTimersByTimeAsync(400)
            expect(mockGetUsersPage).toHaveBeenCalledTimes(1)
            expect(mockGetUsersPage).toHaveBeenCalledWith(1, 10, 'jan')
        } finally {
            vi.useRealTimers()
        }
    })

    it('keeps the search term when changing pages', async () => {
        const wrapper = await mountManagementPage()
        const vm = wrapper.vm as any
        mockGetUsersPage.mockResolvedValue({ results: mockUsers, count: 30 })
        vm.searchQuery = 'spatium'
        await vm.runSearch()

        await vm.handlePageChange(2, 10)

        expect(mockGetUsersPage).toHaveBeenLastCalledWith(2, 10, 'spatium')
    })

    it('hides the pagination when there are no users', async () => {
        mockGetUsersPage.mockResolvedValue({ results: [], count: 0 })
        const wrapper = await mountManagementPage()

        expect(wrapper.find('[data-testid="users-pagination"]').exists()).toBe(false)
        expect(wrapper.text()).toContain('No users found.')
    })
})

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
