import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMeetingRoomStore } from './meetingRoom'

// Mock the meetingRoomService
vi.mock('../composables/meetingRoomService', () => ({
    useMeetingRoomService: () => ({
        getRooms: vi.fn().mockResolvedValue({
            rooms: [
                { id: '1', name: 'Conference Room A', capacity: 10, status: 'Active' },
                { id: '2', name: 'Board Room', capacity: 20, status: 'Active' },
                { id: '3', name: 'Meeting Room B', capacity: 6, status: 'Inactive' }
            ],
            count: 3,
            next: null,
            previous: null
        }),
        getBookings: vi.fn().mockResolvedValue({
            results: [
                { id: 'B1', roomId: '1', date: '2026-01-07', startTime: '09:00', endTime: '10:00' },
                { id: 'B2', roomId: '2', date: '2026-01-07', startTime: '14:00', endTime: '16:00' }
            ],
            count: 2,
            next: null,
            previous: null
        }),
        getRoomById: vi.fn().mockImplementation((id) => Promise.resolve(
            id === '1' ? { id: '1', name: 'Conference Room A', capacity: 10, status: 'Active' } : null
        )),
        getStats: vi.fn().mockResolvedValue({ totalRooms: 10, activeBookings: 5, todayBookings: 3 }),
        getInsights: vi.fn().mockResolvedValue({
            date_range: { start_date: '2026-01-01', end_date: '2026-04-10' },
            summary: {
                total_bookings: 20,
                total_revenue: 5000,
                utilization_percentage: 45,
                avg_daily_bookings: 2,
                total_booked_hours: 80,
                cancellation_rate_percentage: 5,
                active_rooms: 8
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
    })
}))

describe('Meeting Room Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
    })

    describe('Initial State', () => {
        it('should have empty rooms array initially', () => {
            const store = useMeetingRoomStore()
            expect(store.rooms).toEqual([])
        })

        it('should have empty bookings array initially', () => {
            const store = useMeetingRoomStore()
            expect(store.bookings).toEqual([])
        })

        it('should have null currentRoom initially', () => {
            const store = useMeetingRoomStore()
            expect(store.currentRoom).toBeNull()
        })

        it('should have null stats initially', () => {
            const store = useMeetingRoomStore()
            expect(store.stats).toBeNull()
        })

        it('should have default pagination values', () => {
            const store = useMeetingRoomStore()
            expect(store.page).toBe(1)
            expect(store.pageSize).toBe(10)
            expect(store.count).toBe(0)
        })
    })

    describe('Getters', () => {
        it('activeRooms should filter by Active status', () => {
            const store = useMeetingRoomStore()
            store.rooms = [
                { id: '1', status: 'Active' },
                { id: '2', status: 'Inactive' },
                { id: '3', status: 'Active' }
            ] as any[]
            expect(store.activeRooms.length).toBe(2)
        })

        it('getRoomById should return correct room', () => {
            const store = useMeetingRoomStore()
            store.rooms = [
                { id: '1', name: 'Room A' },
                { id: '2', name: 'Room B' }
            ] as any[]
            expect(store.getRoomById('2')?.name).toBe('Room B')
        })

        it('totalRooms should return count', () => {
            const store = useMeetingRoomStore()
            store.count = 10
            expect(store.totalRooms).toBe(10)
        })
    })

    describe('Actions', () => {
        it('fetchRooms should populate rooms and pagination', async () => {
            const store = useMeetingRoomStore()
            await store.fetchRooms()
            
            expect(store.rooms.length).toBe(3)
            expect(store.count).toBe(3)
            expect(store.init).toBe(true)
        })

        it('goToPage should update page', async () => {
            const store = useMeetingRoomStore()
            await store.goToPage(2)
            expect(store.page).toBe(2)
        })

        it('fetchRooms should not refetch if initialized with data', async () => {
            const store = useMeetingRoomStore()
            await store.fetchRooms()
            store.rooms = [{ id: 'existing' }] as any[]
            
            await store.fetchRooms()
            expect(store.rooms[0].id).toBe('existing')
        })

        it('fetchBookings should populate bookings', async () => {
            const store = useMeetingRoomStore()
            await store.fetchBookings()
            
            expect(store.bookings.length).toBe(2)
        })

        it('fetchRoomById should set currentRoom for valid id', async () => {
            const store = useMeetingRoomStore()
            await store.fetchRoomById('1')
            
            expect(store.currentRoom).not.toBeNull()
            expect(store.currentRoom?.name).toBe('Conference Room A')
        })

        it('fetchRoomById should set error for invalid id', async () => {
            const store = useMeetingRoomStore()
            await store.fetchRoomById('invalid')
            
            expect(store.error).toBe('Room not found')
        })

        it('fetchStats should populate stats', async () => {
            const store = useMeetingRoomStore()
            await store.fetchStats()
            
            expect(store.stats).not.toBeNull()
        })

        it('fetchInsightsAction should populate insights', async () => {
            const store = useMeetingRoomStore()
            await store.fetchInsightsAction()
            
            expect(store.insights).not.toBeNull()
            expect(store.insights?.summary.total_bookings).toBe(20)
        })
    })
})
