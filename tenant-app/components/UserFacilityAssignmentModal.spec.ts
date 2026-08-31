import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UserFacilityAssignmentModal from './UserFacilityAssignmentModal.vue'

const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    modules: []
}

const mockFacilities = {
    facilities: [
        { id: 'fac-1', name: 'HQ Building', city_details: { name: 'New York' } },
        { id: 'fac-2', name: 'Tech Park', city_details: { name: 'San Francisco' } }
    ],
    count: 2,
    next: null,
    previous: null
}

const getUserFacilities = vi.fn().mockResolvedValue({
    facility_ids: ['fac-1'],
    is_all_facilities: false
})

const assignUserFacilities = vi.fn().mockResolvedValue(true)

vi.mock('../composables/userService', () => ({
    useUserService: () => ({
        getUserFacilities,
        assignUserFacilities
    })
}))

vi.mock('../composables/facilityService', () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue(mockFacilities),
        getAllFacilities: vi.fn().mockResolvedValue(mockFacilities)
    })
}))

vi.mock('ant-design-vue', async () => {
    const actual = await vi.importActual('ant-design-vue')
    return {
        ...actual as any,
        message: {
            success: vi.fn(),
            error: vi.fn(),
            warning: vi.fn()
        }
    }
})

const modalStub = {
    template: '<div class="a-modal"><div class="modal-title">{{ title }}</div><slot name="footer" /><slot /></div>',
    props: ['open', 'title'],
    emits: ['update:open', 'cancel']
}

const checkboxStub = {
    template: '<span class="a-checkbox" @click="$emit(\'change\')"><slot /></span>',
    props: ['checked'],
    emits: ['change']
}

const stubs = {
    'a-modal': modalStub,
    'a-checkbox': checkboxStub,
    'a-button': { template: '<button><slot /></button>' },
    'a-spin': { template: '<div class="a-spin" />' }
}

describe('UserFacilityAssignmentModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('mounts and loads facility state when opened', async () => {
        const wrapper = mount(UserFacilityAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(wrapper.text()).toContain('Manage Facilities - John Doe')
        expect(wrapper.text()).toContain('HQ Building')
        expect(wrapper.text()).toContain('Tech Park')
    })

    it('toggles All facilities and saves', async () => {
        const wrapper = mount(UserFacilityAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const allCheckbox = wrapper.findAll('.a-checkbox').find(b => b.text().includes('All facilities'))
        expect(allCheckbox).toBeDefined()
        await allCheckbox!.trigger('click')

        const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
        expect(saveButton).toBeDefined()
        await saveButton!.trigger('click')

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(assignUserFacilities).toHaveBeenCalledWith('user-1', {
            facility_ids: ['fac-1'],
            is_all_facilities: true
        })
        expect(wrapper.emitted('saved')).toBeTruthy()
    })

    it('toggles a specific facility and saves with correct payload', async () => {
        const wrapper = mount(UserFacilityAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        wrapper.vm.toggleFacility('fac-2')

        const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
        expect(saveButton).toBeDefined()
        await saveButton!.trigger('click')

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(assignUserFacilities).toHaveBeenCalledWith('user-1', {
            facility_ids: expect.arrayContaining(['fac-1', 'fac-2']),
            is_all_facilities: false
        })
        expect(wrapper.emitted('saved')).toBeTruthy()
    })

    it('mounts and displays operational staff with full_name', async () => {
        const mockOpStaff = {
            id: 'staff-1',
            full_name: 'Bob Operator',
            email: 'bob@example.com'
        }

        const wrapper = mount(UserFacilityAssignmentModal, {
            props: {
                user: mockOpStaff,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(wrapper.text()).toContain('Manage Facilities - Bob Operator')
    })
})
