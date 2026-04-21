import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/facilities/insights.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Facilities Insights Page', () => {
    const createMockInsights = (overrides = {}) => ({
        summary: {
            total_facilities: 3,
            total_towers: 5,
            total_floors: 12,
            total_wings: 24,
            total_meeting_rooms: 8,
            meeting_rooms_by_status: {
                active: 6,
                inactive: 1,
                maintenance: 1,
                ...overrides
            }
        },
        facilities: [
            {
                facility_id: '1',
                name: 'HQ Building',
                address: '123 Main St',
                city: 'Bengaluru',
                state: 'Karnataka',
                country: 'India',
                has_towers: true,
                towers: 2,
                floors: 5,
                wings: 10,
                meeting_rooms: 3,
                visitors_on_premises_now: 5
            }
        ],
        top_facilities_by_visitors: [
            { facility_id: '1', facility_name: 'HQ Building', visitor_count: 100 }
        ],
        top_facilities_by_tickets: [
            { facility_id: '1', facility_name: 'HQ Building', ticket_count: 20 }
        ],
        top_facilities_by_bookings: []
    })

    it('should render facilities insights title', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('Facilities Insights')
    })

    it('should display key statistics', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('3')  // Total Facilities
        expect(wrapper.text()).toContain('5')  // Total Towers
        expect(wrapper.text()).toContain('12') // Total Floors
        expect(wrapper.text()).toContain('24') // Total Wings
        expect(wrapper.text()).toContain('8')  // Meeting Rooms
        expect(wrapper.text()).toContain('6')  // Active MRs
    })

    it('should display facilities table', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        facility: {
                            insights: createMockInsights(),
                            loading: false
                        }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('HQ Building')
        expect(wrapper.text()).toContain('Bengaluru')
    })
})
