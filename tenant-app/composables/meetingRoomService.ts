
export interface MeetingRoom {
    id: string;
    name: string;
    capacity: number;
    type: 'Meeting Room' | 'Discussion Room' | 'Board Room' | 'Training Room';
    facilityId: string;
    facilityName: string;
    locationDetails: string; // Floor/Tower
    pricePerHour: number;
    creditCost: number;
    status: 'Active' | 'Inactive' | 'Maintenance';
    amenities: string[];
    images: string[];
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

const MOCK_ROOMS: MeetingRoom[] = [
    {
        id: 'MR-001',
        name: 'Alpha Conference',
        capacity: 12,
        type: 'Board Room',
        facilityId: '1',
        facilityName: 'Headquarters',
        locationDetails: 'Tower A, 12th Floor',
        pricePerHour: 50,
        creditCost: 10,
        status: 'Active',
        amenities: ['TV', 'Video Conf', 'Whiteboard'],
        images: []
    },
    {
        id: 'MR-002',
        name: 'Brainstorm Pod',
        capacity: 4,
        type: 'Discussion Room',
        facilityId: '1',
        facilityName: 'Headquarters',
        locationDetails: 'Tower B, Ground Floor',
        pricePerHour: 20,
        creditCost: 4,
        status: 'Active',
        amenities: ['Whiteboard', 'Wifi'],
        images: []
    },
    {
        id: 'MR-003',
        name: 'Training Center',
        capacity: 30,
        type: 'Training Room',
        facilityId: '2',
        facilityName: 'North Wing',
        locationDetails: 'Level 2',
        pricePerHour: 100,
        creditCost: 20,
        status: 'Maintenance',
        amenities: ['Projector', 'Sound System', 'Desks'],
        images: []
    }
];

const MOCK_BOOKINGS: Booking[] = [
    {
        id: 'BK-1001',
        roomId: 'MR-001',
        roomName: 'Alpha Conference',
        companyId: 'C1',
        companyName: 'Acme Corp',
        bookedBy: 'John Doe',
        startTime: '2024-10-26T10:00:00Z',
        endTime: '2024-10-26T12:00:00Z',
        status: 'Confirmed',
        creditsUsed: 20,
        amountCharged: 100
    },
    {
        id: 'BK-1002',
        roomId: 'MR-002',
        roomName: 'Brainstorm Pod',
        companyId: 'C2',
        companyName: 'Globex',
        bookedBy: 'Jane Smith',
        startTime: '2024-10-26T14:00:00Z',
        endTime: '2024-10-26T15:00:00Z',
        status: 'Completed',
        creditsUsed: 4,
        amountCharged: 20
    }
];

export const useMeetingRoomService = () => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return {
        getRooms: async (): Promise<MeetingRoom[]> => {
            await delay(500);
            return [...MOCK_ROOMS];
        },
        
        getRoomById: async (id: string): Promise<MeetingRoom | undefined> => {
            await delay(300);
            return MOCK_ROOMS.find(r => r.id === id);
        },

        getBookings: async (): Promise<Booking[]> => {
            await delay(500);
            return [...MOCK_BOOKINGS];
        },

        getStats: async (): Promise<RoomStats> => {
            await delay(400);
            return {
                totalBookings: 145,
                totalRevenue: 5200,
                utilizationRate: 68,
                avgDailyBookings: 8.5
            };
        },

        // Analytics Mocks
        getBookingsByStatus: async () => {
            await delay(300);
            return [
                { type: 'Confirmed', value: 85 },
                { type: 'Completed', value: 45 },
                { type: 'Cancelled', value: 15 }
            ];
        },
        
        getBookingsTrend: async () => {
             await delay(300);
             return {
                 labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                 values: [20, 35, 30, 45, 55, 60]
             }
        },
        
        getTopRooms: async () => {
             await delay(300);
             return [
                 { name: 'Alpha Conference', count: 42 },
                 { name: 'Brainstorm Pod', count: 35 },
                 { name: 'Glass Room', count: 28 }
             ];
        }
    };
};
