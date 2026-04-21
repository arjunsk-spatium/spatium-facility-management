import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import VisitorInsightsPage from '../../app/pages/visitors/insights.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('../../composables/dashboardService', () => ({
    useDashboardService: () => ({
        getVisitorInsights: vi.fn().mockResolvedValue({
            date_range: { start_date: '2026-04-04', end_date: '2026-04-10' },
            summary: {
                total_visitors: 6,
                checked_in: 0,
                checked_out: 0,
                pending: 6,
                expected: 0
            },
            traffic: [
                { date: '2026-04-04', count: 0 },
                { date: '2026-04-05', count: 0 },
                { date: '2026-04-06', count: 0 },
                { date: '2026-04-07', count: 0 },
                { date: '2026-04-08', count: 6 },
                { date: '2026-04-09', count: 0 },
                { date: '2026-04-10', count: 0 }
            ],
            today_hourly_traffic: [],
            visit_purposes: [
                { purpose: 'Interview', count: 6, percentage: 100 }
            ],
            top_visiting_companies: [
                { company_id: '460c4c44-3e95-4fb0-8832-e401625356be', name: 'Outcomes', count: 6 }
            ]
        })
    })
}))

vi.mock('@antv/g2plot', () => ({
    Column: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Line: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Pie: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
}))

describe('Visitor Insights Page', () => {
    it('should render visitor insights page', async () => {
        const wrapper = await mountSuspended(VisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['visitors'] }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Visitor Insights')
    })

    it('should display stats after loading', async () => {
        const wrapper = await mountSuspended(VisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['visitors'] }
                    }
                })]
            }
        })

        // Wait for async data fetch
        await new Promise(resolve => setTimeout(resolve, 100))
        await wrapper.vm.$nextTick()

        expect(wrapper.text()).toContain('Total Visitors')
        expect(wrapper.text()).toContain('Checked In')
        expect(wrapper.text()).toContain('Checked Out')
        expect(wrapper.text()).toContain('Pending')
        expect(wrapper.text()).toContain('Expected')
    })

    it('should have date range picker', async () => {
        const wrapper = await mountSuspended(VisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['visitors'] }
                    }
                })]
            }
        })

        expect(wrapper.findComponent({ name: 'ARangePicker' }).exists()).toBe(true)
    })

    it('should have export button', async () => {
        const wrapper = await mountSuspended(VisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['visitors'] }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Export')
    })
})
