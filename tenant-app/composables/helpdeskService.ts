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

    effective_priority?:
        | {
              key: string;
              label: string;
          }
        | string;
    estimated_effort_min?: number | null;
    escalation_count?: number;
    warnings?: string[];
    timeline?: Array<{
        id: string;
        ticket: string;
        from_state: string;
        to_state: string;
        actor?: string;
        actor_name?: string;
        reason?: string;
        metadata?: {
            scope_type?: string;
            score_breakdown?: Record<string, number>;
            [key: string]: any;
        };
        proofs?: any[];
        created_at: string;
    }>;

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
    estimated_effort_min?: number | null;
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
    default_estimated_effort_min?: number | null;
    learned_effort_estimate_min?: number | null;
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
    default_estimated_effort_min?: number | null;
}

export interface WorkerLocationScope {
    id?: string;
    scope_type: 'FACILITY' | 'TOWER' | 'FLOOR' | 'WING';
    facility_id: string;
    facility_name?: string;
    tower_id?: string | null;
    tower_name?: string | null;
    floor_id?: string | null;
    floor_name?: string | null;
    wing_id?: string | null;
    wing_name?: string | null;
    created_at?: string;
}

export interface WorkerCapacity {
    id?: string;
    throttle: number;
    effort_capacity_min?: number | null;
    created_at?: string;
    updated_at?: string;
}

export interface SetWorkerCapacityPayload {
    throttle: number;
    effort_capacity_min?: number | null;
}

export interface HelpdeskConfig {
    priority_aging_enabled: boolean;
    aging_interval_minutes: number;
    auto_close_hours: number;
    auto_mode_capacity_gate_enabled: boolean;
    updated_at?: string;
}

export interface HelpdeskScoringConfig {
    alpha: number;
    beta: number;
    gamma: number;
    delta: number;
    epsilon: number;
    reassign_threshold: number;
    handover_penalty: number;
    night_mode_enabled: boolean;
    updated_at?: string;
}

export interface TicketDependency {
    id: string;
    ticket?: string;
    reason_type: 'PARTS_AWAITED' | 'VENDOR_VISIT' | 'APPROVAL_PENDING' | 'ACCESS_UNAVAILABLE' | 'DEPENDENT_TICKET' | 'OTHER';
    notes?: string;
    expected_resolution_at?: string | null;
    linked_ticket?: string | null;
    linked_ticket_number?: string | null;
    status: 'REQUESTED' | 'APPROVED' | 'REJECTED' | 'RESUMED';
    requested_by?: string;
    requested_by_name?: string;
    requested_at?: string;
    decided_by?: string | null;
    decided_by_name?: string | null;
    decided_at?: string | null;
    decision_notes?: string;
    state_before_hold?: string;
    hold_started_at?: string | null;
    resumed_at?: string | null;
    cumulative_hold_minutes?: number;
    created_at?: string;
}

export interface RequestHoldPayload {
    reason_type: 'PARTS_AWAITED' | 'VENDOR_VISIT' | 'APPROVAL_PENDING' | 'ACCESS_UNAVAILABLE' | 'DEPENDENT_TICKET' | 'OTHER';
    notes?: string;
    expected_resolution_at?: string | null;
    linked_ticket?: string | null;
}

export interface DirectHoldPayload extends RequestHoldPayload {}

export interface HoldDecisionPayload {
    decision_notes?: string;
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

export interface AssignRoleUsersPayload {
    role_id: string;
    user_ids: string[];
}

export interface RoleUserItem {
    user_id: string;
    name: string;
}

export interface RoleUsersData {
    role: {
        id: string;
        key: string;
        name: string;
        is_system_role?: boolean;
    };
    user_ids: string[];
    users: RoleUserItem[];
    count: number;
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
    kpis?: {
        reassignments_24h?: number | null;
        reassignment_rate_24h?: number | null;
        load_variance_cv?: number | null;
        first_time_fix_rate?: number | null;
        unassigned_queue_age_minutes_avg?: number | null;
        worker_acceptance_rate?: number | null;
        hold_reason_breakdown?: Record<string, number> | null;
        worker_hold_rates?: Array<{
            worker_id: string;
            worker_name: string;
            requested_count: number;
            rejected_count: number;
            rejection_rate: number | null;
        }> | null;
    };
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

