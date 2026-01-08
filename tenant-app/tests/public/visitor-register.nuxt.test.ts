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

    describe('OTP Resend Functionality', () => {
        it('should show resend option in step 2', async () => {
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
            
            // Manually set step to 2 to see OTP screen
            await wrapper.vm.$nextTick()
            ;(wrapper.vm as any).step = 2
            await wrapper.vm.$nextTick()
            
            expect(wrapper.text()).toContain("Didn't receive a code")
        })

        it('should show countdown timer when OTP is sent', async () => {
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
            
            await wrapper.vm.$nextTick()
            ;(wrapper.vm as any).step = 2
            ;(wrapper.vm as any).resendCooldown = 30
            await wrapper.vm.$nextTick()
            
            expect(wrapper.text()).toContain('Resend in')
        })

        it('should show Resend Code when cooldown is 0', async () => {
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
            
            await wrapper.vm.$nextTick()
            ;(wrapper.vm as any).step = 2
            ;(wrapper.vm as any).resendCooldown = 0
            await wrapper.vm.$nextTick()
            
            expect(wrapper.text()).toContain('Resend Code')
        })
    })
})
