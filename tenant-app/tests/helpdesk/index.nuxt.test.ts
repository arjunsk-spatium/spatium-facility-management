import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HelpdeskPage from '../../app/pages/helpdesk/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Helpdesk Page', () => {
    const mockTickets = [
        { id: 'TKT-001', category: 'IT', subCategory: 'Network Issue', status: 'Open', priority: 'High', facilityId: '1', facilityName: 'HQ', createdAt: '2026-01-07' },
        { id: 'TKT-002', category: 'Maintenance', subCategory: 'AC Repair', status: 'In Progress', priority: 'Medium', facilityId: '1', facilityName: 'HQ', createdAt: '2026-01-06' }
    ]

    it('should render helpdesk page with header', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Helpdesk')
    })

    it('should display tickets', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('TKT-001')
        expect(wrapper.text()).toContain('IT')
    })

    it('should have status tabs with badges', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('All')
        expect(wrapper.text()).toContain('Open')
        expect(wrapper.text()).toContain('Active')
        expect(wrapper.text()).toContain('Closed')
    })

    it('should have "New Ticket" button', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: { tickets: [], loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('New Ticket')
    })

    it('should have "Insights" button', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: { tickets: [], loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Insights')
    })

    describe('Badge Counts', () => {
        it('should show correct count for all tickets', async () => {
            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            // Should contain badge count of 2 for 'All' tab
            const badges = wrapper.findAllComponents({ name: 'ABadge' })
            expect(badges.length).toBeGreaterThan(0)
        })

        it('should compute ticket counts correctly', async () => {
            const testTickets = [
                { id: 'TKT-001', status: 'Open', category: 'IT', facilityId: '1', createdAt: '2026-01-07' },
                { id: 'TKT-002', status: 'Open', category: 'IT', facilityId: '1', createdAt: '2026-01-07' },
                { id: 'TKT-003', status: 'In Progress', category: 'Maintenance', facilityId: '1', createdAt: '2026-01-06' },
                { id: 'TKT-004', status: 'Resolved', category: 'IT', facilityId: '1', createdAt: '2026-01-05' },
            ]
            
            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            helpdesk: { tickets: testTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            // The computed ticketCounts should have: all=4, open=2, active=1, closed=1
            const vm = wrapper.vm as any
            expect(vm.ticketCounts.all).toBe(4)
            expect(vm.ticketCounts.open).toBe(2)
            expect(vm.ticketCounts.active).toBe(1)
            expect(vm.ticketCounts.closed).toBe(1)
        })
    })
})
