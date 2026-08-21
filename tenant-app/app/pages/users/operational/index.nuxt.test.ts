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
        facility_id: 'fac-1',
        facility_name: 'HQ Building',
        role_id: 'role-1',
        role_name: 'Supervisor',
        status: 'active'
    }
]

const mockFacilities = [
    { id: 'fac-1', name: 'HQ Building' }
]

vi.mock('../../../composables/userService', () => ({
    useUserService: () => ({
        getOperationalStaff: vi.fn().mockResolvedValue(mockStaff),
        createOperationalStaff: vi.fn().mockResolvedValue(mockStaff[0]),
        updateOperationalStaff: vi.fn().mockResolvedValue(mockStaff[0]),
        deleteOperationalStaff: vi.fn().mockResolvedValue(true)
    })
}))

vi.mock('../../../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue(mockFacilities)
    })
}))

describe('Operational Staff Page', () => {
    it('should render page header and operational staff table', async () => {
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
        expect(wrapper.text()).toContain('alice.op@example.com')
        expect(wrapper.text()).toContain('HQ Building')
        expect(wrapper.text()).toContain('Supervisor')
    })
})
