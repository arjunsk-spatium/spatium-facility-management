import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyDetailsPage from '../../app/pages/companies/[id]/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../stores/company'

describe('Company Details Page', () => {
    const mockCompany = {
        id: '1',
        name: 'Tech Corp',
        status: 'active',
        contacts: [{
            contact_name: 'John Smith',
            email: 'john.smith@techcorp.com',
            phone: '+91 98765 43210',
            address: '123 Tech Street, Bangalore',
            gstin: '29ABCDE1234F1ZH'
        }],
        facility: 'Facility 1'
    }

    it('should render company details', async () => {
        const wrapper = await mountSuspended(CompanyDetailsPage, {
            route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            currentCompany: mockCompany,
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Tech Corp')
        expect(wrapper.text()).toContain('123 Tech Street, Bangalore')
        // Check for edit link
        expect(wrapper.find('a[href="/companies/1/edit"]').exists()).toBe(true)
    })

    it('should fetch company on mount', async () => {
        const wrapper = await mountSuspended(CompanyDetailsPage, {
             route: {
                params: { id: '1' }
            },
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const store = useCompanyStore()
        expect(store.fetchCompany).toHaveBeenCalledWith('1')
    })
})
