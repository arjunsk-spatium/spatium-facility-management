import { ref } from 'vue';

export interface Wing {
    id: string;
    name: string;
}

export interface Floor {
    id: string;
    name: string; // e.g., "1st Floor"
    number: number;
    wings: Wing[];
}

export interface Tower {
    id: string;
    name: string; // e.g., "Tower A" or "Main Building"
    floors: Floor[];
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    email: string;
}

export interface Facility {
    id: string;
    name: string;
    location: {
        address: string;
        city: string;
        state: string;
        country: string;
    };
    amenities: string[];
    hasTowers: boolean;
    towers: Tower[];
    staff: Staff[];
}

// Mock Data
const MOCK_FACILITIES: Facility[] = [
    {
        id: '1',
        name: 'Headquarters',
        location: {
            address: '123 Tech Park',
            city: 'San Francisco',
            state: 'CA',
            country: 'USA'
        },
        amenities: ['Parking', 'Gym'],
        hasTowers: false,
        towers: [
            {
                id: 't1',
                name: 'Main Building',
                floors: [
                    { id: 'f1', name: 'Ground Floor', number: 0, wings: [] },
                    { id: 'f2', name: '1st Floor', number: 1, wings: [] }
                ]
            }
        ],
        staff: [
            { id: 's1', name: 'John Doe', role: 'Manager', email: 'john@example.com' }
        ]
    }
];

export interface IFacilityService {
    getFacilities(): Promise<Facility[]>;
    getFacilityById(id: string): Promise<Facility | undefined>;
    createFacility(facility: Omit<Facility, 'id'>): Promise<Facility>;
    updateFacility(id: string, facility: Partial<Facility>): Promise<Facility>;
    deleteFacility(id: string): Promise<void>;
    addStaff(facilityId: string, staff: Omit<Staff, 'id'>): Promise<Staff>;
}

export const useFacilityService = (): IFacilityService => {
    return {
        getFacilities: async () => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve([...MOCK_FACILITIES]);
                }, 500);
            });
        },
        getFacilityById: async (id: string) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const facility = MOCK_FACILITIES.find((f: Facility) => f.id === id);
                    if (facility) resolve({ ...facility });
                    else reject(new Error('Facility not found'));
                }, 300);
            });
        },
        createFacility: async (facility: Omit<Facility, 'id'>) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const newFacility = {
                        ...facility,
                        id: Date.now().toString()
                    };
                    MOCK_FACILITIES.push(newFacility);
                    resolve(newFacility);
                }, 800);
            });
        },
        updateFacility: async (id: string, updates: Partial<Facility>) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const index = MOCK_FACILITIES.findIndex((f: Facility) => f.id === id);
                    if (index !== -1) {
                        MOCK_FACILITIES[index] = { ...MOCK_FACILITIES[index], ...updates };
                        resolve(MOCK_FACILITIES[index]);
                    } else {
                        reject(new Error('Facility not found'));
                    }
                }, 500);
            });
        },
        deleteFacility: async (id: string) => {
            return new Promise((resolve) => {
                setTimeout(() => {
                    const index = MOCK_FACILITIES.findIndex((f: Facility) => f.id === id);
                    if (index !== -1) {
                        MOCK_FACILITIES.splice(index, 1);
                    }
                    resolve();
                }, 500);
            });
        },
        addStaff: async (facilityId: string, staff: Omit<Staff, 'id'>) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    const facility = MOCK_FACILITIES.find((f: Facility) => f.id === facilityId);
                    if (facility) {
                        const newStaff = { ...staff, id: Date.now().toString() };
                        facility.staff.push(newStaff);
                        resolve(newStaff);
                    } else {
                        reject(new Error('Facility not found'));
                    }
                }, 500);
            });
        }
    };
};
