import { useNuxtApp } from "#app";

export interface MeetingRoom {
    id: string;
    name: string;
    status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
    pax: number;
    room_type: string;
    room_type_details?: {
        id: string;
        name: string;
    };
    facility: string;
    tower?: string | null;
    floor?: string | null;
    wing?: string | null;
    price: string;
    credits: number;
    access_point_id?: string | null;
    images: Array<{
        id: string;
        image: string;
        is_primary: boolean;
    }>;
    amenities_details?: Array<{
        id: string;
        amenity: string;
        amenity_details: {
            id: string;
            name: string;
            icon: string;
        };
    }>;
}

export interface Booking {
    id: string;
    bookingId: string;
    tenantId?: string;
    user: string;
    userName: string;
    meetingRoom: string;
    meetingRoomName: string;
    roomName: string;
    company: string;
    companyName: string;
    bookingDate: string;
    startTime: string;
    endTime: string;
    bookingType: string;
    bookingHours: string;
    creditsUsed: number | null;
    amountCharged: string;
    paymentMode?: string;
    totalCredits: number | null;
    remainingCredits: number | null;
    bookingStatus: string;
    cancelledAt: string | null;
    createdAt: string;
    updatedAt: string;
    slots: Array<{
        id: string;
        slot: string;
        bookingDate: string;
        slotDetails: {
            startTime: string;
            endTime: string;
        };
    }>;
    attendees: Array<{
        id?: string;
        attendee_type: string;
        user?: string | null;
        user_name?: string | null;
        email?: string | null;
        name?: string | null;
        is_notified?: boolean;
    }>;
    // Legacy compatibility
    roomId?: string;
    companyId?: string;
    bookedBy?: string;
    status?: "Confirmed" | "Cancelled" | "Completed";
    creditsUsedLegacy?: number;
    amountChargedLegacy?: number;
}

export interface TimeSlot {
    id: string;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
}

export interface RoomStats {
    totalBookings: number;
    totalRevenue: number;
    utilizationRate: number; // Percentage
    avgDailyBookings: number;
}

const BOOKING_API_BASE = "/api/portal/bookings/bookings";
const API_BASE = "/api/portal/meeting-rooms/rooms";

export interface BookingListParams {
    meeting_room__facility?: string;
    company?: string;
    booking_date?: string;
    page?: number;
    page_size?: number;
}

export interface PaginatedResponse<T> {
    results: T[];
    count: number;
    next: string | null;
    previous: string | null;
}

