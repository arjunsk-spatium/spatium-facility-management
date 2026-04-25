import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocVisitorListPage from '../../app/pages/spoc/visitors/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SPOC Visitor List Page', () => {
    const mockVisitors = [
        {
            id: '1',
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            email: 'rahul@example.com',
            visitDate: '2026-01-07',
            visitTime: '10:00 AM',
            purpose: 'Business Meeting',
            status: 'Checked In',
            hostName: 'John Doe',
            visitor_pass_url: 'http://pass1.pdf'
        },
        {
            id: '2',
            name: 'Priya Patel',
            phone: '+91 87654 32109',
            visitDate: '2026-01-07',
            visitTime: '11:30 AM',
            purpose: 'Interview',
            status: 'Pending',
            hostName: 'Jane Smith'
        },
        {
            id: '3',
            name: 'Amit Kumar',
            phone: '+91 76543 21098',
            visitDate: '2026-01-07',
            purpose: 'Delivery',
            status: 'Approved',
            hostName: 'Bob Wilson',
            visitor_pass_url: 'http://pass2.pdf'
        }
    ]

    it('should render visitor list page with header', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Visitor List')
        expect(wrapper.text()).toContain("Manage and track your company's visitors")
    })

    it('should display visitors in the list', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Rahul Sharma')
        expect(wrapper.text()).toContain('Priya Patel')
        expect(wrapper.text()).toContain('Amit Kumar')
    })

    it('should show status badges for visitors', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Checked In')
        expect(wrapper.text()).toContain('Pending')
        expect(wrapper.text()).toContain('Approved')
    })

    it('should have status filter dropdown', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        // Check for filter controls
        expect(wrapper.html()).toContain('All Status')
    })

    it('should have "Invite Visitor" button', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Invite')
        expect(wrapper.html()).toContain('/spoc/visitors/invite')
    })

    it('should have "Insights" button linking to insights page', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Insights')
        expect(wrapper.html()).toContain('/spoc/visitors/insights')
    })

    it('should display passcode when available', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Generated')
    })
})
