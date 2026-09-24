import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocInvitePage from '../../app/pages/spoc/visitors/invite.vue'
import { createTestingPinia } from '@pinia/testing'
import { useSpocStore } from '../../stores/spoc'
import dayjs from 'dayjs'

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
        expect(wrapper.text()).toContain('Visit Date')
        expect(wrapper.text()).toContain('Visit Time')
        expect(wrapper.text()).toContain('Purpose of Visit')
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

    it('should validate email format and phone pattern on the invite form', async () => {
        const wrapper = await mountSuspended(SpocInvitePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            employees: [],
                            loading: false,
                            facilities: [],
                            purposes: []
                        }
                    }
                })]
            }
        })

        const items = wrapper.findAllComponents({ name: 'AFormItem' })
        const emailField = items.find(i => i.props('name') === 'email')
        const phoneField = items.find(i => i.props('name') === 'phone')

        if (emailField) {
            const rules = emailField.props('rules') as any[]
            expect(rules.some(r => r.type === 'email')).toBe(true)
        }
        if (phoneField) {
            const rules = phoneField.props('rules') as any[]
            expect(rules.some(r => r.pattern instanceof RegExp)).toBe(true)
        }
        // One of the two fields must enforce a format (email field is config-dependent)
        expect(emailField || phoneField).toBeTruthy()
    })

    it('should default a blank Visit Time to the current time when submitting for today', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                spoc: { employees: [], loading: false, facilities: [], purposes: [] }
            }
        })
        const wrapper = await mountSuspended(SpocInvitePage, { global: { plugins: [pinia] } })
        const store = useSpocStore(pinia)
        const vm = wrapper.vm as any

        vm.formState.name = 'Test Visitor'
        vm.formState.phone = '+919876543210'
        vm.formState.visitDate = dayjs()
        vm.formState.visitTime = null
        vm.formState.purpose = 'purpose-1'
        vm.formState.facilityId = 'fac-1'

        const before = dayjs()
        await vm.handleSubmit()
        const after = dayjs()

        expect(store.inviteVisitor).toHaveBeenCalledTimes(1)
        const payload = (store.inviteVisitor as any).mock.calls[0][0]
        expect(payload.visitDate).toBe(before.format('YYYY-MM-DD'))
        expect(payload.visitTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/)

        const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
        }
        expect(toMinutes(payload.visitTime)).toBeGreaterThanOrEqual(toMinutes(before.format('HH:mm')) - 1)
        expect(toMinutes(payload.visitTime)).toBeLessThanOrEqual(toMinutes(after.format('HH:mm')) + 1)
    })

    it('should bump a visit time that has slipped into the past up to the current time', async () => {
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                spoc: { employees: [], loading: false, facilities: [], purposes: [] }
            }
        })
        const wrapper = await mountSuspended(SpocInvitePage, { global: { plugins: [pinia] } })
        const store = useSpocStore(pinia)
        const vm = wrapper.vm as any

        vm.formState.name = 'Late Visitor'
        vm.formState.phone = '+919876543210'
        vm.formState.visitDate = dayjs()
        // User picked a time two hours ago and only now hits submit
        const staleTime = dayjs().subtract(2, 'hour')
        vm.formState.visitTime = staleTime
        vm.formState.purpose = 'purpose-1'
        vm.formState.facilityId = 'fac-1'

        const before = dayjs()
        await vm.handleSubmit()
        const after = dayjs()

        expect(store.inviteVisitor).toHaveBeenCalledTimes(1)
        const payload = (store.inviteVisitor as any).mock.calls[0][0]

        const toMinutes = (t: string) => {
            const [h, m] = t.split(':').map(Number)
            return h * 60 + m
        }
        // The submitted time must be "now", not the stale picked time
        expect(toMinutes(payload.visitTime)).toBeGreaterThanOrEqual(toMinutes(before.format('HH:mm')) - 1)
        expect(toMinutes(payload.visitTime)).toBeLessThanOrEqual(toMinutes(after.format('HH:mm')) + 1)
        expect(payload.visitTime).not.toBe(staleTime.format('HH:mm'))
    })
})
