import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HelpdeskTab from '../../components/configure/HelpdeskTab.vue'
import ConfigTable from '../../components/configure/ConfigTable.vue'

const mockCategories = [
    { id: 'cat-1', name: 'Electrical', key: 'electrical', description: 'Electrical issues' }
]

const mockSubcategories = [
    {
        id: 'subcat-1',
        category: 'cat-1',
        category_name: 'Electrical',
        name: 'Lighting',
        key: 'lighting',
        default_priority: 'p-1',
        assignment_mode: 'mode-auto',
        assignment_mode_key: 'auto',
        required_role: 'role-1',
        response_sla: 60,
        resolution_sla: 120
    }
]

const mockRoles = [
    { id: 'role-1', name: 'Technician', key: 'technician', description: 'Tech role', display_order: 1 },
    { id: 'role-2', name: 'Supervisor', key: 'supervisor', description: 'Supervisor role', display_order: 2 }
]

const mockPriorities = [
    { id: 'p-1', label: 'High', key: 'high', level: 1, color: '#f5222d' }
]

const mockAssignmentModes = [
    { id: 'mode-manual', name: 'Manual', key: 'manual', description: 'Manual assignment', display_order: 1 },
    { id: 'mode-auto', name: 'Auto Assign', key: 'auto', description: 'Auto assignment', display_order: 2 },
    { id: 'mode-scope-ladder', name: 'ScopeLadder', key: 'scope_ladder', description: 'ScopeLadder assignment', display_order: 3 }
]

const mockGetCategories = vi.fn()
const mockGetSubCategories = vi.fn()
const mockGetRoles = vi.fn()
const mockGetPriorities = vi.fn()
const mockGetAssignmentModes = vi.fn()
const mockCreateSubCategory = vi.fn()
const mockUpdateSubCategory = vi.fn()
const mockDeleteSubCategory = vi.fn()

vi.mock('../../composables/helpdeskService', () => ({
    useHelpdeskService: () => ({
        getCategories: mockGetCategories,
        getSubCategories: mockGetSubCategories,
        getRoles: mockGetRoles,
        getPriorities: mockGetPriorities,
        getAssignmentModes: mockGetAssignmentModes,
        createSubCategory: mockCreateSubCategory,
        updateSubCategory: mockUpdateSubCategory,
        deleteSubCategory: mockDeleteSubCategory,
        createCategory: vi.fn(),
        updateCategory: vi.fn(),
        deleteCategory: vi.fn()
    })
}))

