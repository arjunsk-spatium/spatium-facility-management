import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyListPage from '../../app/pages/companies/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Company List Page', () => {
    it('should render list of companies', async () => {
        const wrapper = await mountSuspended(CompanyListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            companies: [
                                { id: '1', name: 'Test Corp A', spoc_name: 'John Doe', spoc_email: 'john@test.com', spoc_phone: '123', status: 'active' },
                                { id: '2', name: 'Test Corp B', spoc_name: 'Jane Doe', spoc_email: 'jane@test.com', spoc_phone: '456', status: 'inactive' }
                            ],
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Test Corp A')
        expect(wrapper.text()).toContain('Test Corp B')
    })

    it('should show "Create Company" button', async () => {
        const wrapper = await mountSuspended(CompanyListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: { company: { companies: [] } }
                })]
            }
        })
        const btn = wrapper.find('button') // or specific selector
        // Look for text or link
        expect(wrapper.html()).toContain('Create')
    })
})
