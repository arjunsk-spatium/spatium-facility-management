import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import UsersPage from '../../app/pages/users/index.vue'

const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john.doe@example.com', phone: '+91 98765 43210', role: 'Admin', status: 'active', apps: ['org_portal'] },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', phone: '', role: 'Manager', status: 'active', apps: ['org_portal'] }
]

vi.mock('../../composables/userService', () => ({
    useUserService: () => ({
        getUsers: vi.fn().mockResolvedValue(mockUsers),
        createUser: vi.fn(),
        updateUser: vi.fn(),
        deleteUser: vi.fn()
    })
}))

vi.mock('../../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue({ facilities: [], count: 0, next: null, previous: null })
    })
}))

describe('Users Module Management Page', () => {
    it('should render users page with header', async () => {
        const wrapper = await mountSuspended(UsersPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('User')
    })

    it('should have Add User button', async () => {
        const wrapper = await mountSuspended(UsersPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['users'] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Add')
    })

    it('should render Manage Facilities buttons', async () => {
        const wrapper = await mountSuspended(UsersPage, {
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
        const wrapper = await mountSuspended(UsersPage, {
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
