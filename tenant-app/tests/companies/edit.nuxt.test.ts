import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyEditPage from '../../app/pages/companies/[id]/edit.vue'
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

describe('Company Edit Page', () => {
    it('should render edit form', async () => {
        const wrapper = await mountSuspended(CompanyEditPage, {
            route: { params: { id: '1' } },
            global: {
                plugins: [createTestingPinia({ 
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: { id: '1', name: 'Test Corp', address: '123 Main St', status: 'active' }
                        }
                    }
                })]
            }
        })
        
        // Check for page title
        expect(wrapper.text()).toContain('Edit Company')
        
        // Check for form labels
        expect(wrapper.text()).toContain('Company Name')
        expect(wrapper.text()).toContain('Address')
    })

    it('should call fetchCompany on mount', async () => {
        const wrapper = await mountSuspended(CompanyEditPage, {
            route: { params: { id: '1' } },
            global: {
                plugins: [createTestingPinia({ 
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: { id: '1', name: 'Original Name', address: 'Old Addr', status: 'active' }
                        }
                    }
                })]
            }
        })
        
        const store = useCompanyStore()
        expect(store.fetchCompany).toHaveBeenCalledWith('1')
    })
    
    it('should have update and cancel buttons', async () => {
        const wrapper = await mountSuspended(CompanyEditPage, {
            route: { params: { id: '1' } },
            global: {
                plugins: [createTestingPinia({ 
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: { id: '1', name: 'Name', address: 'Addr', status: 'active' }
                        }
                    } 
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Cancel')
        expect(wrapper.text()).toContain('Save Changes')
    })
})

