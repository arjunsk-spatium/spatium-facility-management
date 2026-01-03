import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyDetailsPage from '../../app/pages/companies/[id]/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useCompanyStore } from '../../stores/company'

describe('Company Details Page', () => {
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
                            currentCompany: { id: '1', name: 'Detail Corp', address: 'Detail St', status: 'active' },
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Detail Corp')
        expect(wrapper.text()).toContain('Detail St')
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
