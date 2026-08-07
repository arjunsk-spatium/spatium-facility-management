import { mount } from '@vue/test-utils'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UserModuleAssignmentModal from './UserModuleAssignmentModal.vue'

const mockSystemModules = [
    {
        id: 'mod-1',
        module: 'Visitors',
        submodules: [
            {
                id: 'sub-1',
                name: 'All Visitors',
                permissions: [
                    { id: 'perm-1', name: 'View', key: 'view' },
                    { id: 'perm-2', name: 'Create', key: 'create' }
                ],
                features: []
            }
        ]
    }
]

const mockUser = {
    id: 'user-1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin',
    modules: []
}

const assignModulesToUser = vi.fn().mockResolvedValue(true)

vi.mock('../composables/userService', () => ({
    useUserService: () => ({
        getAllSystemModules: vi.fn().mockResolvedValue(mockSystemModules),
        getUserAssignedModules: vi.fn().mockResolvedValue({ submodules: ['perm-1'], features: [] }),
        assignModulesToUser
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
    template: '<span class="a-checkbox"><slot /></span>',
    props: ['checked', 'indeterminate'],
    emits: ['change']
}

const stubs = {
    'a-modal': modalStub,
    'a-checkbox': checkboxStub,
    'a-button': { template: '<button><slot /></button>' }
}

describe('UserModuleAssignmentModal', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('mounts and loads module state when opened', async () => {
        const wrapper = mount(UserModuleAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(wrapper.text()).toContain('Manage Access - John Doe')
        expect(wrapper.text()).toContain('Visitors')
        expect(wrapper.text()).toContain('All Visitors')
    })

    it('toggles a permission badge and saves', async () => {
        const wrapper = mount(UserModuleAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const badges = wrapper.findAll('span.cursor-pointer')
        const createBadge = badges.find(b => b.text() === 'Create')
        expect(createBadge).toBeDefined()
        await createBadge!.trigger('click')

        const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
        expect(saveButton).toBeDefined()
        await saveButton!.trigger('click')

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(assignModulesToUser).toHaveBeenCalledWith('user-1', expect.arrayContaining(['perm-1', 'perm-2']), [])
        expect(wrapper.emitted('saved')).toBeTruthy()
    })
})
