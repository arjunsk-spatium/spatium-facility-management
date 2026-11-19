import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/companies/insights.vue'
import { createTestingPinia } from '@pinia/testing'
import { Line } from '@antv/g2plot'

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

    describe('Booking insights', () => {
        const mountWith = (insights: any) => mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: { company: { insights, loading: false } }
                })]
            }
        })

        it('shows the booking_insights values from the API', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 2, money_on_bookings: 500, credit_spent_on_bookings: 5, total: 505 }
            })

            const section = wrapper.find('[data-testid="booking-insights"]')
            expect(section.exists()).toBe(true)
            expect(section.text()).toContain('Booking Insights')
            expect(wrapper.find('[data-testid="booking-total-bookings"]').text()).toBe('2')
            expect(wrapper.find('[data-testid="booking-money"]').text()).toBe('₹500')
            expect(wrapper.find('[data-testid="booking-credits"]').text().replace(/\s+/g, ' ')).toBe('5 credits')
        })

        it('has no separate Total card', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 2, money_on_bookings: 500, credit_spent_on_bookings: 5, total: 505 }
            })

            const section = wrapper.find('[data-testid="booking-insights"]')
            expect(wrapper.find('[data-testid="booking-total"]').exists()).toBe(false)
            expect(section.findAll('.ant-card')).toHaveLength(3)
            expect(section.text()).not.toContain('Money + credits')
        })

        it('formats large numbers with Indian grouping', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 1250, money_on_bookings: 150000, credit_spent_on_bookings: 0, total: 150000 }
            })

            expect(wrapper.find('[data-testid="booking-total-bookings"]').text()).toBe('1,250')
            expect(wrapper.find('[data-testid="booking-money"]').text()).toBe('₹1,50,000')
        })

        it('hides the section when the API does not send booking_insights', async () => {
            const wrapper = await mountWith(createMockInsights())

            expect(wrapper.find('[data-testid="booking-insights"]').exists()).toBe(false)
            expect(wrapper.text()).toContain('Total Companies')
        })
    })

    describe('Summary cards', () => {
        it('shows company counts and New (30 Days), with no Total Revenue card', async () => {
            const wrapper = await mountSuspended(InsightsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            company: {
                                insights: {
                                    ...createMockInsights({ total_revenue: 22000 }),
                                    booking_insights: { total_bookings: 9, money_on_bookings: 110, credit_spent_on_bookings: 41, total: 151 }
                                },
                                loading: false
                            }
                        }
                    })]
                }
            })

            expect(wrapper.text()).toContain('Total Companies')
            expect(wrapper.text()).toContain('Active Companies')
            expect(wrapper.text()).toContain('Inactive Companies')
            expect(wrapper.text()).toContain('New (30 Days)')
            expect(wrapper.text()).not.toContain('Total Revenue')
            expect(wrapper.find('[data-testid="total-revenue"]').exists()).toBe(false)
            expect(wrapper.text()).not.toContain('22,000')
        })
    })

    describe('Revenue Trend chart', () => {
        const bookingRevenueTrend = [
            { month: 'Apr 2026', month_key: '2026-04-01', money_on_bookings: 0, credit_spent_on_bookings: 0, total: 0 },
            { month: 'Jun 2026', month_key: '2026-06-01', money_on_bookings: 500, credit_spent_on_bookings: 5, total: 505 },
            { month: 'Oct 2026', month_key: '2026-10-01', money_on_bookings: 1000, credit_spent_on_bookings: 0, total: 1000 }
        ]
        const mountWith = (insights: any) => mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: { company: { insights, loading: false } }
                })]
            }
        })
        // The page builds the chart when insights change; with fixed store state, build it directly
        const buildChart = async (wrapper: any) => {
            await new Promise(resolve => setTimeout(resolve, 0))
            await (wrapper.vm as any).createRevenueChart()
        }
        const lastLineOptions = () => {
            const calls = vi.mocked(Line).mock.calls
            return calls[calls.length - 1]![1] as any
        }

        it('plots booking_revenue_trend totals instead of the wallet revenue_trend', async () => {
            vi.mocked(Line).mockClear()
            const wrapper = await mountWith({ ...createMockInsights(), booking_revenue_trend: bookingRevenueTrend })
            await buildChart(wrapper)
            const vm = wrapper.vm as any

            expect(vm.revenueChartData).toEqual([
                { month: 'Apr 2026', revenue: 0, money: 0, credits: 0 },
                { month: 'Jun 2026', revenue: 505, money: 500, credits: 5 },
                { month: 'Oct 2026', revenue: 1000, money: 1000, credits: 0 }
            ])
            expect(lastLineOptions().data.map((d: any) => d.revenue)).toEqual([0, 505, 1000])
        })

        it('labels the axis without ₹ and breaks the tooltip into money, credits and total', async () => {
            vi.mocked(Line).mockClear()
            const wrapper = await mountWith({ ...createMockInsights(), booking_revenue_trend: bookingRevenueTrend })
            await buildChart(wrapper)
            const options = lastLineOptions()

            expect(options.yAxis.label.formatter('1000')).toBe('1,000')
            const rows = options.tooltip.customItems([{ name: 'x', value: 'y', data: { month: 'Jun 2026', revenue: 505, money: 500, credits: 5 } }])
            expect(rows.map((r: any) => [r.name, r.value])).toEqual([
                ['Money on bookings', '₹500'],
                ['Credits spent', '5 credits'],
                ['Total', '505']
            ])
        })

        it('falls back to the wallet revenue_trend with ₹ when booking_revenue_trend is missing', async () => {
            vi.mocked(Line).mockClear()
            const wrapper = await mountWith(createMockInsights())
            await buildChart(wrapper)
            const vm = wrapper.vm as any

            expect(vm.revenueChartData).toEqual([
                { month: 'Jan 2026', revenue: 10000 },
                { month: 'Feb 2026', revenue: 15000 }
            ])
            expect(lastLineOptions().yAxis.label.formatter('15000')).toBe('₹15,000')
        })
    })
})
