export interface Plan {
    id: string;
    code: string;
    name: string;
    description: string;
    price: string | number;
    billing_cycle: string;
    is_custom: boolean;
    is_active: boolean;
    max_users: number;
    max_client_users: number;
    features?: string[];
    is_archive?: boolean;
    archived_at?: string | null;
    archived_by?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface CreatePlanPayload {
    code: string;
    name: string;
    description: string;
    price: number;
    billing_cycle: string;
    max_users: number;
    max_client_users: number;
    is_custom: boolean;
}

export interface UpdatePlanPayload {
    code?: string;
    name?: string;
    description?: string;
    price?: number;
    billing_cycle?: string;
    max_users?: number;
    max_client_users?: number;
    is_custom?: boolean;
    is_active?: boolean;
}

export interface PlanResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: Plan[];
    };
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface SinglePlanResponse {
    success: boolean;
    code: string;
    message: string;
    data: Plan;
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export const usePlanService = () => {
    const { request } = useApi();

    const getPlans = async (params: any = {}): Promise<PlanResponse> => {
        return request<PlanResponse>('/api/platform/billing/plans/', { params });
    };

    const getPlan = async (id: string): Promise<SinglePlanResponse> => {
        return request<SinglePlanResponse>(`/api/platform/billing/plans/${id}/`);
    };

    const createPlan = async (payload: CreatePlanPayload): Promise<SinglePlanResponse> => {
        return request<SinglePlanResponse>('/api/platform/billing/plans/', {
            method: 'POST',
            body: payload
        });
    };

    const updatePlan = async (id: string, payload: UpdatePlanPayload): Promise<SinglePlanResponse> => {
        return request<SinglePlanResponse>(`/api/platform/billing/plans/${id}/`, {
            method: 'PATCH',
            body: payload
        });
    };

    const deletePlan = async (id: string): Promise<any> => {
        return request(`/api/platform/billing/plans/${id}/`, {
            method: 'DELETE'
        });
    };

    return {
        getPlans,
        getPlan,
        createPlan,
        updatePlan,
        deletePlan
    };
};
