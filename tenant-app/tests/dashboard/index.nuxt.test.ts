import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DashboardPage from '../../app/pages/dashboard/index.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@antv/g2plot', () => ({
    Line: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    }))
}))

vi.mock('../../composables/dashboardService', () => ({
    useDashboardService: () => ({
        getSummary: vi.fn().mockResolvedValue({
            date_filter: { filter: 'last_7_days', date_from: '2026-04-04', date_to: '2026-04-10' },
            companies: {
                total_count: 1,
                last_month_growth_percentage: 0,
                active_percentage: 100,
                by_status: { active: 1 },
                recent_companies: [
                    { id: '1', name: 'Outcomes', created_at: '2026-04-08T09:33:55.605810+00:00', status: 'active' }
                ]
            },
            visitors: {
                today_count: 0,
                last_7_days: [
                    { date: '2026-04-04', count: 0 },
                    { date: '2026-04-05', count: 0 },
                    { date: '2026-04-06', count: 0 },
                    { date: '2026-04-07', count: 0 },
                    { date: '2026-04-08', count: 0 },
                    { date: '2026-04-09', count: 0 },
                    { date: '2026-04-10', count: 0 }
                ]
            },
            pre_invites: {
                today_count: 0,
                last_7_days: [
                    { date: '2026-04-04', count: 0 },
                    { date: '2026-04-05', count: 0 },
                    { date: '2026-04-06', count: 0 },
                    { date: '2026-04-07', count: 0 },
                    { date: '2026-04-08', count: 0 },
                    { date: '2026-04-09', count: 0 },
                    { date: '2026-04-10', count: 0 }
                ]
            },
            infrastructure: {
                facilities_count: 1,
                towers_count: 0,
                floors_count: 0,
                wings_count: 0
            },
            staff: {
                total_staff_count: 6,
                on_duty_now: 2
            },
            helpdesk: {
                tickets: {
                    open: 1,
                    in_progress: 8,
                    closed: 0,
                    by_priority: { P1: 9 },
                    top_categories: [
                        { category__name: 'Furniture', ticket_count: 4 }
                    ]
                },
                urgent: { disputed: 0, reopened: 0, escalated: 7 },
                sla: { breached: 3, near_breach: 0 },
                trends_last_7_days: [
                    { date: '2026-04-04', created: 0, resolved: 0 },
                    { date: '2026-04-05', created: 0, resolved: 0 },
                    { date: '2026-04-06', created: 0, resolved: 0 },
                    { date: '2026-04-07', created: 0, resolved: 0 },
                    { date: '2026-04-08', created: 0, resolved: 0 },
                    { date: '2026-04-09', created: 7, resolved: 0 },
                    { date: '2026-04-10', created: 2, resolved: 0 }
                ],
                average_times: { response_time_minutes: 0.67, resolution_time_minutes: 0 }
            },
            insights: {
                top_companies_by_tickets: [],
                top_companies_by_visitors: [
                    { company_id: '1', name: 'Outcomes', visitor_count: 6 }
                ],
                top_facilities: {
                    highest_visitors: { facility_id: '1', name: 'Spatium Iconic', count: 6 },
                    highest_tickets: { facility_id: '1', name: 'Spatium Iconic', count: 7 }
                }
            },
            users: {
                active_today: 0,
                active_last_7_days: 2,
                new_registrations_last_7_days: 5
            }
        })
    })
}))

describe('Dashboard Page', () => {
    it('should render dashboard page', async () => {
        const wrapper = await mountSuspended(DashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['companies', 'visitors', 'facilities', 'helpdesk', 'users'] },
                        dashboard: { summary: null, loading: false, error: null }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Dashboard')
    })

    it('should display overview tagline', async () => {
        const wrapper = await mountSuspended(DashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['companies', 'visitors', 'facilities', 'helpdesk', 'users'] },
                        dashboard: { summary: null, loading: false, error: null }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Overview')
    })
})
