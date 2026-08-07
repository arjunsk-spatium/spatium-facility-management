import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { createTestingPinia } from '@pinia/testing'
import UserDetailsPage from './index.vue'

const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 98765 43210',
    role: 'Admin',
    status: 'active',
    modules: []
}

const mockSystemModules = [
    {
        id: 'mod-1',
        module: 'Visitors',
        submodules: [
            {
                id: 'sub-1',
                name: 'All Visitors',
                permissions: [
                    { id: 'perm-1', name: 'View', key: 'view' }
                ],
                features: []
            }
        ]
    }
]

const mockFacilities = [
    { id: 'fac-1', name: 'HQ Building', city_details: { name: 'New York' } },
    { id: 'fac-2', name: 'Tech Park', city_details: { name: 'San Francisco' } }
]

vi.mock('../../../../composables/userService', () => ({
    useUserService: () => ({
        getUserById: vi.fn().mockResolvedValue(mockUser),
        getUserAssignedModules: vi.fn().mockResolvedValue({ submodules: ['perm-1'], features: [] }),
        getAllSystemModules: vi.fn().mockResolvedValue(mockSystemModules),
        getUserFacilities: vi.fn().mockResolvedValue({ facility_ids: ['fac-1'], is_all_facilities: false })
    })
}))

vi.mock('../../../../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue({ facilities: mockFacilities, count: 2, next: null, previous: null })
    })
}))

describe('User Details Page', () => {
    it('should render user details', async () => {
        const wrapper = await mountSuspended(UserDetailsPage, {
            route: {
                params: { id: 'user-1' }
            },
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

        expect(wrapper.text()).toContain('John Doe')
        expect(wrapper.text()).toContain('john.doe@example.com')
        expect(wrapper.text()).toContain('Admin')
    })

    it('should render a Modules section', async () => {
        const wrapper = await mountSuspended(UserDetailsPage, {
            route: {
                params: { id: 'user-1' }
            },
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

        expect(wrapper.text()).toContain('Modules')
        expect(wrapper.text()).toContain('Manage Modules')
    })

    it('should render a Facilities section', async () => {
        const wrapper = await mountSuspended(UserDetailsPage, {
            route: {
                params: { id: 'user-1' }
            },
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

        expect(wrapper.text()).toContain('Facilities')
        expect(wrapper.text()).toContain('Manage Facilities')
        expect(wrapper.text()).toContain('HQ Building')
    })
})
