import { defineStore } from "pinia";
import {
    useMeetingRoomService,
    type MeetingRoom,
    type Booking,
    type RoomStats,
    type MeetingRoomInsights,
    type TimeSlot,
    type BookingListParams,
    type RoomListParams,
} from "../composables/meetingRoomService";

export const useMeetingRoomStore = defineStore("meetingRoom", {
    state: () => ({
        rooms: [] as MeetingRoom[],
        bookings: [] as Booking[],
        bookingsCount: 0,
        bookingsNext: null as string | null,
        bookingsPrevious: null as string | null,
        currentRoom: null as MeetingRoom | null,
        stats: null as RoomStats | null,
        insights: null as MeetingRoomInsights | null,
        timeSlots: [] as TimeSlot[],
        loading: false,
        error: null as string | null,
        init: false,
        // Pagination
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),

    getters: {
        activeRooms: (state) =>
            state.rooms.filter((r) => r.status === "Active"),
        getRoomById: (state) => (id: string) =>
            state.rooms.find((r) => r.id === id),
        totalRooms: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },

    actions: {
        async fetchRooms(params: RoomListParams = {}, force = false) {
            if (this.init && !force && Object.keys(params).length === 0) return;

            this.loading = true;
            try {
                const service = useMeetingRoomService();
                const page = params.page ?? this.page;
                const page_size = params.page_size ?? this.pageSize;
                const result = await service.getRooms({ ...params, page, page_size });
                this.rooms = result.rooms;
                this.count = result.count;
                this.next = result.next;
                this.previous = result.previous;
                this.page = page;
                this.pageSize = page_size;
                this.init = true;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch rooms";
            } finally {
                this.loading = false;
            }
        },

        async goToPage(page: number, pageSize?: number) {
            await this.fetchRooms({ page, ...(pageSize ? { page_size: pageSize } : {}) });
        },

        async fetchBookings(params?: BookingListParams) {
            this.loading = true;
            this.error = null;
            try {
                const service = useMeetingRoomService();
                const result = await service.getBookings(params);
                this.bookings = result.results;
                this.bookingsCount = result.count;
                this.bookingsNext = result.next;
                this.bookingsPrevious = result.previous;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch bookings";
                this.bookings = [];
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
                    this.error = "Room not found";
                }
            } catch (err: any) {
                this.error = err.message || "Failed to fetch room details";
            } finally {
                this.loading = false;
            }
        },

        async fetchStats() {
            try {
                const service = useMeetingRoomService();
                this.stats = await service.getStats();
            } catch (err) {
                console.error(err);
            }
        },

        async fetchInsightsAction(startDate?: string, endDate?: string) {
            this.loading = true;
            this.error = null;
            try {
                const service = useMeetingRoomService();
                this.insights = await service.getInsights(startDate, endDate);
            } catch (err: any) {
                this.error = err.message || "Failed to fetch meeting room insights";
            } finally {
                this.loading = false;
            }
        },

        async fetchTimeSlots(roomId: string, date: string, company?: string) {
            this.loading = true;
            try {
                const service = useMeetingRoomService();
                this.timeSlots = await service.getTimeSlots(
                    roomId,
                    date,
                    company,
                );
            } catch (err: any) {
                this.error = err.message || "Failed to fetch time slots";
            } finally {
                this.loading = false;
            }
        },

        async createBooking(booking: {
            company: string;
            meetingRoom: string;
            bookingDate: string;
            startTime: string;
            endTime: string;
            bookingType: string;
            bookingHours: number;
            amountCharged: number;
            slots: Array<{ slot: string }>;
            attendees?: Array<{
                attendee_type: string;
                user?: string;
                email?: string;
            }>;
        }) {
            this.loading = true;
            try {
                const service = useMeetingRoomService();
                const newBooking = await service.createBooking(booking);
                this.bookings.unshift(newBooking);
                return newBooking;
            } catch (err: any) {
                this.error = err.message || "Failed to create booking";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteRoom(id: string) {
            this.loading = true;
            try {
                const service = useMeetingRoomService();
                await service.deleteRoom(id);
                this.rooms = this.rooms.filter((r) => r.id !== id);
            } catch (err: any) {
                this.error = err.message || "Failed to delete room";
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
