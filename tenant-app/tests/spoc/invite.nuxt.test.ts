import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocInvitePage from '../../app/pages/spoc/visitors/invite.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SPOC Invite Visitor Page', () => {
    const mockEmployees = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@company.com',
            department: 'Engineering'
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            department: 'HR'
        }
    ]

    it('should render invite page with header', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Invite Visitor')
        expect(wrapper.text()).toContain('Send an invitation code to your visitor')
    })

    it('should have form fields for visitor details', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Visitor Name')
        expect(wrapper.text()).toContain('Phone Number')
        expect(wrapper.text()).toContain('Email')
        expect(wrapper.text()).toContain('Visit Date')
        expect(wrapper.text()).toContain('Visit Time')
        expect(wrapper.text()).toContain('Purpose of Visit')
    })

    it('should have host employee selection', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Host Employee')
    })

    it('should have "Send Invitation" submit button', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: mockEmployees, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Send Invitation')
    })

    it('should have "Back to List" navigation button', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Back to List')
        expect(wrapper.html()).toContain('/spoc/visitors')
    })

    it('should have Reset button', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Reset')
    })

    it('should have purpose of visit dropdown', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { employees: [], loading: false }
                    }
                })]
            }
        })
        
        // Check for purpose select field
        expect(wrapper.text()).toContain('Purpose of Visit')
    })
})
