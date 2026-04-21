import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/meeting-rooms/insights.vue'
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
        total_bookings: 20,
        total_revenue: 5000,
        utilization_percentage: 45,
        avg_daily_bookings: 2,
        total_booked_hours: 80,
        cancellation_rate_percentage: 5,
        active_rooms: 8,
        ...overrides
    },
    bookings_trend: [
        { month: 'Jan 2026', month_key: '2026-01-01', count: 5, revenue: 1000, revenue_growth_percentage: 0 },
        { month: 'Feb 2026', month_key: '2026-02-01', count: 8, revenue: 2000, revenue_growth_percentage: 100 }
    ],
    status_distribution: [
        { status: 'confirmed', count: 15, percentage: 75 },
        { status: 'completed', count: 3, percentage: 15 },
        { status: 'cancelled', count: 2, percentage: 10 }
    ],
    top_meeting_rooms: [
        { room_id: '1', room_name: 'Conference A', booking_count: 10, revenue: 2500 }
    ],
    most_utilised_room: { room_id: '1', room_name: 'Conference A', total_hours: 40 },
    top_companies: [
        { company_id: '1', company_name: 'Tech Corp', booking_count: 8, total_hours: 32 }
    ],
    peak_booking_hours: [
        { hour: '10:00', booking_count: 12 }
    ]
})

describe('Meeting Rooms Insights Page', () => {
    it('should render meeting rooms insights title', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        meetingRoom: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('Meeting Rooms Insights')
    })

    it('should display key statistics', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        meetingRoom: {
                            insights: createMockInsights({
                                total_bookings: 100,
                                total_revenue: 10000,
                                utilization_percentage: 60,
                                avg_daily_bookings: 5,
                                total_booked_hours: 200,
                                cancellation_rate_percentage: 10,
                                active_rooms: 12
                            }),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('100') // Total Bookings
        expect(wrapper.text()).toContain('10,000') // Total Revenue
        expect(wrapper.text()).toContain('60%') // Utilization
        expect(wrapper.text()).toContain('5') // Avg Daily Bookings
        expect(wrapper.text()).toContain('200') // Booked Hours
    })

    it('should display top rooms and companies', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        meetingRoom: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Conference A')
        expect(wrapper.text()).toContain('Tech Corp')
    })

    it('should have export button', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        meetingRoom: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Export Report')
    })
})
