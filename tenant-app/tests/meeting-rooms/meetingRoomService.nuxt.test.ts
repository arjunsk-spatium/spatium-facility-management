import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useMeetingRoomService } from '../../composables/meetingRoomService'

const okResponse = (data: any) =>
    new Response(JSON.stringify({ success: true, data }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
    })

describe('meetingRoomService endpoints', () => {
    let fetchMock: ReturnType<typeof vi.fn>

    beforeEach(() => {
        fetchMock = vi.fn().mockImplementation(() =>
            Promise.resolve(okResponse({ results: [], count: 0, next: null, previous: null }))
        )
        vi.stubGlobal('fetch', fetchMock)
        vi.stubGlobal('localStorage', { getItem: vi.fn(() => null), setItem: vi.fn(), removeItem: vi.fn() })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    const calledUrl = () => String(fetchMock.mock.calls[0][0])

    it('getRooms calls the tenant rooms endpoint', async () => {
        await useMeetingRoomService().getRooms({ page: 1, page_size: 100 })
        expect(calledUrl()).toContain('/api/portal/meeting-rooms/rooms/?page=1&page_size=100')
    })

    it('getClientPortalRooms calls the client portal rooms endpoint', async () => {
        await useMeetingRoomService().getClientPortalRooms({ page: 1, page_size: 100 })
        expect(calledUrl()).toContain('/api/portal/meeting-rooms/client_portal/rooms/?page=1&page_size=100')
    })

    it('getBookings calls the tenant bookings endpoint', async () => {
        await useMeetingRoomService().getBookings({ company: 'comp-1', page: 1, page_size: 10 })
        expect(calledUrl()).toContain('/api/portal/bookings/bookings/?company=comp-1&page=1&page_size=10')
    })

    it('getClientPortalBookings calls the client portal bookings endpoint with filters', async () => {
        await useMeetingRoomService().getClientPortalBookings({
            meeting_room__facility: 'fac-1',
            company: 'comp-1',
            page: 1,
            page_size: 10
        })
        expect(calledUrl()).toContain(
            '/api/portal/bookings/client_portal/bookings/?meeting_room__facility=fac-1&company=comp-1&page=1&page_size=10'
        )
    })
})
