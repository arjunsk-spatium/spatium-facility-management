import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocVisitorInsightsPage from '../../app/pages/spoc/visitors/insights.vue'
import { createTestingPinia } from '@pinia/testing'
import dayjs from 'dayjs'

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
        filters: { start_date: '2025-01-01', end_date: '2026-12-31' },
        stats: {
            total_visitors: 99,
            completed_visits: 23,
            walk_in: 75,
            pre_invite: 24,
            this_month: 4
        },
        visit_purpose_breakdown: [
            { purpose: 'Meeting', count: 83, percentage: 84 },
            { purpose: 'Interview', count: 16, percentage: 16 }
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

    it('should display exact backend stats cards', async () => {
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
        expect(wrapper.text()).toContain('99')
        expect(wrapper.text()).toContain('Completed Visits')
        expect(wrapper.text()).toContain('23')
        expect(wrapper.text()).toContain('Walk-in')
        expect(wrapper.text()).toContain('75')
        expect(wrapper.text()).toContain('Pre-invite')
        expect(wrapper.text()).toContain('24')
        expect(wrapper.text()).toContain('This Month')
        expect(wrapper.text()).toContain('4')
    })

    it('should display visit purpose breakdown with counts and percentages', async () => {
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

        expect(wrapper.text()).toContain('Visit Purpose Breakdown')
        expect(wrapper.text()).toContain('Meeting')
        expect(wrapper.text()).toContain('83')
        expect(wrapper.text()).toContain('84%')
        expect(wrapper.text()).toContain('Interview')
        expect(wrapper.text()).toContain('16')
        expect(wrapper.text()).toContain('16%')
    })

    it('should default start date to this financial year and end date to today', async () => {
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

        const todayStr = dayjs().format('YYYY-MM-DD')
        const currentMonth = dayjs().month()
        const fyYear = currentMonth >= 3 ? dayjs().year() : dayjs().year() - 1
        const expectedFyStart = `${fyYear}-04-01`

        const vm = wrapper.vm as any
        expect(vm.dateRange[0].format('YYYY-MM-DD')).toBe(expectedFyStart)
        expect(vm.dateRange[1].format('YYYY-MM-DD')).toBe(todayStr)
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
