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
    priority:
        | {
              key: string;
              label: string;
          }
        | string;
    category: string;
    category_name: string;
    subcategory: string;
    subcategory_name: string;
    raiser: string;
    raiser_name?: string | null;
    assignee: string | null;
    assignee_name?: string | null;
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
    company_name?: string | null;
    facility?: string | null;
    facility_name?: string | null;
    tower?: string | null;
    floor?: string | null;
    tower_name?: string | null;
    floor_name?: string | null;
    wing?: string | null;
    wing_name?: string | null;
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

export interface HelpdeskAssignmentMode {
    id: string;
    key: string;
    name: string;
    description: string;
    display_order: number;
}

export interface HelpdeskRole {
    id: string;
    key: string;
    name: string;
    description: string;
    display_order: number;
    created_at: string;
    updated_at: string;
}

export interface CreateRolePayload {
    key: string;
    name: string;
    description?: string;
    display_order: number;
}

export interface DirectedEscalationRoleMapping {
    id: string;
    tenant_id: string;
    assignment_mode: string;
    assignment_mode_key: string;
    role: string;
    role_key: string;
    role_name: string;
    deadline_hours: number;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateDirectedEscalationRoleMappingPayload {
    assignment_mode: string;
    role: string;
    deadline_hours: number;
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

export interface HelpdeskInsights {
    date_range: {
        start_date: string;
        end_date: string;
    };
    summary: {
        total_tickets: number;
        open: number;
        in_progress: number;
        resolved: number;
        disputed: number;
        reopened: number;
        sla_breached: number;
        near_sla_breach: number;
        escalated: number;
        avg_resolution_time_minutes: number;
    };
    tickets_over_time: Array<{
        month: string;
        month_key: string;
        count: number;
    }>;
    status_distribution: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    top_facilities: Array<{
        facility_id: string;
        facility_name: string;
        ticket_count: number;
    }>;
    top_categories: Array<{
        category_id: string;
        category_name: string;
        ticket_count: number;
    }>;
    facility_sla_performance: Array<{
        facility_id: string;
        facility_name: string;
        total_tickets: number;
        sla_breached: number;
        sla_met: number;
        breach_rate_percentage: number;
    }>;
}

export interface TicketListParams {
    page?: number;
    page_size?: number;
    states?: string;
    facility_id?: string;
    search?: string;
}

export const useHelpdeskService = () => {
    const { $api } = useNuxtApp();

    return {
        getTickets: async (params: TicketListParams = {}): Promise<{
            tickets: Ticket[];
            count: number;
            next: string | null;
            previous: string | null;
        }> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<Ticket>>>
                >("/api/portal/helpdesk/tickets/", {
                    method: "GET",
                    query: params,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch tickets",
                    );
                }
                return {
                    tickets: response.data.data.results,
                    count: response.data.data.count,
                    next: response.data.data.next,
                    previous: response.data.data.previous,
                };
            } catch (error) {
                console.error("Error fetching tickets:", error);
                throw error;
            }
        },

        createTicket: async (payload: CreateTicketPayload): Promise<Ticket> => {
            const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                "/api/portal/helpdesk/tickets/",
                { method: "POST", body: payload },
            );
            if (!response.success || !response.data.success) {
                throw new Error(
                    response.message ||
                        response.data.message ||
                        "Failed to create ticket",
                );
            }
            return response.data.data;
        },

