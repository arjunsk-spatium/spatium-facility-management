import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/helpdesk/insights.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@antv/g2plot', () => ({
    Line: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Pie: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
}))

const createMockInsights = (overrides = {}) => ({
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
        avg_resolution_time_minutes: 45,
        ...overrides
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

describe('Helpdesk Insights Page', () => {
    it('should render helpdesk insights title', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('Helpdesk Insights')
    })

    it('should display key statistics', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: {
                            insights: createMockInsights({
                                total_tickets: 100,
                                open: 10,
                                in_progress: 20,
                                resolved: 60,
                                disputed: 5,
                                reopened: 5,
                                sla_breached: 8,
                                near_sla_breach: 2,
                                escalated: 15,
                                avg_resolution_time_minutes: 30
                            }),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('100') // Total
        expect(wrapper.text()).toContain('10')  // Open
        expect(wrapper.text()).toContain('20')  // In Progress
        expect(wrapper.text()).toContain('60')  // Resolved
        expect(wrapper.text()).toContain('15')  // Escalated
    })

    it('should display top facilities and categories', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('HQ')
        expect(wrapper.text()).toContain('IT')
    })

    it('should have export button', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Export Report')
    })

    it('should display operational dispatch health KPIs and hold breakdown when present', async () => {
        const mockInsightsWithKpis = {
            ...createMockInsights(),
            kpis: {
                reassignments_24h: 3,
                reassignment_rate_24h: 0.06,
                worker_acceptance_rate: 0.92,
                first_time_fix_rate: 0.88,
                load_variance_cv: 0.42,
                unassigned_queue_age_minutes_avg: 14.5,
                hold_reason_breakdown: {
                    parts_needed: 7,
                    user_unavailable: 4
                },
                worker_hold_rates: [
                    {
                        worker_id: 'w1',
                        worker_name: 'John Doe',
                        requested_count: 5,
                        rejected_count: 1,
                        rejection_rate: 0.2
                    }
                ]
            }
        }

        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        helpdesk: {
                            insights: mockInsightsWithKpis,
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Operational & Dispatch Health')
        expect(wrapper.text()).toContain('6.0%') // reassignment rate
        expect(wrapper.text()).toContain('92.0%') // worker acceptance
        expect(wrapper.text()).toContain('88.0%') // first-time-fix
        expect(wrapper.text()).toContain('0.42') // load variance CV
        expect(wrapper.text()).toContain('15 min') // queue age rounded
        expect(wrapper.text()).toContain('Hold Reason Breakdown')
        expect(wrapper.text()).toContain('Parts Needed')
        expect(wrapper.text()).toContain('User Unavailable')
        expect(wrapper.text()).toContain('Worker Hold Rejection Rates')
        expect(wrapper.text()).toContain('John Doe')
    })
})
