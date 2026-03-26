
export interface Ticket {
    id: string;
    ticket_number: string;
    title: string;
    description?: string;
    image_1?: string | null;
    image_2?: string | null;
    image_3?: string | null;
    state: {
        key: string;
        label: string;
    };
    priority: {
        key: string;
        label: string;
    };
    category: string;
    category_name: string;
    subcategory: string;
    subcategory_name: string;
    raiser: string;
    assignee: string | null;
    assigned_at: string | null;
    acknowledged_at: string | null;
    work_started_at: string | null;
    directed_escalation_routed_at: string | null;
    directed_escalation_deadline: string | null;
    directed_escalation_email_sent_at: string | null;
    first_response_at: string | null;
    resolution_deadline: string | null;
    resolved_at: string | null;
    pending_confirmation_at: string | null;
    sla_breached_at: string | null;
    company?: string | null;
    facility?: string | null;
    tower?: string | null;
    floor?: string | null;
    wing?: string | null;
    location_text?: string | null;
    force_close_notes?: string;
    reopen_notes?: string;
    created_at: string;
    updated_at?: string;
    
    // Legacy fields for compatibility
    facilityId?: string;
    facilityName?: string;
    locationDetails?: string;
    status?: string;
    createdBy?: string;
    assignedTo?: string;
    assignedAt?: string;
    resolvedAt?: string;
    closedAt?: string;
    remarks?: TicketRemark[];
}

export interface TicketRemark {
    id: string;
    text: string;
    by: string;
    at: string;
    isInternal: boolean;
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    error: any | null;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface CreateTicketPayload {
    category: string;
    subcategory: string;
    title: string;
    description: string;
    priority: string;
    company?: string | null;
    facility: string;
    tower?: string;
    floor?: string;
    wing?: string;
    location_text?: string;
}

export interface HelpdeskCategory {
    id: string;
    name: string;
    key: string;
    description: string;
    created_at: string;
    updated_at: string;
}

export interface CreateCategoryPayload {
    name: string;
    key: string;
    description?: string;
}

export interface HelpdeskSubCategory {
    id: string;
    category: string;
    category_name: string;
    name: string;
    key: string;
    default_priority: {
        key: string;
        label: string;
    };
    response_sla: number;
    resolution_sla: number;
    required_role: string;
    required_role_key: string;
    required_role_name: string;
    assignment_mode: string;
    assignment_mode_key: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSubCategoryPayload {
    category: string;
    name: string;
    key: string;
    default_priority?: string;
    response_sla?: number;
    resolution_sla?: number;
    required_role?: string;
    assignment_mode?: string;
}

export interface HelpdeskPriority {
    id: string;
    key: string;
    label: string;
    display_order: number;
    is_active: boolean;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
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
    const { $api } = useNuxtApp();

    return {
        getTickets: async (filters?: any): Promise<Ticket[]> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<PaginatedResponse<Ticket>>>>(
                    '/api/portal/helpdesk/tickets/',
                    { method: 'GET', query: filters }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch tickets');
                }
                return response.data.data.results;
            } catch (error) {
                console.error('Error fetching tickets:', error);
                throw error;
            }
        },

        createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
            const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                '/api/portal/helpdesk/tickets/',
                { method: 'POST', body: payload }
            );
            if (!response.success || !response.data.success) {
                throw new Error(response.message || response.data.message || 'Failed to create ticket');
            }
            return response.data.data;
        },

        getCategories: async (): Promise<HelpdeskCategory[]> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<PaginatedResponse<HelpdeskCategory>>>>(
                    '/api/portal/helpdesk/categories/',
                    { method: 'GET' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch categories');
                }
                return response.data.data.results;
            } catch (error) {
                console.error('Error fetching categories:', error);
                throw error;
            }
        },

        getSubCategories: async (categoryId?: string): Promise<HelpdeskSubCategory[]> => {
            try {
                const query = categoryId ? { category: categoryId } : {};
                const response = await $api<ApiResponse<ApiResponse<PaginatedResponse<HelpdeskSubCategory>>>>(
                    '/api/portal/helpdesk/subcategories/',
                    { method: 'GET', query }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch subcategories');
                }
                return response.data.data.results;
            } catch (error) {
                console.error('Error fetching subcategories:', error);
                throw error;
            }
        },

        getSubCategoriesByCategory: async (categoryId: string): Promise<HelpdeskSubCategory[]> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<PaginatedResponse<HelpdeskSubCategory>>>>(
                    `/api/portal/helpdesk/subcategories/by-category/${categoryId}/`,
                    { method: 'GET' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch subcategories');
                }
                return response.data.data.results;
            } catch (error) {
                console.error('Error fetching subcategories by category:', error);
                throw error;
            }
        },

        createCategory: async (payload: CreateCategoryPayload): Promise<HelpdeskCategory> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<HelpdeskCategory>>>(
                    '/api/portal/helpdesk/categories/',
                    { method: 'POST', body: payload }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to create category');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error creating category:', error);
                throw error;
            }
        },

        updateCategory: async (id: string, payload: Partial<CreateCategoryPayload>): Promise<HelpdeskCategory> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<HelpdeskCategory>>>(
                    `/api/portal/helpdesk/categories/${id}/`,
                    { method: 'PATCH', body: payload }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to update category');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error updating category:', error);
                throw error;
            }
        },

        deleteCategory: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/categories/${id}/`,
                    { method: 'DELETE' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to delete category');
                }
            } catch (error) {
                console.error('Error deleting category:', error);
                throw error;
            }
        },

        createSubCategory: async (payload: CreateSubCategoryPayload): Promise<HelpdeskSubCategory> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<HelpdeskSubCategory>>>(
                    '/api/portal/helpdesk/subcategories/',
                    { method: 'POST', body: payload }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to create subcategory');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error creating subcategory:', error);
                throw error;
            }
        },

        updateSubCategory: async (id: string, payload: Partial<CreateSubCategoryPayload>): Promise<HelpdeskSubCategory> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<HelpdeskSubCategory>>>(
                    `/api/portal/helpdesk/subcategories/${id}/`,
                    { method: 'PATCH', body: payload }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to update subcategory');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error updating subcategory:', error);
                throw error;
            }
        },

        deleteSubCategory: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/subcategories/${id}/`,
                    { method: 'DELETE' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to delete subcategory');
                }
            } catch (error) {
                console.error('Error deleting subcategory:', error);
                throw error;
            }
        },

        getPriorities: async (): Promise<HelpdeskPriority[]> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<PaginatedResponse<HelpdeskPriority>>>>(
                    '/api/portal/helpdesk/ticket-priorities/',
                    { method: 'GET' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch priorities');
                }
                return response.data.data.results;
            } catch (error) {
                console.error('Error fetching priorities:', error);
                throw error;
            }
        },

        getTicketById: async (id: string): Promise<Ticket | undefined> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${id}/`,
                    { method: 'GET' }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to fetch ticket');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error fetching ticket:', error);
                throw error;
            }
        },
        
        getStats: async (): Promise<HelpdeskStats> => {
            const tickets = await this.getTickets();
            return {
                total: tickets.length,
                open: tickets.filter(t => t.status === 'Open').length,
                inProgress: tickets.filter(t => t.status === 'In Progress').length,
                resolved: tickets.filter(t => t.status === 'Resolved').length,
                closed: tickets.filter(t => t.status === 'Closed').length
            };
        },
        
        getTicketsByStatusData: async () => {
            const tickets = await this.getTickets();
            const statusCounts = tickets.reduce((acc, t) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return Object.entries(statusCounts).map(([type, value]) => ({ type, value }));
        },
        
        getTicketsOverTimeData: async () => {
            const tickets = await this.getTickets();
            const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
            const counts = months.map(() => Math.floor(Math.random() * 20) + 5);
            return { labels: months, values: counts };
        },
        
        getTopFacilities: async () => {
            const tickets = await this.getTickets();
            const facilityCounts = tickets.reduce((acc, t) => {
                acc[t.facilityName] = (acc[t.facilityName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return Object.entries(facilityCounts).map(([name, count]) => ({ name, count }));
        },
        
        getTopCategories: async () => {
            const tickets = await this.getTickets();
            const categoryCounts = tickets.reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + 1;
                return acc;
            }, {} as Record<string, number>);
            return Object.entries(categoryCounts).map(([name, count]) => ({ name, count }));
        },

        assignTicket: async (ticketId: string, assignee: string, notes?: string): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/assign/`,
                    { method: 'POST', body: { assignee, notes } }
                );
                if (!response.success || !response.data.success) {
                    throw new Error(response.message || response.data.message || 'Failed to assign ticket');
                }
                return response.data.data;
            } catch (error) {
                console.error('Error assigning ticket:', error);
                throw error;
            }
        },

        getAssignableUsers: async (): Promise<any[]> => {
            try {
                const response = await $api<ApiResponse<PaginatedResponse<any>>>(
                    '/api/portal/users/opstrack/list/',
                    { method: 'GET' }
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch users');
                }
                return response.data.results;
            } catch (error) {
                console.error('Error fetching users:', error);
                throw error;
            }
        },

        getStaffByFacility: async (facilityId: string): Promise<any[]> => {
            try {
                const response = await $api<ApiResponse<PaginatedResponse<any>>>(
                    '/api/portal/users/opstrack/list/',
                    { method: 'GET', query: { facility_id: facilityId } }
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to fetch staff');
                }
                return response.data.results;
            } catch (error) {
                console.error('Error fetching staff:', error);
                throw error;
            }
        },

        createStaff: async (payload: {
            full_name: string;
            email: string;
            phone_number: string;
            username: string;
            password: string;
            facility_id: string;
        }): Promise<any> => {
            try {
                const response = await $api<ApiResponse<any>>(
                    '/api/portal/users/opstrack/create/',
                    { method: 'POST', body: payload }
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to create staff');
                }
                return response.data;
            } catch (error) {
                console.error('Error creating staff:', error);
                throw error;
            }
        },

        deleteStaff: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<null>>(
                    `/api/portal/users/opstrack/${id}/`,
                    { method: 'DELETE' }
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to delete staff');
                }
            } catch (error) {
                console.error('Error deleting staff:', error);
                throw error;
            }
        }
    };
};
