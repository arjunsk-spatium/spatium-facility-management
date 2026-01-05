
import { defineStore } from 'pinia';
import { useMeetingRoomService, type MeetingRoom, type Booking, type RoomStats } from '../composables/meetingRoomService';

export const useMeetingRoomStore = defineStore('meetingRoom', {
    state: () => ({
        rooms: [] as MeetingRoom[],
        bookings: [] as Booking[],
        currentRoom: null as MeetingRoom | null,
        stats: null as RoomStats | null,
        loading: false,
        error: null as string | null,
        init: false
    }),

    getters: {
        activeRooms: (state) => state.rooms.filter(r => r.status === 'Active'),
        getRoomById: (state) => (id: string) => state.rooms.find(r => r.id === id)
    },

    actions: {
        async fetchRooms(force = false) {
            if (this.init && !force && this.rooms.length > 0) return;
            
            this.loading = true;
            try {
                const service = useMeetingRoomService();
                this.rooms = await service.getRooms();
                this.init = true;
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch rooms';
            } finally {
                this.loading = false;
            }
        },

        async fetchBookings() {
            this.loading = true;
            try {
                const service = useMeetingRoomService();
                this.bookings = await service.getBookings();
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch bookings';
            } finally {
                this.loading = false;
            }
        },
        
        async fetchRoomById(id: string) {
            this.loading = true;
            try {
                 const service = useMeetingRoomService();
                 const room = await service.getRoomById(id);
                 if (room) {
                     this.currentRoom = room;
                 } else {
                     this.error = 'Room not found';
                 }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch room details';
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const service = useMeetingRoomService();
                this.stats = await service.getStats();
            } catch(err) {
                console.error(err);
            }
        }
    }
});
