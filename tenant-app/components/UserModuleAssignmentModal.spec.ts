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
                features: [
                    {
                        id: 'feat-1',
                        name: 'Export Data',
                        permissions: [
                            { id: 'feat-perm-1', name: 'Export', key: 'export' }
                        ]
                    }
                ]
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
const getUserAssignedModules = vi.fn().mockResolvedValue({ submodules: ['perm-1'], features: [] })
const getAllSystemModules = vi.fn().mockResolvedValue(mockSystemModules)

vi.mock('../composables/userService', () => ({
    useUserService: () => ({
        getAllSystemModules,
        getUserAssignedModules,
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
        getUserAssignedModules.mockResolvedValue({ submodules: ['perm-1'], features: [] })
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

        const badges = wrapper.findAll('span')
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

    it('automatically selects View permission when non-view permission (e.g. Create) is selected', async () => {
        getUserAssignedModules.mockResolvedValueOnce({ submodules: [], features: [] })

        const wrapper = mount(UserModuleAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const badges = wrapper.findAll('span')
        const createBadge = badges.find(b => b.text() === 'Create')
        expect(createBadge).toBeDefined()
        await createBadge!.trigger('click')

        const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
        expect(saveButton).toBeDefined()
        await saveButton!.trigger('click')

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(assignModulesToUser).toHaveBeenCalledWith('user-1', expect.arrayContaining(['perm-1', 'perm-2']), [])
    })

    it('automatically selects View permission when a feature permission is selected', async () => {
        getUserAssignedModules.mockResolvedValueOnce({ submodules: [], features: [] })

        const wrapper = mount(UserModuleAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const badges = wrapper.findAll('span')
        const exportBadge = badges.find(b => b.text() === 'Export')
        expect(exportBadge).toBeDefined()
        await exportBadge!.trigger('click')

        const saveButton = wrapper.findAll('button').find(b => b.text().includes('Save Changes'))
        expect(saveButton).toBeDefined()
        await saveButton!.trigger('click')

        await new Promise(resolve => setTimeout(resolve, 0))

        expect(assignModulesToUser).toHaveBeenCalledWith('user-1', expect.arrayContaining(['perm-1']), expect.arrayContaining(['feat-perm-1']))
    })

    it('disables View permission when non-view permission is selected, and re-enables it when unselected', async () => {
        getUserAssignedModules.mockResolvedValueOnce({ submodules: [], features: [] })

        const wrapper = mount(UserModuleAssignmentModal, {
            props: {
                user: mockUser,
                open: true
            },
            global: { stubs }
        })

        await new Promise(resolve => setTimeout(resolve, 0))

        const badges = wrapper.findAll('span')
        const viewBadge = badges.find(b => b.text() === 'View')!
        const createBadge = badges.find(b => b.text() === 'Create')!

        // Initially View is enabled (cursor-pointer) and unassigned
        expect(viewBadge.classes()).toContain('cursor-pointer')

        // Click Create -> View should auto-select and become disabled (cursor-not-allowed)
        await createBadge.trigger('click')
        expect(viewBadge.classes()).toContain('cursor-not-allowed')
        expect(viewBadge.classes()).toContain('opacity-60')

        // Clicking View while disabled should NOT toggle it off
        await viewBadge.trigger('click')
        expect(viewBadge.classes()).toContain('cursor-not-allowed')

        // Unselect Create -> View should become enabled (cursor-pointer) again
        await createBadge.trigger('click')
        expect(viewBadge.classes()).toContain('cursor-pointer')
        expect(viewBadge.classes()).not.toContain('cursor-not-allowed')
    })
})