        getPriorityTickets: async (page = 1, pageSize = 20, facilityId?: string, search?: string): Promise<{
            tickets: Ticket[];
            count: number;
            next: string | null;
            previous: string | null;
        }> => {
            try {
                const query: Record<string, any> = { page, page_size: pageSize };
                if (facilityId) query.facility_id = facilityId;
                if (search) query.search = search;

                const response = await $api<
                    ApiResponse<ApiResponse<PaginatedResponse<Ticket>>>
                >("/api/portal/helpdesk/tickets/priority-tickets/", {
                    method: "GET",
                    query,
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
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/assign/`,
                    { method: "POST", body: { assignee, notes } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to assign ticket",
                    );
                }
                const ticketData = response.data?.data || response.data;
                const warnings = response.data?.warnings || response.warnings || ticketData?.warnings;
                if (warnings && Array.isArray(warnings)) {
                    ticketData.warnings = warnings;
                }
                return ticketData;
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
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/reassign/`,
                    { method: "POST", body: { assignee, notes } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to reassign ticket",
                    );
                }
                const ticketData = response.data?.data || response.data;
                const warnings = response.data?.warnings || response.warnings || ticketData?.warnings;
                if (warnings && Array.isArray(warnings)) {
                    ticketData.warnings = warnings;
                }
                return ticketData;
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

        getAssignableUsers: async (facilityId: string): Promise<any[]> => {
            try {
                const response = await $api<
                    ApiResponse<PaginatedResponse<any>>
                >("/api/portal/users/opstrack/online/list/", {
                    method: "GET",
                    query: { facility_id: facilityId },
                });
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

        getRoleUsers: async (roleId: string): Promise<RoleUsersData> => {
            try {
                const response = await $api<
                    ApiResponse<ApiResponse<RoleUsersData>>
                >("/api/portal/helpdesk/tenant-roles/role-users/", {
                    method: "GET",
                    query: { role_id: roleId },
                });
                if (!response.success || !response.data?.success) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch role users",
                    );
                }
                return response.data.data;
            } catch (error) {
                console.error("Error fetching role users:", error);
                throw error;
            }
        },

        bulkAssignRoleUsers: async (payload: AssignRoleUsersPayload): Promise<any> => {
            try {
                const response = await $api<ApiResponse<any>>(
                    "/api/portal/helpdesk/tenant-roles/bulk-assign-users/",
                    {
                        method: "POST",
                        body: payload,
                    },
                );
                return response?.data || response;
            } catch (error) {
                console.error("Error bulk assigning users to role:", error);
                throw error;
            }
        },

        assignUsersToSystemRole: async (payload: AssignRoleUsersPayload): Promise<any> => {
            try {
                const response = await $api<ApiResponse<any>>(
                    "/api/portal/helpdesk/tenant-roles/assign-users-to-system-role/",
                    {
                        method: "POST",
                        body: payload,
                    },
                );
                return response?.data || response;
            } catch (error) {
                console.error("Error assigning users to system role:", error);
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

        // Worker Location Scopes
        getStaffLocationScopes: async (userId: string): Promise<WorkerLocationScope[]> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/staff/${userId}/location-scopes/`,
                    { method: "GET" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch worker location scopes",
                    );
                }
                const data = response.data?.data || response.data;
                return data?.scopes || [];
            } catch (error) {
                console.error("Error fetching worker location scopes:", error);
                throw error;
            }
        },

        setStaffLocationScopes: async (
            userId: string,
            scopes: WorkerLocationScope[],
        ): Promise<WorkerLocationScope[]> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/staff/${userId}/location-scopes/`,
                    { method: "PUT", body: { scopes } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to update worker location scopes",
                    );
                }
                const data = response.data?.data || response.data;
                return data?.scopes || [];
            } catch (error) {
                console.error("Error updating worker location scopes:", error);
                throw error;
            }
        },

        // Worker Capacity
        getStaffCapacity: async (userId: string): Promise<WorkerCapacity | null> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/staff/${userId}/capacity/`,
                    { method: "GET" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch worker capacity",
                    );
                }
                const data = response.data?.data || response.data;
                return data?.capacity ?? null;
            } catch (error) {
                console.error("Error fetching worker capacity:", error);
                throw error;
            }
        },

        setStaffCapacity: async (
            userId: string,
            payload: SetWorkerCapacityPayload,
        ): Promise<WorkerCapacity> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/staff/${userId}/capacity/`,
                    { method: "PUT", body: payload },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to update worker capacity",
                    );
                }
                const data = response.data?.data || response.data;
                return data?.capacity;
            } catch (error) {
                console.error("Error updating worker capacity:", error);
                throw error;
            }
        },

        deleteStaffCapacity: async (userId: string): Promise<void> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/staff/${userId}/capacity/`,
                    { method: "DELETE" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to delete worker capacity",
                    );
                }
            } catch (error) {
                console.error("Error deleting worker capacity:", error);
                throw error;
            }
        },

        // Tenant Helpdesk Config
        getHelpdeskConfig: async (): Promise<HelpdeskConfig> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/config/`,
                    { method: "GET" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch helpdesk config",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error fetching helpdesk config:", error);
                throw error;
            }
        },

        updateHelpdeskConfig: async (
            payload: Partial<HelpdeskConfig>,
        ): Promise<HelpdeskConfig> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/config/`,
                    { method: "PUT", body: payload },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to update helpdesk config",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error updating helpdesk config:", error);
                throw error;
            }
        },

        // ScopeLadder Scoring Config
        getScoringConfig: async (): Promise<HelpdeskScoringConfig> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/scoring-config/`,
                    { method: "GET" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch scoring config",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error fetching scoring config:", error);
                throw error;
            }
        },

        updateScoringConfig: async (
            payload: Partial<HelpdeskScoringConfig>,
        ): Promise<HelpdeskScoringConfig> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/scoring-config/`,
                    { method: "PUT", body: payload },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to update scoring config",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error updating scoring config:", error);
                throw error;
            }
        },

        // Reject Assignment (Decline)
        rejectAssignment: async (
            ticketId: string,
            reason?: string,
        ): Promise<Ticket> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/reject-assignment/`,
                    { method: "POST", body: { reason } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to reject assignment",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error rejecting assignment:", error);
                throw error;
            }
        },

        // Hold / Resume
        requestHold: async (
            ticketId: string,
            payload: RequestHoldPayload,
        ): Promise<TicketDependency> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/request-hold/`,
                    { method: "POST", body: payload },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to request hold",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error requesting hold:", error);
                throw error;
            }
        },

        approveHold: async (
            ticketId: string,
            dependencyId: string,
            decisionNotes?: string,
        ): Promise<Ticket> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/approve-hold/${dependencyId}/`,
                    { method: "POST", body: { decision_notes: decisionNotes } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to approve hold",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error approving hold:", error);
                throw error;
            }
        },

        rejectHold: async (
            ticketId: string,
            dependencyId: string,
            decisionNotes?: string,
        ): Promise<TicketDependency> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/reject-hold/${dependencyId}/`,
                    { method: "POST", body: { decision_notes: decisionNotes } },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to reject hold",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error rejecting hold:", error);
                throw error;
            }
        },

        directHold: async (
            ticketId: string,
            payload: DirectHoldPayload,
        ): Promise<Ticket> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/hold/`,
                    { method: "POST", body: payload },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to put ticket on hold",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error putting ticket on hold:", error);
                throw error;
            }
        },

        resumeTicket: async (ticketId: string): Promise<Ticket> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/resume/`,
                    { method: "POST", body: {} },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to resume ticket",
                    );
                }
                return response.data?.data || response.data;
            } catch (error) {
                console.error("Error resuming ticket:", error);
                throw error;
            }
        },

        getTicketDependencies: async (
            ticketId: string,
        ): Promise<TicketDependency[]> => {
            try {
                const response = await $api<any>(
                    `/api/portal/helpdesk/tickets/${ticketId}/dependencies/`,
                    { method: "GET" },
                );
                if (!response.success || (response.data && response.data.success === false)) {
                    throw new Error(
                        response.message ||
                            response.data?.message ||
                            "Failed to fetch ticket dependencies",
                    );
                }
                const data = response.data?.data || response.data;
                return Array.isArray(data) ? data : data?.results || [];
            } catch (error) {
                console.error("Error fetching ticket dependencies:", error);
                throw error;
            }
        },
    };
};
