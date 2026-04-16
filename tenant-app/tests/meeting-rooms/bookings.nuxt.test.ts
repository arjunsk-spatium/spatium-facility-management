import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import BookingsPage from '../../app/pages/meeting-rooms/bookings.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Meeting Room Bookings Page', () => {
    const mockBookings = [
        { id: 'B1', roomId: '1', roomName: 'Conference Room A', date: '2026-01-07', startTime: '09:00', endTime: '10:00', status: 'Confirmed', bookedBy: 'John Doe' },
        { id: 'B2', roomId: '2', roomName: 'Board Room', date: '2026-01-07', startTime: '14:00', endTime: '16:00', status: 'Pending', bookedBy: 'Jane Smith' }
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
                        meetingRoom: { bookings: [], rooms: [], loading: false }
                    }
                })]
            }
        })
        
        // Page has "Filter Status" dropdown
        expect(wrapper.text()).toContain('Filter')
    })
})