        getCategories: async (): Promise<HelpdeskCategory[]> => {
            try {
                const response = await $api<
                    ApiResponse<
                        ApiResponse<PaginatedResponse<HelpdeskCategory>>
                    >
                >("/api/portal/helpdesk/categories/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch categories",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching categories:", error);
                throw error;
            }
        },

        getSubCategories: async (
            categoryId?: string,
        ): Promise<HelpdeskSubCategory[]> => {
            try {
                const query = categoryId ? { category: categoryId } : {};
                const response = await $api<
                    ApiResponse<
                        ApiResponse<PaginatedResponse<HelpdeskSubCategory>>
                    >
                >("/api/portal/helpdesk/subcategories/", {
                    method: "GET",
                    query,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch subcategories",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching subcategories:", error);
                throw error;
            }
        },

        getSubCategoriesByCategory: async (
            categoryId: string,
        ): Promise<HelpdeskSubCategory[]> => {
            try {
                const response = await $api<
                    ApiResponse<
                        ApiResponse<PaginatedResponse<HelpdeskSubCategory>>
                    >
                >(
                    `/api/portal/helpdesk/subcategories/by-category/${categoryId}/`,
                    { method: "GET" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch subcategories",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error(
                    "Error fetching subcategories by category:",
                    error,
                );
                throw error;
            }
        },

        createCategory: async (
            payload: CreateCategoryPayload,
        ): Promise<HelpdeskCategory> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskCategory>>
                >("/api/portal/helpdesk/categories/", {
                    method: "POST",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to create category",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error creating category:", error);
                throw error;
            }
        },

        updateCategory: async (
            id: string,
            payload: Partial<CreateCategoryPayload>,
        ): Promise<HelpdeskCategory> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskCategory>>
                >(`/api/portal/helpdesk/categories/${id}/`, {
                    method: "PATCH",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to update category",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error updating category:", error);
                throw error;
            }
        },

        deleteCategory: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/categories/${id}/`,
                    { method: "DELETE" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to delete category",
                    );
                }
            } catch (error) {
                console.error("Error deleting category:", error);
                throw error;
            }
        },

        createSubCategory: async (
            payload: CreateSubCategoryPayload,
        ): Promise<HelpdeskSubCategory> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskSubCategory>>
                >("/api/portal/helpdesk/subcategories/", {
                    method: "POST",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to create subcategory",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error creating subcategory:", error);
                throw error;
            }
        },

        updateSubCategory: async (
            id: string,
            payload: Partial<CreateSubCategoryPayload>,
        ): Promise<HelpdeskSubCategory> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskSubCategory>>
                >(`/api/portal/helpdesk/subcategories/${id}/`, {
                    method: "PATCH",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to update subcategory",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error updating subcategory:", error);
                throw error;
            }
        },

        deleteSubCategory: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/subcategories/${id}/`,
                    { method: "DELETE" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to delete subcategory",
                    );
                }
            } catch (error) {
                console.error("Error deleting subcategory:", error);
                throw error;
            }
        },

        getPriorities: async (): Promise<HelpdeskPriority[]> => {
            try {
                const response = await $api<
                    ApiResponse<
                        ApiResponse<PaginatedResponse<HelpdeskPriority>>
                    >
                >("/api/portal/helpdesk/ticket-priorities/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch priorities",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching priorities:", error);
                throw error;
            }
        },

        getTicketById: async (id: string): Promise<Ticket | undefined> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${id}/`,
                    { method: "GET" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error fetching ticket:", error);
                throw error;
            }
        },

        getStats: async (): Promise<HelpdeskStats> => {
            const { tickets, count } = await this.getTickets({ page_size: 1 });
            return {
                total: count,
                open: tickets.filter((t) => t.status === "Open").length,
                inProgress: tickets.filter((t) => t.status === "In Progress")
                    .length,
                resolved: tickets.filter((t) => t.status === "Resolved").length,
                closed: tickets.filter((t) => t.status === "Closed").length,
            };
        },

        getPriorityTickets: async (page = 1, pageSize = 20, facilityId?: string): Promise<{
            tickets: Ticket[];
            count: number;
            next: string | null;
            previous: string | null;
        }> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<Ticket>>>
                >("/api/portal/helpdesk/tickets/priority-tickets/", {
                    method: "GET",
                    query: { page, page_size: pageSize, facility_id: facilityId },
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch priority tickets",
                    );
                }
                return {
                    tickets: response.data.data.results,
                    count: response.data.data.count,
                    next: response.data.data.next,
                    previous: response.data.data.previous,
                };
            } catch (error) {
                console.error("Error fetching priority tickets:", error);
                throw error;
            }
        },

        getTicketsByStatusData: async () => {
            const tickets = await this.getTickets();
            const statusCounts = tickets.reduce(
                (acc, t) => {
                    acc[t.status] = (acc[t.status] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            );
            return Object.entries(statusCounts).map(([type, value]) => ({
                type,
                value,
            }));
        },

        getTicketsOverTimeData: async () => {
            const tickets = await this.getTickets();
            const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];
            const counts = months.map(() => Math.floor(Math.random() * 20) + 5);
            return { labels: months, values: counts };
        },

        getTopFacilities: async () => {
            const tickets = await this.getTickets();
            const facilityCounts = tickets.reduce(
                (acc, t) => {
                    acc[t.facilityName] = (acc[t.facilityName] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            );
            return Object.entries(facilityCounts).map(([name, count]) => ({
                name,
                count,
            }));
        },

        getTopCategories: async () => {
            const tickets = await this.getTickets();
            const categoryCounts = tickets.reduce(
                (acc, t) => {
                    acc[t.category] = (acc[t.category] || 0) + 1;
                    return acc;
                },
                {} as Record<string, number>,
            );
            return Object.entries(categoryCounts).map(([name, count]) => ({
                name,
                count,
            }));
        },

        getInsights: async (startDate?: string, endDate?: string): Promise<HelpdeskInsights> => {
            try {
                const query: Record<string, string> = {}
                if (startDate) query.start_date = startDate
                if (endDate) query.end_date = endDate

                const response = await $api<ApiResponse<HelpdeskInsights>>(
                    "/api/portal/dashboard/helpdesk-insights/",
                    {
                        method: "GET",
                        query,
                    },
                );
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to fetch helpdesk insights",
                    );
                }
                return response.data;
            } catch (error) {
                console.error("Error fetching helpdesk insights:", error);
                throw error;
            }
        },

        assignTicket: async (
            ticketId: string,
            assignee: string,
            notes?: string,
        ): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/assign/`,
                    { method: "POST", body: { assignee, notes } },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to assign ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error assigning ticket:", error);
                throw error;
            }
        },

        reassignTicket: async (
            ticketId: string,
            assignee: string,
            notes?: string,
        ): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/reassign/`,
                    { method: "POST", body: { assignee, notes } },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to reassign ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error reassigning ticket:", error);
                throw error;
            }
        },

        confirmCloseTicket: async (ticketId: string): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/confirm/`,
                    { method: "POST" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to close ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error closing ticket:", error);
                throw error;
            }
        },

        reopenTicket: async (ticketId: string, assignee?: string, notes?: string): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/reopen/`,
                    { 
                        method: "POST", 
                        body: { 
                            assignee: assignee || undefined,
                            notes: notes || undefined 
                        } 
                    },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to reopen ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error reopening ticket:", error);
                throw error;
            }
        },

        forceCloseTicket: async (ticketId: string, notes?: string): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/force-close/`,
                    { method: "POST", body: notes ? { notes } : {} },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to force close ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error force closing ticket:", error);
                throw error;
            }
        },

        updateTicket: async (ticketId: string, payload: { priority?: string; location_text?: string }): Promise<Ticket> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<Ticket>>>(
                    `/api/portal/helpdesk/tickets/${ticketId}/update/`,
                    { method: "PATCH", body: payload },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to update ticket",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error updating ticket:", error);
                throw error;
            }
        },

        getAssignableUsers: async (): Promise<any[]> => {
            try {
                const response = await $api<
                    ApiResponse<PaginatedResponse<any>>
                >("/api/portal/users/opstrack/list/", { method: "GET" });
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to fetch users",
                    );
                }
                return response.data.results;
            } catch (error) {
                console.error("Error fetching users:", error);
                throw error;
            }
        },

        getStaffByFacility: async (facilityId: string): Promise<any[]> => {
            try {
                const response = await $api<
                    ApiResponse<PaginatedResponse<any>>
                >("/api/portal/users/opstrack/list/", {
                    method: "GET",
                    query: { facility_id: facilityId },
                });
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to fetch staff",
                    );
                }
                return response.data.results;
            } catch (error) {
                console.error("Error fetching staff:", error);
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
                    "/api/portal/users/opstrack/create/",
                    { method: "POST", body: payload },
                );
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to create staff",
                    );
                }
                return response.data;
            } catch (error) {
                console.error("Error creating staff:", error);
                throw error;
            }
        },

        deleteStaff: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<null>>(
                    `/api/portal/users/opstrack/${id}/delete/`,
                    { method: "DELETE" },
                );
                if (!response.success) {
                    throw new Error(
                        response.message || "Failed to delete staff",
                    );
                }
            } catch (error) {
                console.error("Error deleting staff:", error);
                throw error;
            }
        },

        getRoles: async (): Promise<HelpdeskRole[]> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<HelpdeskRole>>>
                >("/api/portal/helpdesk/roles/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch roles",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching roles:", error);
                throw error;
            }
        },

        getPriorities: async (): Promise<HelpdeskPriority[]> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<HelpdeskPriority>>>
                >("/api/portal/helpdesk/ticket-priorities/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch priorities",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching priorities:", error);
                throw error;
            }
        },

        getAssignmentModes: async (): Promise<HelpdeskAssignmentMode[]> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<HelpdeskAssignmentMode>>>
                >("/api/portal/helpdesk/assignment-modes/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch assignment modes",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching assignment modes:", error);
                throw error;
            }
        },

        createRole: async (
            payload: CreateRolePayload,
        ): Promise<HelpdeskRole> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskRole>>
                >("/api/portal/helpdesk/roles/", {
                    method: "POST",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to create role",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error creating role:", error);
                throw error;
            }
        },

        updateRole: async (
            id: string,
            payload: Partial<CreateRolePayload>,
        ): Promise<HelpdeskRole> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<HelpdeskRole>>
                >(`/api/portal/helpdesk/roles/${id}/`, {
                    method: "PATCH",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to update role",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error updating role:", error);
                throw error;
            }
        },

        deleteRole: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/roles/${id}/`,
                    { method: "DELETE" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to delete role",
                    );
                }
            } catch (error) {
                console.error("Error deleting role:", error);
                throw error;
            }
        },

        getDirectedEscalationRoleMappings: async (): Promise<DirectedEscalationRoleMapping[]> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<DirectedEscalationRoleMapping>>>
                >("/api/portal/helpdesk/directed-escalation-role-mappings/", { method: "GET" });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to fetch directed escalation role mappings",
                    );
                }
                return response.data.data.results;
            } catch (error) {
                console.error("Error fetching directed escalation role mappings:", error);
                throw error;
            }
        },

        createDirectedEscalationRoleMapping: async (
            payload: CreateDirectedEscalationRoleMappingPayload,
        ): Promise<DirectedEscalationRoleMapping> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<DirectedEscalationRoleMapping>>
                >("/api/portal/helpdesk/directed-escalation-role-mappings/", {
                    method: "POST",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to create directed escalation role mapping",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error creating directed escalation role mapping:", error);
                throw error;
            }
        },

        updateDirectedEscalationRoleMapping: async (
            id: string,
            payload: Partial<CreateDirectedEscalationRoleMappingPayload>,
        ): Promise<DirectedEscalationRoleMapping> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<DirectedEscalationRoleMapping>>
                >(`/api/portal/helpdesk/directed-escalation-role-mappings/${id}/`, {
                    method: "PATCH",
                    body: payload,
                });
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to update directed escalation role mapping",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error updating directed escalation role mapping:", error);
                throw error;
            }
        },

        deleteDirectedEscalationRoleMapping: async (id: string): Promise<void> => {
            try {
                const response = await $api<ApiResponse<ApiResponse<null>>>(
                    `/api/portal/helpdesk/directed-escalation-role-mappings/${id}/`,
                    { method: "DELETE" },
                );
                if (!response.success || !response.data.success) {
                    throw new Error(
                        response.message ||
                            response.data.message ||
                            "Failed to delete directed escalation role mapping",
                    );
                }
            } catch (error) {
                console.error("Error deleting directed escalation role mapping:", error);
                throw error;
            }
        },
    };
};
