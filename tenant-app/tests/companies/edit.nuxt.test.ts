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

describe('Company Edit Page', () => {
    it('should load company data on mount', async () => {
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
        
        // Check if form is populated (might need nextTick or v-model updates)
        // Since we are mocking store state, computed props should pick it up
         const nameInput = wrapper.find('input[id="name"]')
         expect((nameInput.element as HTMLInputElement).value).toBe('Original Name')
    })
    
    it('should submit updates', async () => {
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
        
        const store = useCompanyStore()
        
        await wrapper.find('input[id="name"]').setValue('New Name')
        await wrapper.find('form').trigger('submit.prevent')
        
        expect(store.updateCompanyAction).toHaveBeenCalled()
    })
})
