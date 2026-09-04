import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocVisitorInsightsPage from '../../app/pages/spoc/visitors/insights.vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('@antv/g2plot', () => ({
    Column: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Pie: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
    Line: vi.fn().mockImplementation(() => ({
        render: vi.fn(),
        destroy: vi.fn(),
    })),
}))

describe('SPOC Visitor Insights Page', () => {
    const mockInsights = {
        date_range: { start_date: '2025-01-01', end_date: '2025-12-31' },
        summary: {
            total_visitors: 120,
            checked_in: 90,
            checked_out: 80,
            pending: 10,
            expected: 20
        },
        traffic: [
            { date: '2025-06-01', count: 15 },
            { date: '2025-06-02', count: 25 }
        ],
        visit_purposes: [
            { purpose: 'Client Meeting', count: 60, percentage: 50 },
            { purpose: 'Interview', count: 40, percentage: 33 }
        ],
        top_visiting_companies: [
            { company_id: 'c1', name: 'Acme Corp', count: 35 }
        ]
    }

    it('should render page title and subtitle', async () => {
        const wrapper = await mountSuspended(SpocVisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            insights: mockInsights,
                            insightsLoading: false,
                            insightsError: null
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Visitor Insights')
        expect(wrapper.text()).toContain('Analytics and reporting for your company visitors.')
        expect(wrapper.text()).toContain('Export Report')
    })

    it('should display summary stats from insights data', async () => {
        const wrapper = await mountSuspended(SpocVisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            insights: mockInsights,
                            insightsLoading: false,
                            insightsError: null
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Total Visitors')
        expect(wrapper.text()).toContain('120')
        expect(wrapper.text()).toContain('Checked In')
        expect(wrapper.text()).toContain('90')
        expect(wrapper.text()).toContain('Checked Out')
        expect(wrapper.text()).toContain('80')
        expect(wrapper.text()).toContain('Pending')
        expect(wrapper.text()).toContain('10')
        expect(wrapper.text()).toContain('Expected')
        expect(wrapper.text()).toContain('20')
    })

    it('should display error message when insightsError is set', async () => {
        const wrapper = await mountSuspended(SpocVisitorInsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: {
                            insights: null,
                            insightsLoading: false,
                            insightsError: 'Failed to fetch visitor insights'
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Failed to fetch visitor insights')
    })
})
