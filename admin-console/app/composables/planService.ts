
export interface Plan {
    id: string;
    name: string;
    description?: string;
    price?: number;
    // Add other fields as needed
}

export const usePlanService = () => {
    const { request } = useApi();

    const getPlans = async () => {
        return request<Plan[]>('/api/platform/tenants/plans/');
    }

    return {
        getPlans
    }
}
