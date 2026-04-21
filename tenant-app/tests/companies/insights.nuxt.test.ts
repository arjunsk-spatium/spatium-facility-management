import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/companies/insights.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@antv/g2plot', () => ({
    Column: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Line: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
}))

const createMockInsights = (overrides = {}) => ({
    summary: {
        total_companies: 10,
        active_companies: 8,
        inactive_companies: 2,
        total_revenue: 100000,
        new_last_30_days: 3,
        ...overrides
    },
    status_distribution: [
        { status: 'active', count: 8 },
        { status: 'inactive', count: 2 }
    ],
    revenue_trend: [
        { month: 'Jan 2026', month_key: '2026-01-01', revenue: 10000, growth_percentage: 0 },
        { month: 'Feb 2026', month_key: '2026-02-01', revenue: 15000, growth_percentage: 50 }
    ],
    top_companies_by_tickets: []
})

describe('Insights Page', () => {
    it('should render dashboard title', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('Company Insights')
    })

    it('should display key statistics', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            insights: createMockInsights({
                                total_companies: 50,
                                active_companies: 40,
                                inactive_companies: 10,
                                total_revenue: 50000,
                                new_last_30_days: 5
                            }),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('50') // Total
        expect(wrapper.text()).toContain('40') // Active
        expect(wrapper.text()).toContain('10') // Inactive
        expect(wrapper.text()).toContain('5')  // New last 30 days
    })
})
