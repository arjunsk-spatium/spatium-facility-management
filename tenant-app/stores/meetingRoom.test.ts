import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useMeetingRoomStore } from './meetingRoom'

// Mock the meetingRoomService
vi.mock('../composables/meetingRoomService', () => ({
    useMeetingRoomService: () => ({
        getRooms: vi.fn().mockResolvedValue([
            { id: '1', name: 'Conference Room A', capacity: 10, status: 'Active' },
            { id: '2', name: 'Board Room', capacity: 20, status: 'Active' },
            { id: '3', name: 'Meeting Room B', capacity: 6, status: 'Inactive' }
        ]),
        getBookings: vi.fn().mockResolvedValue([
            { id: 'B1', roomId: '1', date: '2026-01-07', startTime: '09:00', endTime: '10:00' },
            { id: 'B2', roomId: '2', date: '2026-01-07', startTime: '14:00', endTime: '16:00' }
        ]),
        getRoomById: vi.fn().mockImplementation((id) => Promise.resolve(
            id === '1' ? { id: '1', name: 'Conference Room A', capacity: 10, status: 'Active' } : null
        )),
        getStats: vi.fn().mockResolvedValue({ totalRooms: 10, activeBookings: 5, todayBookings: 3 })
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
    })

    describe('Actions', () => {
        it('fetchRooms should populate rooms', async () => {
            const store = useMeetingRoomStore()
            await store.fetchRooms()
            
            expect(store.rooms.length).toBe(3)
            expect(store.init).toBe(true)
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
    })
})
