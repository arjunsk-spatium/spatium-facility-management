import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import SpocBookingsPage from '../../app/pages/spoc/bookings/index.vue'
import { createTestingPinia } from '@pinia/testing'

const mockGetClientPortalBookings = vi.fn().mockResolvedValue({ results: [], count: 0, next: null, previous: null })
const mockGetClientPortalRooms = vi.fn().mockResolvedValue({ rooms: [], count: 0, next: null, previous: null })
const mockGetBookings = vi.fn()
const mockGetRooms = vi.fn()

vi.mock('../../composables/meetingRoomService', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../composables/meetingRoomService')>()
    return {
        ...actual,
        useMeetingRoomService: () => ({
            getClientPortalBookings: mockGetClientPortalBookings,
            getClientPortalRooms: mockGetClientPortalRooms,
            getBookings: mockGetBookings,
            getRooms: mockGetRooms
        })
    }
})

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

    describe('client portal APIs', () => {
        beforeEach(() => {
            vi.clearAllMocks()
            mockGetClientPortalBookings.mockResolvedValue({ results: mockBookings, count: 2, next: null, previous: null })
            mockGetClientPortalRooms.mockResolvedValue({ rooms: mockRooms, count: 2, next: null, previous: null })
        })

        it('loads rooms and bookings from the client portal endpoints, not the tenant ones', async () => {
            const wrapper = await mountSuspended(SpocBookingsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: {
                                user: { id: 'u-1', email: 'spoc@acme.com', is_spoc: true, company_id: 'comp-100' },
                                modules: ['spoc_bookings'],
                                permissions: ['spoc_bookings:view']
                            },
                            spoc: { facilities: mockFacilities }
                        }
                    })]
                }
            })
            await flushPromises()

            expect(mockGetClientPortalRooms).toHaveBeenCalledWith({ page: 1, page_size: 100 })
            expect(mockGetClientPortalBookings).toHaveBeenCalledWith(expect.objectContaining({ page: 1, page_size: 10 }))
            expect(mockGetRooms).not.toHaveBeenCalled()
            expect(mockGetBookings).not.toHaveBeenCalled()
            expect((wrapper.vm as any).rooms).toEqual(mockRooms)
        })

        it('passes the selected facility as meeting_room__facility to the client portal bookings endpoint', async () => {
            const wrapper = await mountSuspended(SpocBookingsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: {
                                user: { id: 'u-1', email: 'spoc@acme.com', is_spoc: true, company_id: 'comp-100' },
                                modules: ['spoc_bookings'],
                                permissions: ['spoc_bookings:view']
                            },
                            spoc: { facilities: mockFacilities }
                        }
                    })]
                }
            })
            await flushPromises()
            mockGetClientPortalBookings.mockClear()

            ;(wrapper.vm as any).selectedFacility = 'f-1'
            await (wrapper.vm as any).fetchBookings()

            expect(mockGetClientPortalBookings).toHaveBeenCalledWith(expect.objectContaining({
                meeting_room__facility: 'f-1',
                page: 1,
                page_size: 10
            }))
        })
    })
})