describe('HelpdeskTab Component', () => {
    beforeAll(() => {
        if (typeof globalThis.requestAnimationFrame === 'undefined') {
            globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0) as any
        }
    })

    beforeEach(() => {
        vi.clearAllMocks()
        mockGetCategories.mockResolvedValue(mockCategories)
        mockGetSubCategories.mockResolvedValue(mockSubcategories)
        mockGetRoles.mockResolvedValue(mockRoles)
        mockGetPriorities.mockResolvedValue(mockPriorities)
        mockGetAssignmentModes.mockResolvedValue(mockAssignmentModes)
    })

    it('mounts and loads roles, assignment modes, categories, and subcategories without runtime errors', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        expect(mockGetCategories).toHaveBeenCalled()
        expect(mockGetSubCategories).toHaveBeenCalled()
        expect(mockGetRoles).toHaveBeenCalled()
        expect(mockGetPriorities).toHaveBeenCalled()
        expect(mockGetAssignmentModes).toHaveBeenCalled()
        expect(wrapper.exists()).toBe(true)
    })

    it('injects required_role field into subcategory fields when assignment mode is auto', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        // Switch to Subcategory tab
        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        // Find the Subcategories ConfigTable
        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')
        expect(subcatTable).toBeDefined()

        // By default no assignment mode is selected, so required_role is absent
        let fields = subcatTable.props('fields') as any[]
        expect(fields.find(f => f.name === 'required_role')).toBeUndefined()

        // Simulate fieldChange event with assignment_mode = 'mode-auto'
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-auto')

        // Now required_role should be present in fields
        fields = subcatTable.props('fields') as any[]
        const roleField = fields.find(f => f.name === 'required_role')
        expect(roleField).toBeDefined()
        expect(roleField.label).toBe('Required Role')
        expect(roleField.type).toBe('select')
        expect(roleField.options).toEqual([
            { label: 'Technician', value: 'role-1' },
            { label: 'Supervisor', value: 'role-2' }
        ])
    })

    it('handles object-based fieldChange emitted by ConfigTable when editing an auto subcategory', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // ConfigTable emits watch(formData) as an entire object
        await subcatTable.vm.$emit('fieldChange', {
            name: 'Lighting',
            assignment_mode: 'mode-auto',
            required_role: 'role-1'
        })

        const fields = subcatTable.props('fields') as any[]
        expect(fields.find(f => f.name === 'required_role')).toBeDefined()
    })

    it('fetches roles if roles are empty when auto assignment mode is selected', async () => {
        // Start with empty roles initially
        mockGetRoles.mockResolvedValueOnce([])
        mockGetRoles.mockResolvedValueOnce(mockRoles)

        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        expect(mockGetRoles).toHaveBeenCalledTimes(1)

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // Selecting auto mode triggers role fetch if roles list is empty
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-auto')

        expect(mockGetRoles).toHaveBeenCalledTimes(2)
    })

    it('removes required_role field when assignment mode is switched back to manual', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // Set to auto
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-auto')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()

        // Set back to manual
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-manual')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeUndefined()
    })

    it('injects required_role field into subcategory fields when assignment mode is scopeladder', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // By default no assignment mode is selected, so required_role is absent
        let fields = subcatTable.props('fields') as any[]
        expect(fields.find(f => f.name === 'required_role')).toBeUndefined()

        // Simulate fieldChange event with assignment_mode = 'mode-scope-ladder'
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-scope-ladder')

        // Now required_role should be present in fields
        fields = subcatTable.props('fields') as any[]
        const roleField = fields.find(f => f.name === 'required_role')
        expect(roleField).toBeDefined()
        expect(roleField.label).toBe('Required Role')
        expect(roleField.type).toBe('select')
        expect(roleField.options).toEqual([
            { label: 'Technician', value: 'role-1' },
            { label: 'Supervisor', value: 'role-2' }
        ])
    })

    it('handles object-based fieldChange emitted by ConfigTable when editing a scopeladder subcategory', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // ConfigTable emits watch(formData) as an entire object
        await subcatTable.vm.$emit('fieldChange', {
            name: 'Power Backup',
            assignment_mode: 'mode-scope-ladder',
            required_role: 'role-2'
        })

        const fields = subcatTable.props('fields') as any[]
        expect(fields.find(f => f.name === 'required_role')).toBeDefined()
    })

    it('fetches roles if roles are empty when scopeladder assignment mode is selected', async () => {
        mockGetRoles.mockResolvedValueOnce([])
        mockGetRoles.mockResolvedValueOnce(mockRoles)

        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        expect(mockGetRoles).toHaveBeenCalledTimes(1)

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // Selecting scopeladder mode triggers role fetch if roles list is empty
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-scope-ladder')

        expect(mockGetRoles).toHaveBeenCalledTimes(2)
    })

    it('removes required_role field when assignment mode is switched from scopeladder back to manual', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!
        expect(subcatTable).toBeDefined()

        // Set to scopeladder
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-scope-ladder')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()

        // Set back to manual
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-manual')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeUndefined()
    })

    it('injects required_role field when assignment mode is scopladder or scope_ladder_dispatch', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!

        // Test with "scopladder" key
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'scopladder')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()

        // Test with "scope_ladder_dispatch" key
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'scope_ladder_dispatch')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()

        // Test with UUID 00000000-0000-0000-0000-000000000302
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', '00000000-0000-0000-0000-000000000302')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()
    })

    it('handles editing subcategory when assignment_mode_key is scopeladder even if assignment_mode is undefined', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!

        await subcatTable.vm.$emit('fieldChange', {
            name: 'HVAC Maintenance',
            assignment_mode_key: 'scope_ladder',
            required_role: 'role-1'
        })

        const fields = subcatTable.props('fields') as any[]
        expect(fields.find(f => f.name === 'required_role')).toBeDefined()
    })

    it('resets required_role when modal is closed or add modal opened emitting empty object', async () => {
        const wrapper = await mountSuspended(HelpdeskTab, {
            props: {
                canCreate: true,
                canUpdate: true,
                canDelete: true
            }
        })

        ;(wrapper.vm as any).activeSubTab = 'subcategory'
        await wrapper.vm.$nextTick()

        const tables = wrapper.findAllComponents(ConfigTable)
        const subcatTable = tables.find(t => t.props('title') === 'Subcategories')!

        // Select ScopeLadder mode
        await subcatTable.vm.$emit('fieldChange', 'assignment_mode', 'mode-scope-ladder')
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeDefined()

        // Modal closed/cleared
        await subcatTable.vm.$emit('fieldChange', {})
        expect(subcatTable.props('fields').find((f: any) => f.name === 'required_role')).toBeUndefined()
    })
})
