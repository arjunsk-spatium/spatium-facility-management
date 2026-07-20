import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CompanyDetails from './index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../../../stores/company'
import { message } from 'ant-design-vue'

// Mock components
vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: { id: '123' }
    })
}))

const mockApi = vi.fn(async (url: string) => {
    if (url.includes('wallet-transactions')) {
        return {
            success: true,
            data: {
                company_id: '123',
                company_name: 'Test Corp',
                current_balance: 10,
                total_transactions: 1,
                transactions: [
                    {
                        id: 'txn-1',
                        transaction_type: 'credit',
                        credits: 20,
                        balance_after: 20,
                        reference_type: 'balance_reset',
                        reference_id: '11029c75-0aa3-4b52-bd7d-fb3b0a705830',
                        metadata: { reason: 'New balance credited' },
                        created_at: '2026-01-21T12:00:00Z',
                        company_name: 'Test Corp',
                        wallet_balance: 10
                    }
                ],
                pagination: { limit: 50, offset: 0, total: 1, has_more: false }
            }
        }
    }
    if (url.includes('client_portal') && !url.includes('wallet-transactions')) {
        return {
            success: true,
            data: [{
                id: 'spoc-1',
                full_name: 'John Doe',
                email: 'john@test.com',
                phone_number: '555-0123',
                apps: ['client portal']
            }]
        }
    }
    if (url.includes('wallets')) {
        return {
            success: true,
            data: [{ monthly_credit_allocation: 5000, balance: 3800 }]
        }
    }
    return { success: true, data: [] }
})

vi.mock('#app', () => ({
    useNuxtApp: () => ({
        $api: mockApi
    })
}))

vi.mock('nuxt/app', () => ({
    useNuxtApp: () => ({
        $api: mockApi
    })
}))

vi.mock('../../../../composables/useAuthFetch', () => ({
    useAuthFetch: () => ({
        authFetch: vi.fn().mockResolvedValue({ success: true, data: [] })
    })
}))

vi.mock('../../../../composables/tenantService', () => ({
    useTenantService: () => ({
        getTenantConfig: vi.fn().mockResolvedValue({ credit_system_enabled: true }),
        getCurrentTenantId: vi.fn().mockReturnValue('tenant-1')
    })
}))

vi.mock('../../../../composables/useTheme', () => ({
    useTheme: () => ({
        isDark: { value: false }
    })
}))

vi.mock('../../../../components/ResponsiveDataView.vue', () => ({
    default: {
        name: 'ResponsiveDataView',
        template: '<div><slot name="bodyCell" :column="{key: \'status\'}" :record="{status: \'Active\'}" /></div>',
        props: ['data', 'columns']
    }
}))

// Mock Ant Design components (PascalCase for reliable matching)
const AntComponents = {
    'AButton': { template: '<button type="button"><slot /></button>' },
    'ATag': { template: '<span><slot /></span>' },
    'ASpin': { template: '<div>Loading...</div>' },
    'ARow': { template: '<div><slot /></div>' },
    'ACol': { template: '<div><slot /></div>' },
    'ACard': { template: '<div><slot /><slot name="title" /><slot name="extra" /></div>' },
    'ADescriptions': { template: '<div><slot /></div>' },
    'ADescriptionsItem': { template: '<div><slot /></div>' },
    'AModal': { 
        template: '<div v-if="open" class="mock-modal"><slot /></div>',
        props: ['open', 'title'],
        emits: ['ok', 'update:open']
    },
    'ADrawer': {
        template: '<div v-if="open" class="mock-drawer"><slot /></div>',
        props: ['open', 'title'],
        emits: ['update:open']
    },
    'ATable': { 
        props: ['dataSource', 'columns'],
        template: `
            <table>
                <tbody>
                    <tr v-for="(record, r) in dataSource" :key="r">
                        <td v-for="(col, c) in columns" :key="c">
                            <slot name="bodyCell" :column="col" :record="record"></slot>
                        </td>
                    </tr>
                </tbody>
            </table>
        `
    },
    'AProgress': { template: '<div></div>' },
    'AAvatar': { name: 'AAvatar', template: '<div><slot /></div>', props: ['src', 'size'] },
    'ATooltip': { template: '<div><slot /></div>', props: ['title'] },
    'ADivider': { template: '<hr />' },
    'ABadge': { template: '<span></span>' },
    'AForm': { template: '<form><slot /></form>' },
    'AFormItem': { template: '<div><slot /></div>' },
    'AInput': { template: '<input />', props: ['value'], emits: ['update:value'] },
    'AInputNumber': { template: '<input type="number" />', props: ['value'], emits: ['update:value'] },
    'ASelect': { template: '<select><slot /></select>', props: ['value'], emits: ['update:value'] },
    'ASelectOption': { template: '<option><slot /></option>', props: ['value'] }
}

