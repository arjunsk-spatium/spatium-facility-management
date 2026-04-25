import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import CompanyListPage from '../../app/pages/companies/index.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('../../stores/auth', () => ({
    useAuthStore: vi.fn(() => ({
        hasPermission: vi.fn(() => true),
        hasModule: vi.fn(() => true),
        permissions: []
    }))
}))

describe('Company List Page', () => {
    it('should render list of companies', async () => {
        const wrapper = await mountSuspended(CompanyListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            companies: [
                                { id: '1', name: 'Test Corp A', status: 'active', contacts: [{ contact_name: 'John Doe', email: 'john@test.com', phone: '123', address: '123 St' }] },
                                { id: '2', name: 'Test Corp B', status: 'inactive', contacts: [{ contact_name: 'Jane Doe', email: 'jane@test.com', phone: '456', address: '456 St' }] }
                            ],
                            loading: false,
                            count: 2,
                            page: 1,
                            pageSize: 10
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
                    initialState: { company: { companies: [], count: 0, page: 1, pageSize: 10 } }
                })]
            }
        })
        const btn = wrapper.find('button') // or specific selector
        // Look for text or link
        expect(wrapper.html()).toContain('Create')
    })
})
