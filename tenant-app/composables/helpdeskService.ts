
export interface Ticket {
    id: string;
    category: string;
    subCategory?: string;
    facilityId: string;
    facilityName: string;
    locationDetails?: string; // Floor/Wing
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
    priority: 'Low' | 'Medium' | 'High' | 'Urgent';
    imageUrls?: string[];
    
    // Audit
    createdBy: string;
    createdAt: string; // ISO date
    assignedTo?: string;
    assignedAt?: string;
    resolvedAt?: string;
    closedAt?: string;
    
    // Relations
    companyName?: string;
    remarks: TicketRemark[];
}

export interface TicketRemark {
    id: string;
    text: string;
    by: string;
    at: string;
    isInternal: boolean;
}

// Analytics Interfaces
export interface HelpdeskStats {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
}

export interface ChartData {
    labels: string[];
    values: number[];
}

// Mock Data
const MOCK_TICKETS: Ticket[] = [
    {
        id: 'TKT-2024-001',
        category: 'AC',
        subCategory: 'Not Cooling',
        facilityId: '1',
        facilityName: 'Headquarters',
        locationDetails: 'Tower A, 5th Floor',
        description: 'AC unit in meeting room 501 is making loud noise and not cooling.',
        status: 'Open',
        priority: 'High',
        createdBy: 'Alice Smith',
        createdAt: '2024-10-25T09:30:00Z',
        companyName: 'Acme Corp',
        remarks: []
    },
    {
        id: 'TKT-2024-002',
        category: 'Electrical',
        subCategory: 'Lights Flickering',
        facilityId: '1',
        facilityName: 'Headquarters',
        locationDetails: 'Lobby',
        description: 'Main chandelier flickering intermittently.',
        status: 'In Progress',
        priority: 'Medium',
        createdBy: 'Bob Jones',
        createdAt: '2024-10-24T14:15:00Z',
        assignedTo: 'Mike Electrician',
        assignedAt: '2024-10-24T15:00:00Z',
        companyName: 'Acme Corp',
        remarks: [
            { id: 'rem-1', text: 'Checking the main breaker', by: 'Mike Electrician', at: '2024-10-24T15:30:00Z', isInternal: true }
        ]
    },
   {
        id: 'TKT-2024-003',
        category: 'Plumbing',
        subCategory: 'Leakage',
        facilityId: '2',
        facilityName: 'North Wing',
        locationDetails: '2nd Floor Restroom',
        description: 'Water leaking from sink.',
        status: 'Resolved',
        priority: 'Urgent',
        createdBy: 'Charlie',
        createdAt: '2024-10-20T08:00:00Z',
        assignedTo: 'Plumber Joe',
        resolvedAt: '2024-10-20T10:00:00Z',
        companyName: 'Globex Inc',
        remarks: []
    },
    {
        id: 'TKT-2024-004',
        category: 'IT',
        subCategory: 'Wifi',
        facilityId: '1',
        facilityName: 'Headquarters',
        locationDetails: 'Conference Room B',
        description: 'Wifi signal weak',
        status: 'Closed',
        priority: 'Low',
        createdBy: 'Dave',
        createdAt: '2024-10-15T11:00:00Z',
        assignedTo: 'IT Support',
        closedAt: '2024-10-15T16:00:00Z',
        companyName: 'Initech',
        remarks: []
    }
];

export const useHelpdeskService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    return {
        getTickets: async (filters?: any): Promise<Ticket[]> => {
            await delay(500);
            let tickets = [...MOCK_TICKETS];
            // Implement basic mock filtering
            if (filters?.status) {
                tickets = tickets.filter(t => t.status === filters.status);
            }
            if (filters?.facilityId) {
                tickets = tickets.filter(t => t.facilityId === filters.facilityId);
            }
            return tickets;
        },

        getTicketById: async (id: string): Promise<Ticket | undefined> => {
            await delay(300);
            return MOCK_TICKETS.find(t => t.id === id);
        },
        
        getStats: async (): Promise<HelpdeskStats> => {
             await delay(300);
             return {
                 total: MOCK_TICKETS.length,
                 open: MOCK_TICKETS.filter(t => t.status === 'Open').length,
                 inProgress: MOCK_TICKETS.filter(t => t.status === 'In Progress').length,
                 resolved: MOCK_TICKETS.filter(t => t.status === 'Resolved').length,
                 closed: MOCK_TICKETS.filter(t => t.status === 'Closed').length
             };
        },
        
        // Mock Analytics Data for Dashboard
        getTicketsByStatusData: async () => {
             await delay(300);
             return [
                 { type: 'Open', value: 35 },
                 { type: 'In Progress', value: 25 },
                 { type: 'Resolved', value: 15 },
                 { type: 'Closed', value: 25 }
             ];
        },
        
        getTicketsOverTimeData: async () => {
             await delay(300);
             // Last 6 months
             return {
                 labels: ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'],
                 values: [12, 19, 15, 25, 22, 30]
             }
        },
        
        getTopFacilities: async () => {
             await delay(300);
             return [
                 { name: 'Headquarters',  count: 45 },
                 { name: 'North Wing', count: 22 },
                 { name: 'East Campus', count: 18 },
                 { name: 'Warehouse', count: 5 }
             ];
        },
        
         getTopCategories: async () => {
             await delay(300);
             return [
                 { name: 'Electrical',  count: 35 },
                 { name: 'AC', count: 28 },
                 { name: 'Plumbing', count: 15 },
                 { name: 'Housekeeping', count: 12 },
                 { name: 'IT', count: 10 }
             ];
        }
    };
};
