import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HelpdeskRolesPage from '../../app/pages/helpdesk/roles/index.vue'
import { createTestingPinia } from '@pinia/testing'

const mockRoles = [
    {
        id: 'role-1',
        key: 'technician',
        name: 'Technician',
        description: 'Handles technical support tickets',
        display_order: 1,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'role-2',
        key: 'facility_lead',
        name: 'Facility Lead',
        description: 'Supervises facility operations',
        display_order: 2,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
    },
    {
        id: 'role-sys-1',
        key: 'ROLE_HELPDESK_AUTHORIZED_PERSON',
        name: 'Authorized Person',
        description: 'System authorized personnel for escalation',
        display_order: 3,
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-01-01T00:00:00Z'
    }
]

const mockGetRoles = vi.fn()
const mockCreateRole = vi.fn()
const mockUpdateRole = vi.fn()
const mockDeleteRole = vi.fn()
const mockBulkAssignRoleUsers = vi.fn()
const mockAssignUsersToSystemRole = vi.fn()

vi.mock('../../composables/helpdeskService', () => ({
    useHelpdeskService: () => ({
        getRoles: mockGetRoles,
        createRole: mockCreateRole,
        updateRole: mockUpdateRole,
        deleteRole: mockDeleteRole,
        bulkAssignRoleUsers: mockBulkAssignRoleUsers,
        assignUsersToSystemRole: mockAssignUsersToSystemRole
    })
}))

const mockGetUsers = vi.fn()
const mockGetOperationalStaff = vi.fn()

vi.mock('../../composables/userService', () => ({
    useUserService: () => ({
        getUsers: mockGetUsers,
        getOperationalStaff: mockGetOperationalStaff
    })
}))

describe('Helpdesk Roles Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetRoles.mockResolvedValue(mockRoles)
        mockGetUsers.mockResolvedValue([
            { id: 'mgt-1', name: 'Alice Manager', email: 'alice@example.com' },
            { id: 'mgt-2', name: 'Bob Admin', email: 'bob@example.com' }
        ])
        mockGetOperationalStaff.mockResolvedValue({
            results: [
                { id: 'ops-1', full_name: 'John Tech', email: 'john@example.com' },
                { id: 'ops-2', full_name: 'Jane Clean', email: 'jane@example.com' }
            ],
            count: 2
        })
    })

    it('should render Helpdesk Roles page with header and tabs when user has view permission', async () => {
        const wrapper = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view', 'helpdesk-roles:create']
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Helpdesk Roles')
        expect(wrapper.text()).toContain('Manage helpdesk roles, authorized persons, and user assignments.')
        expect(mockGetRoles).toHaveBeenCalled()
        expect(wrapper.text()).toContain('Operational Roles')
        expect(wrapper.text()).toContain('Authorized Person')
        // On initial operational tab:
        expect(wrapper.text()).toContain('Technician')
        expect(wrapper.text()).toContain('Facility Lead')
        // System role should not be listed in operational tab
        expect(wrapper.text()).not.toContain('ROLE_HELPDESK_AUTHORIZED_PERSON')
    })

    it('should separate ROLE_HELPDESK_AUTHORIZED_PERSON into Authorized Person tab without edit and delete actions', async () => {
        const wrapper = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view', 'helpdesk-roles:create', 'helpdesk-roles:update', 'helpdesk-roles:delete']
                        }
                    }
                })]
            }
        })

        // Find the tabs and switch to Authorized Person
        const tabs = wrapper.findAll('.ant-tabs-tab')
        const systemTab = tabs.find(t => t.text().includes('Authorized Person'))
        expect(systemTab).toBeDefined()

        if (systemTab) {
            await systemTab.trigger('click')
            await wrapper.vm.$nextTick()
        }

        // Verify system role is displayed
        expect(wrapper.text()).toContain('Authorized Person')
        expect(wrapper.text()).toContain('System Role')

        // System role should not display the Add Role button when in system tab
        expect(wrapper.text()).not.toContain('Add Role')
    })

    it('should show "Add Role" button when user has create permission and in operational tab, hide it when lacking permission', async () => {
        const wrapperWithPermission = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view', 'helpdesk-roles:create']
                        }
                    }
                })]
            }
        })
        expect(wrapperWithPermission.text()).toContain('Add Role')

        const wrapperWithoutPermission = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view']
                        }
                    }
                })]
            }
        })
        expect(wrapperWithoutPermission.text()).not.toContain('Add Role')
    })

    it('should open assign users modal and list operational staff for regular roles', async () => {
        const wrapper = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view', 'helpdesk-roles:update']
                        }
                    }
                })]
            }
        })

        // Call the openAssignUsersModal method directly for technician
        const technicianRole = mockRoles[0]
        await (wrapper.vm as any).openAssignUsersModal(technicianRole)
        await wrapper.vm.$nextTick()

        expect((wrapper.vm as any).assignModalVisible).toBe(true)
        expect(mockGetOperationalStaff).toHaveBeenCalledWith({ page_size: 9999 })
        expect((wrapper.vm as any).assignableUsers.length).toBe(2)
        expect((wrapper.vm as any).assignableUsers[0].name).toBe('John Tech')

        // Assign users and trigger save
        ;(wrapper.vm as any).selectedUserIds = ['ops-1', 'ops-2']
        await (wrapper.vm as any).handleSaveAssignUsers()

        expect(mockBulkAssignRoleUsers).toHaveBeenCalledWith({
            role_id: 'role-1',
            user_ids: ['ops-1', 'ops-2']
        })
    })

    it('should open assign users modal and list management staff for system role', async () => {
        const wrapper = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk', 'helpdesk-roles'],
                            permissions: ['helpdesk-roles:view', 'helpdesk-roles:update']
                        }
                    }
                })]
            }
        })

        // Call the openAssignUsersModal method directly for ROLE_HELPDESK_AUTHORIZED_PERSON
        const systemRole = mockRoles[2]
        await (wrapper.vm as any).openAssignUsersModal(systemRole)
        await wrapper.vm.$nextTick()

        expect((wrapper.vm as any).assignModalVisible).toBe(true)
        expect(mockGetUsers).toHaveBeenCalled()
        expect((wrapper.vm as any).assignableUsers.length).toBe(2)
        expect((wrapper.vm as any).assignableUsers[0].name).toBe('Alice Manager')

        // Assign users and trigger save
        ;(wrapper.vm as any).selectedUserIds = ['mgt-1']
        await (wrapper.vm as any).handleSaveAssignUsers()

        expect(mockAssignUsersToSystemRole).toHaveBeenCalledWith({
            role_id: 'role-sys-1',
            user_ids: ['mgt-1']
        })
    })

    it('should show unauthorized message if user lacks view permission', async () => {
        const wrapper = await mountSuspended(HelpdeskRolesPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: {
                            modules: ['helpdesk'],
                            permissions: []
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('You do not have permission to view Helpdesk Roles')
    })
})
