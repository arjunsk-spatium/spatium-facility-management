import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocDashboardPage from '../../app/pages/spoc/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SPOC Dashboard Page', () => {
    const mockStats = {
        totalVisitors: 156,
        pendingApprovals: 5,
        checkedInToday: 12,
        totalEmployees: 24
    }

    const mockVisitors = [
        {
            id: '1',
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            visitDate: '2026-01-07',
            visitTime: '10:00 AM',
            purpose: 'Business Meeting',
            status: 'checked_in',
            hostName: 'John Doe'
        },
        {
            id: '2',
            name: 'Priya Patel',
            phone: '+91 87654 32109',
            visitDate: '2026-01-07',
            purpose: 'Interview',
            status: 'pending',
            hostName: 'Jane Smith'
        }
    ]

    it('should render dashboard with stats cards', async () => {
        const wrapper = await mountSuspended(SpocDashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            stats: mockStats,
                            visitors: mockVisitors,
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Company Dashboard')
        expect(wrapper.text()).toContain('Total Visitors')
        expect(wrapper.text()).toContain('Pending')
        expect(wrapper.text()).toContain('Checked In')
        expect(wrapper.text()).toContain('Employees')
    })

    it('should display stats values when loaded', async () => {
        const wrapper = await mountSuspended(SpocDashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            stats: mockStats,
                            visitors: [],
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('156') // totalVisitors
        expect(wrapper.text()).toContain('5')   // pendingApprovals
        expect(wrapper.text()).toContain('12')  // checkedInToday
        expect(wrapper.text()).toContain('24')  // totalEmployees
    })

    it('should show recent visitors table', async () => {
        const wrapper = await mountSuspended(SpocDashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            stats: mockStats,
                            visitors: mockVisitors,
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Recent Visitors')
        expect(wrapper.text()).toContain('Rahul Sharma')
        expect(wrapper.text()).toContain('Business Meeting')
    })

    it('should have "Invite Visitor" button linking to invite page', async () => {
        const wrapper = await mountSuspended(SpocDashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { stats: null, visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Invite Visitor')
        expect(wrapper.html()).toContain('/spoc/visitors/invite')
    })

    it('should have "View All" link to visitors list', async () => {
        const wrapper = await mountSuspended(SpocDashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { stats: mockStats, visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('View All')
        expect(wrapper.html()).toContain('/spoc/visitors')
    })
})
