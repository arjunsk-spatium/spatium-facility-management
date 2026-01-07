import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import VisitorRegisterPage from '../../app/pages/public/visitor/register.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Public Visitor Registration Page', () => {
    it('should render registration page', async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { loading: false },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Welcome')
    })

    it('should have phone number input', async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { loading: false },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Phone')
    })

    it('should have verification code option', async () => {
        const wrapper = await mountSuspended(VisitorRegisterPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { loading: false },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        // Page shows "Verification Code" button
        expect(wrapper.text()).toContain('Verification')
    })
})
