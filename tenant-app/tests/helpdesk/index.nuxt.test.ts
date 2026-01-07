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

    it('should have status tabs', async () => {
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
        
        expect(wrapper.text()).toContain('All Tickets')
        expect(wrapper.text()).toContain('Open')
        expect(wrapper.text()).toContain('Active')
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
})
