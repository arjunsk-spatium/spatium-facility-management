export interface Visitor {
    id: string
    name: string
    email: string | null
    from_company: string | null
    visitor_type: 'walk_in' | 'pre_invite'
    status: 'Pending' | 'Approved' | 'Rejected'
    facility_id: string
    facility_name: string
    company_id: string | null
    company_name: string | null
    purpose_of_visit_id: string
    purpose_of_visit: string
    appointment_time: string | null
    check_in_time: string | null
    check_out_time: string | null
    is_on_premises: boolean
    creator_type: string | null
    created_by_id: string | null
    approved_by_id: string | null
    rejected_by_id: string | null
    created_at: string
    updated_at: string
    visitor_pass_url?: string | null
}

export interface VisitorStats {
    total: number
    checkedIn: number
    pending: number
    expected: number
}

export interface PaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export interface ApiResponse<T> {
    success: boolean
    code: string
    message: string
    data: T
    error: any | null
    meta: {
        request_id: string
        timestamp: string
    }
}

export interface VisitorListParams {
    page?: number
    page_size?: number
    start_date?: string
    end_date?: string
    company_id?: string
    facility_id?: string
    search?: string
}

export interface IVisitorService {
    getVisitors(params?: VisitorListParams): Promise<{
        visitors: Visitor[]
        count: number
        next: string | null
        previous: string | null
    }>
    getVisitorById(id: string): Promise<Visitor>
    registerWalkIn(data: Partial<Visitor>): Promise<Visitor>
    updateVisitorStatus(id: string, status: string): Promise<Visitor>
    verifyOtp(phone: string, otp: string): Promise<boolean>
    getVisitorByPasscode(passcode: string): Promise<Visitor | null>
    getStats(): Promise<VisitorStats>
    getTrends(): Promise<any[]>
    getPurposeStats(): Promise<any[]>
    searchHosts(query: string): Promise<any[]>
}

export const useVisitorService = (): IVisitorService => {
    const { $api } = useNuxtApp()

    return {
        getVisitors: async (params: VisitorListParams = {}) => {
            const query: any = {}
            if (params.page) query.page = params.page
            if (params.page_size) query.page_size = params.page_size
            if (params.start_date) query.start_date = params.start_date
            if (params.end_date) query.end_date = params.end_date
            if (params.company_id) query.company_id = params.company_id
            if (params.facility_id) query.facility_id = params.facility_id
            if (params.search) query.search = params.search

            const response = await $api<
                ApiResponse<PaginatedResponse<Visitor>>
            >('/api/portal/visitors/client/visitors/', {
                method: 'GET',
                query,
            })

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch visitors')
            }

            return {
                visitors: response.data.results,
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
            }
        },

        getVisitorById: async (id: string) => {
            const response = await $api<ApiResponse<Visitor>>(
                `/api/portal/visitors/client/visitors/${id}/`,
                {
                    method: 'GET',
                },
            )

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch visitor')
            }

            return response.data
        },

        registerWalkIn: async (data: Partial<Visitor>) => {
            const response = await $api<ApiResponse<Visitor>>(
                '/api/portal/visitors/client/visitors/',
                {
                    method: 'POST',
                    body: {
                        name: data.name,
                        email: data.email,
                        from_company: data.from_company,
                        visitor_type: 'walk_in',
                        facility_id: data.facility_id,
                        purpose_of_visit_id: data.purpose_of_visit_id,
                    },
                },
            )

            if (!response.success) {
                throw new Error(response.message || 'Failed to register visitor')
            }

            return response.data
        },

        updateVisitorStatus: async (id: string, status: string) => {
            // For approve/reject actions, the backend expects a POST with an 'action' field.
            // Map status strings to corresponding actions.
            const actionMap: Record<string, string> = {
                Approved: 'approve',
                Rejected: 'reject',
            };
            const action = actionMap[status];
            if (action) {
                const response = await $api<ApiResponse<Visitor>>(
                    `/api/portal/visitors/client/frontdesk/visitors/${id}/`,
                    {
                        method: 'POST',
                        body: { action },
                    },
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to update visitor status')
                }
                
                return response.data;
            }
            // Fallback to PATCH for other status updates
            if (status === 'Checked Out') {
                const response = await $api<ApiResponse<any>>(
                    `/api/portal/visitors/client/visitors/${id}/checkout/`,
                    { method: 'POST' },
                );
                if (!response.success) {
                    throw new Error(response.message || 'Failed to check out visitor')
                }
                
                return response.data;
            }
            
            const response = await $api<ApiResponse<Visitor>>(
                `/api/portal/visitors/client/visitors/${id}/`,
                {
                    method: 'PATCH',
                    body: { status },
                },
            );
            if (!response.success) {
                throw new Error(response.message || 'Failed to update visitor status')
            }
            return response.data;
        },

        verifyOtp: async (phone: string, otp: string): Promise<boolean> => {
            const response = await $api<ApiResponse<{ verified: boolean }>>(
                '/api/portal/visitors/verify-otp/',
                {
                    method: 'POST',
                    body: { phone, otp },
                },
            )

            return response.success && response.data.verified
        },

        getVisitorByPasscode: async (passcode: string): Promise<Visitor | null> => {
            const response = await $api<any>(
                '/api/portal/visitors/public/passcode/verify/',
                {
                    method: 'POST',
                    body: { passcode },
                },
            )

            if (!response.success || !response.data) {
                throw new Error(response.message || 'Invalid Passcode')
            }

            return response.data
        },

        getStats: async (): Promise<VisitorStats> => {
            const { visitors } = await useVisitorService().getVisitors({ page_size: 1000 })
            
            const checkedIn = visitors.filter(v => v.is_on_premises).length
            const pending = visitors.filter(v => v.status === 'Pending').length
            
            return {
                total: visitors.length,
                checkedIn,
                pending,
                expected: visitors.filter(v => v.status === 'Approved' || v.status === 'Pending').length,
            }
        },

        getTrends: async () => {
            const { visitors } = await useVisitorService().getVisitors({ page_size: 1000 })
            
            const trendsMap = new Map<string, number>()
            visitors.forEach(v => {
                const date = new Date(v.created_at).toLocaleDateString('en-US', { weekday: 'short' })
                trendsMap.set(date, (trendsMap.get(date) || 0) + 1)
            })
            
            return Array.from(trendsMap.entries()).map(([day, count]) => ({ day, count }))
        },

        getPurposeStats: async () => {
            const { visitors } = await useVisitorService().getVisitors({ page_size: 1000 })
            
            const purposeMap = new Map<string, number>()
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6b7280']
            
            visitors.forEach(v => {
                const purpose = v.purpose_of_visit || 'Other'
                purposeMap.set(purpose, (purposeMap.get(purpose) || 0) + 1)
            })
            
            return Array.from(purposeMap.entries()).map(([purpose, count], index) => ({
                purpose,
                count,
                color: colors[index % colors.length],
            }))
        },

        searchHosts: async (query: string) => {
            const response = await $api<ApiResponse<PaginatedResponse<any>>>(
                '/api/portal/users/',
                {
                    method: 'GET',
                    query: { search: query },
                },
            )

            if (!response.success) {
                return []
            }

            return response.data.results.map(user => ({
                id: user.id,
                name: user.name,
                role: user.role,
                avatar: user.avatar_url,
            }))
        },
    }
}
