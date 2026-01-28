import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import CompanyDetails from './index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../../../stores/company'

// Mock components
vi.mock('vue-router', () => ({
    useRoute: () => ({
        params: { id: '123' }
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
    'ATooltip': { template: '<div><slot /></div>' },
    'ADivider': { template: '<hr />' },
    'ABadge': { template: '<span></span>' },
    'AForm': { template: '<form><slot /></form>' },
    'AFormItem': { template: '<div><slot /></div>' },
    'AInput': { template: '<input />', props: ['value'], emits: ['update:value'] },
    'AInputNumber': { template: '<input type="number" />', props: ['value'], emits: ['update:value'] }
}

describe('CompanyDetails', () => {
    let wrapper: any
    let store: any

    const mockCompany = {
        id: '123',
        name: 'Test Corp',
        address: '123 Tech Lane',
        spoc_name: 'John Doe',
        spoc_email: 'john@test.com',
        spoc_phone: '555-0123',
        gstin: 'GST123',
        facility: 'HQ'
    }

    const startComponent = () => {
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
    }

    beforeEach(() => {
        vi.clearAllMocks()
        startComponent()
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
            
            const avatar = wrapper.findComponent(AntComponents.AAvatar)
            expect(avatar.exists()).toBe(true)
            expect(avatar.props('src')).toBe('https://example.com/logo.png')
        })
    })

    it('initializes SPOCs from store data', () => {
        expect(wrapper.text()).toContain('John Doe')
        expect(wrapper.text()).toContain('Primary Point of Contact')
        expect(wrapper.text()).toContain('john@test.com')
    })

    describe('Credit Management', () => {
        it('displays credit details', () => {
             // Mock data values from component
            expect(wrapper.text()).toContain('5000') // Allotted
            expect(wrapper.text()).toContain('1200') // Used
            expect(wrapper.text()).toContain('3800') // Balance
        })

        it('opens edit credit modal', async () => {
            const buttons = wrapper.findAllComponents(AntComponents.AButton)
            const editCreditBtn = buttons.find((btn: any) => {
                 return btn.attributes('class')?.includes('text-indigo-600') && btn.findComponent({ name: 'EditOutlined' }).exists()
            })
            
            await editCreditBtn.trigger('click')
            
            const visibleModals = wrapper.findAllComponents(AntComponents.AModal).filter((m: any) => m.props('open') === true)
            expect(visibleModals.length).toBeGreaterThan(0)
            expect(visibleModals[0].props('title')).toBe('Edit Credits')
        })

        it('opens history drawer', async () => {
            const buttons = wrapper.findAllComponents(AntComponents.AButton)
            const historyBtn = buttons.find((btn: any) => btn.findComponent({ name: 'HistoryOutlined' }).exists())
            await historyBtn.trigger('click')
            
            const drawer = wrapper.findComponent(AntComponents.ADrawer)
            expect(drawer.exists()).toBe(true)
            expect(drawer.props('open')).toBe(true)
        })
    })

    describe('SPOC Management', () => {
        it('opens add SPOC modal', async () => {
            const buttons = wrapper.findAllComponents(AntComponents.AButton)
            const addBtn = buttons.find((btn: any) => btn.text().trim() === 'Add SPOC')
            await addBtn.trigger('click')

            const visibleModals = wrapper.findAllComponents(AntComponents.AModal).filter((m: any) => m.props('open') === true)
            expect(visibleModals[0].props('title')).toBe('Add SPOC')
        })

        it('adds a new SPOC', async () => {
            // Open modal
            const buttons = wrapper.findAllComponents(AntComponents.AButton)
            const addBtn = buttons.find((btn: any) => btn.text().trim() === 'Add SPOC')
            await addBtn.trigger('click')

            const modal = wrapper.findAllComponents(AntComponents.AModal).find((m: any) => m.props('title') === 'Add SPOC')
            
            // Set data using Object.assign to preserve reactivity
            Object.assign(wrapper.vm.spocForm, {
                name: 'New Spoc',
                email: 'new@spoc.com',
                phone: '123456',
                designation: 'Manager'
            })
            
            // Emit ok
            await modal.vm.$emit('ok')
            await wrapper.vm.$nextTick() // Ensure DOM updates

            expect(wrapper.text()).toContain('New Spoc')
            expect(wrapper.text()).toContain('Manager')
        })
    })
})
