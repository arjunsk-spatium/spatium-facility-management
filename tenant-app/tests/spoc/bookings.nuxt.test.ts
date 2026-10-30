import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocBookingsPage from '../../app/pages/spoc/bookings/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('SPOC Bookings Page', () => {
    const mockBookings = [
        { 
            id: 'b-1',
            bookingId: 'B101', 
            meetingRoom: 'r-1', 
            meetingRoomName: 'Conference Room 1', 
            bookingDate: '2026-10-15', 
            startTime: '10:00:00', 
            endTime: '11:00:00', 
            bookingStatus: 'CONFIRMED', 
            userName: 'Alice Spoc',
            companyName: 'Acme Corp',
            amountCharged: '500.00',
            creditsUsed: 5
        },
        { 
            id: 'b-2',
            bookingId: 'B102', 
            meetingRoom: 'r-2', 
            meetingRoomName: 'Board Room', 
            bookingDate: '2026-10-16', 
            startTime: '14:00:00', 
            endTime: '15:30:00', 
            bookingStatus: 'PENDING', 
            userName: 'Bob Employee',
            companyName: 'Acme Corp',
            amountCharged: '750.00',
            creditsUsed: 8
        }
    ]

    const mockFacilities = [
        { id: 'f-1', name: 'Main Tower', companyId: 'comp-100' }
    ]

    const mockRooms = [
        { id: 'r-1', name: 'Conference Room 1', facility: 'f-1' },
        { id: 'r-2', name: 'Board Room', facility: 'f-1' }
    ]

    it('should render SPOC bookings page with header', async () => {
        const wrapper = await mountSuspended(SpocBookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { 
                            user: { id: 'u-1', email: 'spoc@acme.com', is_spoc: true, company_id: 'comp-100' },
                            modules: ['spoc_dashboard', 'spoc_visitors', 'spoc_employees', 'spoc_bookings'],
                            permissions: ['meeting-rooms-bookings:view', 'spoc_bookings:view']
                        },
                        spoc: { facilities: mockFacilities },
                        meetingRoom: { rooms: mockRooms }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Bookings')
        expect(wrapper.text()).toContain('View and manage meeting room reservations for your company.')
    })

    it('should render filters for facilities, meeting rooms, status, and search', async () => {
        const wrapper = await mountSuspended(SpocBookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { 
                            user: { id: 'u-1', email: 'spoc@acme.com', is_spoc: true, company_id: 'comp-100' },
                            modules: ['spoc_dashboard', 'spoc_visitors', 'spoc_employees', 'spoc_bookings'],
                            permissions: ['meeting-rooms-bookings:view', 'spoc_bookings:view']
                        },
                        spoc: { facilities: mockFacilities },
                        meetingRoom: { rooms: mockRooms }
                    }
                })]
            }
        })
        
        expect(wrapper.find('input[placeholder="Search booking ID or user..."]').exists()).toBe(true)
    })

    it('should render export and refresh buttons', async () => {
        const wrapper = await mountSuspended(SpocBookingsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { 
                            user: { id: 'u-1', email: 'spoc@acme.com', is_spoc: true, company_id: 'comp-100' },
                            modules: ['spoc_dashboard', 'spoc_visitors', 'spoc_employees', 'spoc_bookings'],
                            permissions: ['meeting-rooms-bookings:view']
                        },
                        spoc: { facilities: mockFacilities },
                        meetingRoom: { rooms: mockRooms }
                    }
                })]
            }
        })

        const buttons = wrapper.findAll('button')
        expect(buttons.some(b => b.text().includes('Export'))).toBe(true)
        expect(buttons.some(b => b.text().includes('Refresh'))).toBe(true)
    })
})
