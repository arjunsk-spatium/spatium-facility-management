import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHelpdeskStore } from './helpdesk'

// Mock the helpdeskService
vi.mock('../composables/helpdeskService', () => ({
    useHelpdeskService: () => ({
        getTickets: vi.fn().mockResolvedValue({
            tickets: [
                { id: 'TKT-001', category: 'IT', status: 'Open', priority: 'High' },
                { id: 'TKT-002', category: 'Maintenance', status: 'In Progress', priority: 'Medium' },
                { id: 'TKT-003', category: 'IT', status: 'Resolved', priority: 'Low' }
            ],
            count: 3,
            next: null,
            previous: null
        }),
        getPriorityTickets: vi.fn().mockResolvedValue({
            tickets: [
                { id: 'TKT-001', category: 'IT', status: 'Open', priority: 'High' }
            ],
            count: 1,
            next: null,
            previous: null
        }),
        getTicketById: vi.fn().mockImplementation((id) => Promise.resolve(
            id === 'TKT-001' ? { id: 'TKT-001', category: 'IT', status: 'Open' } : null
        )),
        getStats: vi.fn().mockResolvedValue({ total: 100, open: 20, resolved: 80 }),
        getInsights: vi.fn().mockResolvedValue({
            date_range: { start_date: '2026-01-01', end_date: '2026-04-10' },
            summary: {
                total_tickets: 50,
                open: 5,
                in_progress: 10,
                resolved: 30,
                disputed: 2,
                reopened: 3,
                sla_breached: 4,
                near_sla_breach: 1,
                escalated: 8,
                avg_resolution_time_minutes: 45
            },
            tickets_over_time: [
                { month: 'Jan 2026', month_key: '2026-01-01', count: 5 },
                { month: 'Feb 2026', month_key: '2026-02-01', count: 10 },
                { month: 'Mar 2026', month_key: '2026-03-01', count: 15 }
            ],
            status_distribution: [
                { status: 'open', count: 5, percentage: 10 },
                { status: 'in_progress', count: 10, percentage: 20 },
                { status: 'resolved', count: 30, percentage: 60 },
                { status: 'disputed', count: 2, percentage: 4 },
                { status: 'reopened', count: 3, percentage: 6 }
            ],
            top_facilities: [
                { facility_id: '1', facility_name: 'HQ', ticket_count: 20 }
            ],
            top_categories: [
                { category_id: '1', category_name: 'IT', ticket_count: 15 }
            ],
            facility_sla_performance: [
                { facility_id: '1', facility_name: 'HQ', total_tickets: 20, sla_breached: 2, sla_met: 18, breach_rate_percentage: 10 }
            ]
        })
    })
}))

describe('Helpdesk Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('Initial State', () => {
        it('should have empty tickets array initially', () => {
            const store = useHelpdeskStore()
            expect(store.tickets).toEqual([])
        })

        it('should have null currentTicket initially', () => {
            const store = useHelpdeskStore()
            expect(store.currentTicket).toBeNull()
        })

        it('should have null stats initially', () => {
            const store = useHelpdeskStore()
            expect(store.stats).toBeNull()
        })

        it('should have default pagination values', () => {
            const store = useHelpdeskStore()
            expect(store.page).toBe(1)
            expect(store.pageSize).toBe(10)
            expect(store.count).toBe(0)
        })
    })

    describe('Getters', () => {
        it('getTicketById should return correct ticket', () => {
            const store = useHelpdeskStore()
            store.tickets = [
                { id: 'TKT-001', status: 'Open' },
                { id: 'TKT-002', status: 'Closed' }
            ] as any[]
            expect(store.getTicketById('TKT-001')?.status).toBe('Open')
        })

        it('openTickets should filter open tickets', () => {
            const store = useHelpdeskStore()
            store.tickets = [
                { id: '1', state: { key: 'OPEN' } },
                { id: '2', state: { key: 'INPROGRESS' } },
                { id: '3', state: { key: 'OPEN' } }
            ] as any[]
            expect(store.openTickets.length).toBe(2)
        })

        it('inProgressTickets should filter in-progress tickets', () => {
            const store = useHelpdeskStore()
            store.tickets = [
                { id: '1', state: { key: 'OPEN' } },
                { id: '2', state: { key: 'INPROGRESS' } }
            ] as any[]
            expect(store.inProgressTickets.length).toBe(1)
        })

        it('activeTicketsCount should count open and in-progress tickets', () => {
            const store = useHelpdeskStore()
            store.tickets = [
                { id: '1', state: { key: 'OPEN' } },
                { id: '2', state: { key: 'INPROGRESS' } },
                { id: '3', state: { key: 'CLOSED' } }
            ] as any[]
            expect(store.activeTicketsCount).toBe(2)
        })
    })

    describe('Actions', () => {
        it('fetchTickets should populate tickets and pagination', async () => {
            const store = useHelpdeskStore()
            await store.fetchTickets()
            
            expect(store.tickets.length).toBe(3)
            expect(store.count).toBe(3)
            expect(store.init).toBe(true)
        })

        it('goToPage should update page', async () => {
            const store = useHelpdeskStore()
            await store.goToPage(2)
            expect(store.page).toBe(2)
        })

        it('fetchTickets should not refetch if initialized', async () => {
            const store = useHelpdeskStore()
            await store.fetchTickets()
            store.tickets = [{ id: 'existing' }] as any[]
            
            await store.fetchTickets()
            expect(store.tickets[0].id).toBe('existing')
        })

        it('fetchTicketById should set currentTicket for valid id', async () => {
            const store = useHelpdeskStore()
            await store.fetchTicketById('TKT-001')
            
            expect(store.currentTicket).not.toBeNull()
            expect(store.currentTicket?.id).toBe('TKT-001')
        })

        it('fetchTicketById should set error for invalid id', async () => {
            const store = useHelpdeskStore()
            await store.fetchTicketById('INVALID')
            
            expect(store.error).toBe('Ticket not found')
        })

        it('fetchStats should populate stats', async () => {
            const store = useHelpdeskStore()
            await store.fetchStats()
            
            expect(store.stats).not.toBeNull()
            expect(store.stats?.total).toBe(100)
        })

        it('fetchInsightsAction should populate insights', async () => {
            const store = useHelpdeskStore()
            await store.fetchInsightsAction()
            
            expect(store.insights).not.toBeNull()
            expect(store.insights?.summary.total_tickets).toBe(50)
            expect(store.insights?.summary.open).toBe(5)
        })
    })
})
