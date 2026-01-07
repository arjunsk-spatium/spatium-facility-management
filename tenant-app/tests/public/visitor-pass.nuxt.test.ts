import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import VisitorPassPage from '../../app/pages/public/visitor/pass.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Public Visitor Pass Page', () => {
    it('should render visitor pass page', async () => {
        const wrapper = await mountSuspended(VisitorPassPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { 
                            currentVisitor: {
                                id: '1',
                                name: 'John Visitor',
                                company: 'ABC Corp',
                                passcode: '123456',
                                status: 'checked_in'
                            }
                        },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toBeDefined()
    })

    it('should display visitor name when available', async () => {
        const wrapper = await mountSuspended(VisitorPassPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { 
                            currentVisitor: {
                                id: '1',
                                name: 'John Visitor',
                                company: 'ABC Corp',
                                passcode: '123456',
                                status: 'checked_in'
                            }
                        },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('John Visitor')
    })
})
