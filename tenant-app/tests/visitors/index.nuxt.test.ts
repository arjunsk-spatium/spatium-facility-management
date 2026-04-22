import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import VisitorsPage from '../../app/pages/visitors/index.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('../../stores/auth', () => ({
    useAuthStore: vi.fn(() => ({
        hasPermission: vi.fn(() => true)
    }))
}))

describe('Visitors Page', () => {
    const mockVisitors = [
        { id: '1', name: 'John Visitor', status: 'checked_in', company: 'ABC Corp', purpose: 'Meeting', checkInTime: '09:00', passcode: '123456' },
        { id: '2', name: 'Jane Guest', status: 'checked_out', company: 'XYZ Inc', purpose: 'Interview', checkInTime: '10:00', checkOutTime: '12:00' }
    ]

    it('should render visitors page with header', async () => {
        const wrapper = await mountSuspended(VisitorsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Visitor')
    })

    it('should display visitors list', async () => {
        const wrapper = await mountSuspended(VisitorsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('John Visitor')
    })

    it('should have Export button', async () => {
        const wrapper = await mountSuspended(VisitorsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Export')
    })

    it('should have facility filter', async () => {
        const wrapper = await mountSuspended(VisitorsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        visitor: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        // Page has "All Facilities" filter dropdown
        expect(wrapper.text()).toContain('Facilities')
    })
})