export const useMeetingRoomService = () => {
    const { $api } = useNuxtApp();

    const getRooms = async (): Promise<MeetingRoom[]> => {
        const result = await $api<any>(API_BASE + "/");
        if (result.success) {
            return result.data.results || [];
        }
        return [];
    };

    const getRoomById = async (
        id: string,
    ): Promise<MeetingRoom | undefined> => {
        const result = await $api<any>(API_BASE + "/" + id + "/");
        if (result.success) {
            return result.data;
        }
        return undefined;
    };

    const getTimeSlots = async (
        roomId: string,
        date: string,
        company?: string,
    ): Promise<TimeSlot[]> => {
        let url = `${API_BASE}/${roomId}/time-slots/?date=${date}`;
        if (company) {
            url += `&company=${company}`;
        }
        const result = await $api<any>(url);
        if (result.success) {
            return result.data.map((slot: any) => ({
                id: slot.id,
                startTime: slot.start_time,
                endTime: slot.end_time,
                isAvailable: slot.is_available,
            }));
        }
        return [];
    };

    const getBookings = async (
        params?: BookingListParams,
    ): Promise<PaginatedResponse<Booking>> => {
        const queryParams = new URLSearchParams();
        if (params) {
            if (params.meeting_room__facility)
                queryParams.append(
                    "meeting_room__facility",
                    params.meeting_room__facility,
                );
            if (params.company) queryParams.append("company", params.company);
            if (params.booking_date)
                queryParams.append("booking_date", params.booking_date);
            if (params.page) queryParams.append("page", params.page.toString());
            if (params.page_size)
                queryParams.append("page_size", params.page_size.toString());
        }
        const queryString = queryParams.toString();
        const result = await $api<any>(
            BOOKING_API_BASE + "/" + (queryString ? `?${queryString}` : ""),
        );
        if (result.success) {
            return {
                results: result.data.results.map(transformBooking),
                count: result.data.count,
                next: result.data.next,
                previous: result.data.previous,
            };
        }
        return { results: [], count: 0, next: null, previous: null };
    };

    const getBookingById = async (id: string): Promise<Booking | undefined> => {
        const result = await $api<any>(BOOKING_API_BASE + "/" + id + "/");
        if (result.success) {
            return transformBooking(result.data);
        }
        return undefined;
    };

    const transformBooking = (data: any): Booking => ({
        id: data.id,
        bookingId: data.booking_id,
        tenantId: data.tenant_id,
        user: data.user,
        userName: data.user_name,
        meetingRoom: data.meeting_room,
        meetingRoomName: data.meeting_room_name,
        roomName: data.meeting_room_name,
        company: data.company,
        companyName: data.company_name,
        bookingDate: data.booking_date,
        startTime: data.start_time,
        endTime: data.end_time,
        bookingType: data.booking_type,
        bookingHours: data.booking_hours,
        creditsUsed: data.credits_used,
        amountCharged: data.amount_charged,
        paymentMode: data.payment_mode,
        totalCredits: data.total_credits,
        remainingCredits: data.remaining_credits,
        bookingStatus: data.booking_status,
        cancelledAt: data.cancelled_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        slots: data.slots.map((s: any) => ({
            id: s.id,
            slot: s.slot,
            bookingDate: s.booking_date,
            slotDetails: {
                startTime:
                    s.slot_details?.start_time ||
                    s.slot_details?.startTime ||
                    "",
                endTime:
                    s.slot_details?.end_time || s.slot_details?.endTime || "",
            },
        })),
        attendees: data.attendees || [],
    });

    const createBooking = async (booking: {
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
    }): Promise<Booking> => {
        const payload = {
            company: booking.company,
            meeting_room: booking.meetingRoom,
            booking_date: booking.bookingDate,
            start_time: booking.startTime,
            end_time: booking.endTime,
            booking_type: booking.bookingType,
            booking_hours: booking.bookingHours,
            amount_charged: booking.amountCharged,
            slots: booking.slots,
            attendees: booking.attendees,
        };
        const result = await $api<any>(BOOKING_API_BASE + "/", {
            method: "POST",
            body: payload,
        });
        if (result.success === true) {
            return transformBooking(result.data);
        } else if (result.id || result.booking_id) {
            return transformBooking(result);
        }
        throw new Error(result.message || "Failed to create booking");
    };

    const createRoom = async (
        room: Partial<MeetingRoom>,
    ): Promise<MeetingRoom> => {
        const result = await $api<any>(API_BASE + "/", {
            method: "POST",
            body: room,
        });
        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || "Failed to create room");
    };

    const updateRoom = async (
        id: string,
        room: Partial<MeetingRoom>,
    ): Promise<MeetingRoom> => {
        const result = await $api<any>(API_BASE + "/" + id + "/", {
            method: "PATCH",
            body: room,
        });
        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || "Failed to update room");
    };

    const deleteRoom = async (id: string): Promise<void> => {
        await $api<any>(API_BASE + "/" + id + "/", {
            method: "DELETE",
        });
    };

    const uploadImages = async (id: string, images: File[]): Promise<any[]> => {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));

        const result = await $api<any>(
            API_BASE + "/" + id + "/upload-images/",
            {
                method: "POST",
                body: formData,
            },
        );
        if (result.success) {
            return result.data;
        }
        throw new Error(result.message || "Failed to upload images");
    };

    const deleteImages = async (
        id: string,
        imageIds: string[],
    ): Promise<void> => {
        await $api<any>(API_BASE + "/" + id + "/delete-images/", {
            method: "POST",
            body: { image_ids: imageIds },
        });
    };

    return {
        getRooms,
        getRoomById,
        getTimeSlots,
        getBookings,
        getBookingById,
        createBooking,
        createRoom,
        updateRoom,
        deleteRoom,
        uploadImages,
        deleteImages,
        getStats: async (): Promise<RoomStats> => ({
            totalBookings: 0,
            totalRevenue: 0,
            utilizationRate: 0,
            avgDailyBookings: 0,
        }),
        getBookingsByStatus: async () => [],
        getBookingsTrend: async () => ({ labels: [], values: [] }),
        getTopRooms: async () => [],
    };
};
