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

        it('shows the API response as Total Bookings (incl. cancelled), Cancelled, Money and Credits', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 3, cancelled_bookings: 1, money_on_bookings: 500, credit_spent_on_bookings: 5, total: 505 }
            })

            // total_bookings already includes the cancelled one, so it is shown as-is (not 3 + 1)
            expect(wrapper.find('[data-testid="booking-total-bookings"]').text()).toBe('3')
            expect(wrapper.find('[data-testid="booking-cancelled"]').text()).toBe('1')
            expect(wrapper.find('[data-testid="booking-money"]').text()).toBe('₹500')
            expect(wrapper.find('[data-testid="booking-credits"]').text().replace(/\s+/g, ' ')).toBe('5 credits')
            expect(wrapper.find('[data-testid="booking-insights"]').text()).toContain('Including cancelled')
            expect(wrapper.find('[data-testid="booking-insights"]').findAll('.ant-card')).toHaveLength(4)
        })

        it('shows a zero cancelled count when the API sends 0', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 9, cancelled_bookings: 0, money_on_bookings: 110, credit_spent_on_bookings: 41, total: 151 }
            })

            expect(wrapper.find('[data-testid="booking-total-bookings"]').text()).toBe('9')
            expect(wrapper.find('[data-testid="booking-cancelled"]').text()).toBe('0')
        })

        it('hides the Cancelled card until the API sends cancelled_bookings', async () => {
            const wrapper = await mountWith({
                ...createMockInsights(),
                booking_insights: { total_bookings: 9, money_on_bookings: 110, credit_spent_on_bookings: 41, total: 151 }
            })

            expect(wrapper.find('[data-testid="booking-total-bookings"]').text()).toBe('9')
            expect(wrapper.find('[data-testid="booking-cancelled"]').exists()).toBe(false)
            expect(wrapper.find('[data-testid="booking-insights"]').text()).not.toContain('Including cancelled')
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

    describe('Charts', () => {
        it('shows Company Status Distribution and no Revenue Trend chart', async () => {
            vi.mocked(Line).mockClear()
            const wrapper = await mountSuspended(InsightsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            company: {
                                insights: {
                                    ...createMockInsights(),
                                    booking_revenue_trend: [
                                        { month: 'Oct 2026', month_key: '2026-10-01', money_on_bookings: 1000, credit_spent_on_bookings: 0, total: 1000 }
                                    ]
                                },
                                loading: false
                            }
                        }
                    })]
                }
            })
            await new Promise(resolve => setTimeout(resolve, 0))

            expect(wrapper.text()).toContain('Company Status Distribution')
            expect(wrapper.text()).not.toContain('Revenue Trend')
            expect(Line).not.toHaveBeenCalled()
        })
    })

    describe('Top Companies by Tickets', () => {
        const mountWith = (top: any[]) => mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: { insights: { ...createMockInsights(), top_companies_by_tickets: top }, loading: false }
                    }
                })]
            }
        })
        const rows = (wrapper: any) => wrapper.findAll('.ant-table-tbody tr.ant-table-row')
            .map((tr: any) => tr.findAll('td').map((td: any) => td.text()))

        it('shows the company name from the `name` field the API sends', async () => {
            const wrapper = await mountWith([
                { company_id: 'c1', name: 'Spatium Offices', ticket_count: 18 },
                { company_id: 'c2', name: 'Acme Corp', ticket_count: 9 }
            ])

            expect(rows(wrapper)).toEqual([
                ['Spatium Offices', '18'],
                ['Acme Corp', '9']
            ])
        })

        it('falls back to company_name, then to a dash', async () => {
            const wrapper = await mountWith([
                { company_id: 'c1', company_name: 'Legacy Co', ticket_count: 7 },
                { company_id: 'c2', name: null, ticket_count: 6 }
            ])

            expect(rows(wrapper)).toEqual([
                ['Legacy Co', '7'],
                ['-', '6']
            ])
        })
    })
})