describe('CompanyDetails', () => {
    let wrapper: any
    let store: any

    const mockCompany = {
        id: '123',
        name: 'Test Corp',
        status: 'active',
        contacts: [{
            contact_name: 'John Doe',
            email: 'john@test.com',
            phone: '555-0123',
            address: '123 Tech Lane',
            gstin: 'GST123'
        }],
        facility: 'HQ'
    }

    const startComponent = async () => {
        wrapper = mount(CompanyDetails, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: mockCompany,
                            loading: false
                        }
                    }
                })],
                stubs: {
                    NuxtLink: { template: '<a><slot /></a>' },
                    ...AntComponents,
                    EditOutlined: true,
                    ArrowLeftOutlined: true,
                    MailOutlined: true,
                    PhoneOutlined: true,
                    HistoryOutlined: true,
                    DeleteOutlined: true
                }
            }
        })
        store = useCompanyStore()
        await wrapper.vm.$nextTick()
        // wait for onMounted promises to resolve
        await new Promise(resolve => setTimeout(resolve, 0))
    }

    beforeEach(async () => {
        vi.clearAllMocks()
        vi.spyOn(message, 'error').mockImplementation(() => {})
        vi.spyOn(message, 'success').mockImplementation(() => {})
        await startComponent()
    })

    it('renders company information correctly', () => {
        expect(wrapper.text()).toContain('Test Corp')
        expect(wrapper.text()).toContain('123 Tech Lane')
        expect(wrapper.text()).toContain('GST123')
    })

    describe('Company Logo', () => {
        it('renders logo avatar with initials when no URL provided', () => {
            const avatar = wrapper.findComponent(AntComponents.AAvatar)
            expect(avatar.exists()).toBe(true)
            expect(avatar.text()).toContain('TC') // Test Corp -> TC
        })

        it('renders logo image when URL is provided', async () => {
            // Update store state with logo
            store.currentCompany.logo = 'https://example.com/logo.png'
            await wrapper.vm.$nextTick()
            
            const img = wrapper.find('img')
            expect(img.exists()).toBe(true)
            expect(img.attributes('src')).toBe('https://example.com/logo.png')
        })
    })

    it('initializes SPOCs from API data', () => {
        expect(wrapper.text()).toContain('John Doe')
        expect(wrapper.text()).toContain('SPOC')
        expect(wrapper.text()).toContain('john@test.com')
    })

    describe('Credit Management', () => {
        it('displays credit details', () => {
            expect(wrapper.text()).toContain('5000') // Allotted
            expect(wrapper.text()).toContain('1200') // Used
            expect(wrapper.text()).toContain('3800') // Balance
        })

        it('opens edit credit modal', async () => {
            await wrapper.vm.openCreditModal()
            await wrapper.vm.$nextTick()
            
            const visibleModals = wrapper.findAllComponents(AntComponents.AModal).filter((m: any) => m.props('open') === true)
            expect(visibleModals.length).toBeGreaterThan(0)
            expect(visibleModals[0].props('title')).toBe('Edit Credits')
        })

        it('opens history drawer and fetches transactions', async () => {
            await wrapper.vm.openHistoryDrawer()
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 0))
            
            const drawer = wrapper.findComponent(AntComponents.ADrawer)
            expect(drawer.exists()).toBe(true)
            expect(drawer.props('open')).toBe(true)
            expect(mockApi).toHaveBeenCalledWith(
                expect.stringContaining('wallet-transactions')
            )
        })
    })

    describe('SPOC Management', () => {
        it('opens add SPOC modal', async () => {
            await wrapper.vm.openAddSpocModal()
            await wrapper.vm.$nextTick()

            const visibleModals = wrapper.findAllComponents(AntComponents.AModal).filter((m: any) => m.props('open') === true)
            expect(visibleModals[0].props('title')).toBe('Add SPOC')
        })

        it('adds a new SPOC', async () => {
            await wrapper.vm.openAddSpocModal()
            
            wrapper.vm.spocForm.full_name = 'New Spoc'
            wrapper.vm.spocForm.email = 'new@spoc.com'
            wrapper.vm.spocForm.phone_number = '123456'
            
            await wrapper.vm.handleSpocOk()
            
            expect(mockApi).toHaveBeenCalledWith('/api/portal/users/org_portal/create/', expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({ full_name: 'New Spoc' })
            }))
        })

        it('shows existing user confirmation when SPOC user_id error is returned', async () => {
            const error = new Error('Failed to create user') as any
            error.data = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        user_id: [{ code: 'INVALID', message: 'existing-user-id' }],
                        email: [{ code: 'INVALID', message: 'User already exists in another app.' }]
                    }
                }
            }
            error.statusCode = 400
            mockApi.mockRejectedValueOnce(error)

            await wrapper.vm.openAddSpocModal()
            wrapper.vm.spocForm.full_name = 'Existing Spoc'
            wrapper.vm.spocForm.email = 'existing@spoc.com'
            wrapper.vm.spocForm.phone_number = '123456'

            await wrapper.vm.handleSpocOk()

            expect(wrapper.vm.existingUserConfirmVisible).toBe(true)
            expect(wrapper.vm.existingUserAppName).toBe('client_portal')
            expect(wrapper.vm.existingUserId).toBe('existing-user-id')
        })

        it('shows specific email error when SPOC already exists in a different tenant', async () => {
            const error = new Error('Failed to create user') as any
            error.data = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        email: [{ code: 'INVALID', message: 'User already exists in a different tenant.' }]
                    }
                }
            }
            error.statusCode = 400
            mockApi.mockRejectedValueOnce(error)

            await wrapper.vm.openAddSpocModal()
            wrapper.vm.spocForm.full_name = 'New Spoc'
            wrapper.vm.spocForm.email = 'existing@other.com'
            wrapper.vm.spocForm.phone_number = '123456'

            await wrapper.vm.handleSpocOk()

            expect(message.error).toHaveBeenCalledWith('User already exists in a different tenant.')
        })
    })

    describe('Employee Management', () => {
        it('opens add employee modal', async () => {
            await wrapper.vm.openAddEmployeeModal()
            await wrapper.vm.$nextTick()

            const visibleModals = wrapper.findAllComponents(AntComponents.AModal).filter((m: any) => m.props('open') === true)
            expect(visibleModals[0].props('title')).toBe('Add Employee')
        })

        it('adds a new employee', async () => {
            await wrapper.vm.openAddEmployeeModal()
            
            wrapper.vm.employeeForm.full_name = 'New Employee'
            wrapper.vm.employeeForm.email = 'new@employee.com'
            wrapper.vm.employeeForm.phone_number = '123456'
            
            await wrapper.vm.handleEmployeeOk()
            
            expect(mockApi).toHaveBeenCalledWith('/api/portal/users/org_portal/create/', expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({ full_name: 'New Employee', app_name: 'hub' })
            }))
        })

        it('shows existing user confirmation when employee user_id error is returned', async () => {
            const error = new Error('Failed to create user') as any
            error.data = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        user_id: [{ code: 'INVALID', message: 'existing-user-id' }],
                        email: [{ code: 'INVALID', message: 'User already exists in another app.' }]
                    }
                }
            }
            error.statusCode = 400
            mockApi.mockRejectedValueOnce(error)

            await wrapper.vm.openAddEmployeeModal()
            wrapper.vm.employeeForm.full_name = 'Existing Employee'
            wrapper.vm.employeeForm.email = 'existing@employee.com'
            wrapper.vm.employeeForm.phone_number = '123456'

            await wrapper.vm.handleEmployeeOk()

            expect(wrapper.vm.existingUserConfirmVisible).toBe(true)
            expect(wrapper.vm.existingUserAppName).toBe('hub')
            expect(wrapper.vm.existingUserId).toBe('existing-user-id')
        })

        it('shows specific email error when employee already exists in a different tenant', async () => {
            const error = new Error('Failed to create user') as any
            error.data = {
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        email: [{ code: 'INVALID', message: 'User already exists in a different tenant.' }]
                    }
                }
            }
            error.statusCode = 400
            mockApi.mockRejectedValueOnce(error)

            await wrapper.vm.openAddEmployeeModal()
            wrapper.vm.employeeForm.full_name = 'New Employee'
            wrapper.vm.employeeForm.email = 'existing@other.com'
            wrapper.vm.employeeForm.phone_number = '123456'

            await wrapper.vm.handleEmployeeOk()

            expect(message.error).toHaveBeenCalledWith('User already exists in a different tenant.')
        })
    })
})
