import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyCreatePage from '../../app/pages/companies/create.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../stores/company'

// Mock router for redirect
const mockPush = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-ignore
        ...actual,
        useRouter: () => ({ push: mockPush })
    }
})

// Mock ant-design-vue message
vi.mock('ant-design-vue', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        // @ts-ignore
        ...actual,
        message: {
            success: vi.fn(),
            error: vi.fn()
        }
    }
})

describe('Company Create Page', () => {
    it('should render create form', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Check for page title
        expect(wrapper.text()).toContain('Create Company')
        
        // Check for form labels (updated form fields)
        expect(wrapper.text()).toContain('Company Name')
        expect(wrapper.text()).toContain('Address')
        expect(wrapper.text()).toContain('Contact Name')
        expect(wrapper.text()).toContain('Email')
        expect(wrapper.text()).toContain('Phone')
        
        // Check for submit button
        expect(wrapper.text()).toContain('Create Company')
    })

    it('should render form with input fields', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Ant Design inputs - should have multiple fields now
        const inputs = wrapper.findAll('input')
        expect(inputs.length).toBeGreaterThanOrEqual(5) // name, spoc_name, spoc_email, spoc_phone, gstin
    })

    it('should have cancel and submit buttons', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        expect(wrapper.text()).toContain('Cancel')
        expect(wrapper.text()).toContain('Create Company')
    })

    it('should render contact details section', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Check for section dividers
        expect(wrapper.text()).toContain('Contact Details')
        
        // Check for business fields
        expect(wrapper.text()).toContain('GSTIN')
    })

    it('should render company logo upload', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Check for logo upload field
        expect(wrapper.text()).toContain('Company Logo')
    })
})
