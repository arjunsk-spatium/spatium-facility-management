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
        
        // Check for form labels (Ant Design renders labels)
        expect(wrapper.text()).toContain('Company Name')
        expect(wrapper.text()).toContain('Address')
        expect(wrapper.text()).toContain('Status')
        
        // Check for submit button
        expect(wrapper.text()).toContain('Create Company')
    })

    it('should render form with input fields', async () => {
        const wrapper = await mountSuspended(CompanyCreatePage, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        
        // Ant Design inputs can be found by their class or the wrapper
        const inputs = wrapper.findAll('input')
        expect(inputs.length).toBeGreaterThanOrEqual(2) // name and address
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
})

