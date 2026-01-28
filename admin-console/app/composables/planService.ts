
export interface Plan {
    id: string;
    code: string;
    name: string;
    description: string;
    price: string;
    billing_cycle: string;
    is_custom: boolean;
    is_active: boolean;
    max_users: number;
    features?: string[];
}

export const usePlanService = () => {
    const { request } = useApi();

    const getPlans = async () => {
        return request<any>('/api/platform/billing/plans/?page_size=99&page=1');
    }

    return {
        getPlans
    }
}
