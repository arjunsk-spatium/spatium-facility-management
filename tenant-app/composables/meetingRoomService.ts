
import { useAuthFetch } from './useAuthFetch';

export interface MeetingRoom {
    id: string;
    name: string;
    status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
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
    roomId: string;
    roomName: string;
    companyId: string;
    companyName: string;
    bookedBy: string; // User Name
    startTime: string; // ISO
    endTime: string; // ISO
    status: 'Confirmed' | 'Cancelled' | 'Completed';
    creditsUsed: number;
    amountCharged: number;
}

export interface RoomStats {
    totalBookings: number;
    totalRevenue: number;
    utilizationRate: number; // Percentage
    avgDailyBookings: number;
}

const API_BASE = '/api/portal/meeting-rooms/rooms';

export const useMeetingRoomService = () => {
    const { authFetch } = useAuthFetch();

    const getRooms = async (): Promise<MeetingRoom[]> => {
        const result = await authFetch<any>(API_BASE + '/')
        if (result.success) {
            return result.data.results || []
        }
        return []
    }

    const getRoomById = async (id: string): Promise<MeetingRoom | undefined> => {
        const result = await authFetch<any>(API_BASE + '/' + id + '/')
        if (result.success) {
            return result.data
        }
        return undefined
    }

    const createRoom = async (room: Partial<MeetingRoom>): Promise<MeetingRoom> => {
        const result = await authFetch<any>(API_BASE + '/', {
            method: 'POST',
            body: room
        })
        if (result.success) {
            return result.data
        }
        throw new Error(result.message || 'Failed to create room')
    }

    const updateRoom = async (id: string, room: Partial<MeetingRoom>): Promise<MeetingRoom> => {
        const result = await authFetch<any>(API_BASE + '/' + id + '/', {
            method: 'PATCH',
            body: room
        })
        if (result.success) {
            return result.data
        }
        throw new Error(result.message || 'Failed to update room')
    }

    const deleteRoom = async (id: string): Promise<void> => {
        await authFetch<any>(API_BASE + '/' + id + '/', {
            method: 'DELETE'
        })
    }

    const uploadImages = async (id: string, images: File[]): Promise<any[]> => {
        const formData = new FormData()
        images.forEach(img => formData.append('images', img))

        const result = await authFetch<any>(API_BASE + '/' + id + '/upload-images/', {
            method: 'POST',
            body: formData
        })
        if (result.success) {
            return result.data
        }
        throw new Error(result.message || 'Failed to upload images')
    }

    const deleteImages = async (id: string, imageIds: string[]): Promise<void> => {
        await authFetch<any>(API_BASE + '/' + id + '/delete-images/', {
            method: 'POST',
            body: { image_ids: imageIds }
        })
    }

    return {
        getRooms,
        getRoomById,
        createRoom,
        updateRoom,
        deleteRoom,
        uploadImages,
        deleteImages,
        getBookings: async (): Promise<Booking[]> => [],
        getStats: async (): Promise<RoomStats> => ({ totalBookings: 0, totalRevenue: 0, utilizationRate: 0, avgDailyBookings: 0 }),
        getBookingsByStatus: async () => [],
        getBookingsTrend: async () => ({ labels: [], values: [] }),
        getTopRooms: async () => []
    }
}
