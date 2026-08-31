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
    }
]

const mockGetRoles = vi.fn()
const mockCreateRole = vi.fn()
const mockUpdateRole = vi.fn()
const mockDeleteRole = vi.fn()

vi.mock('../../composables/helpdeskService', () => ({
    useHelpdeskService: () => ({
        getRoles: mockGetRoles,
        createRole: mockCreateRole,
        updateRole: mockUpdateRole,
        deleteRole: mockDeleteRole
    })
}))

describe('Helpdesk Roles Page', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetRoles.mockResolvedValue(mockRoles)
    })

    it('should render Helpdesk Roles page with header and roles table when user has view permission', async () => {
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
        expect(wrapper.text()).toContain('Manage helpdesk roles and operational hierarchy.')
        expect(mockGetRoles).toHaveBeenCalled()
        expect(wrapper.text()).toContain('Technician')
        expect(wrapper.text()).toContain('Facility Lead')
    })

    it('should show "Add Role" button when user has create permission and hide it when lacking permission', async () => {
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
