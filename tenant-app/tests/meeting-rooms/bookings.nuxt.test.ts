import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BookingsPage from '../../app/pages/meeting-rooms/bookings.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Meeting Room Bookings Page', () => {
    const mockBookings = [
        { bookingId: 'B1', meetingRoom: '1', meetingRoomName: 'Conference Room A', bookingDate: '2026-01-07', startTime: '09:00', endTime: '10:00', bookingStatus: 'CONFIRMED', userName: 'John Doe' },
        { bookingId: 'B2', meetingRoom: '2', meetingRoomName: 'Board Room', bookingDate: '2026-01-07', startTime: '14:00', endTime: '16:00', bookingStatus: 'PENDING', userName: 'Jane Smith' }
    ]

    const mockRooms = [
        { id: '1', name: 'Conference Room A' },
        { id: '2', name: 'Board Room' }
    ]

    it('should render bookings page with header', async () => {
        const wrapper = await mountSuspended(BookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { bookings: mockBookings, rooms: mockRooms, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Bookings')
    })

    it('should display bookings list', async () => {
        const wrapper = await mountSuspended(BookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { bookings: mockBookings, rooms: mockRooms, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Conference Room A')
    })

    it('should have filter controls', async () => {
        const wrapper = await mountSuspended(BookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { bookings: [], rooms: [], loading: false }
                    }
                })]
            }
        })
        
        // Page has "Filter Status" dropdown
        expect(wrapper.text()).toContain('Filter')
    })
})
