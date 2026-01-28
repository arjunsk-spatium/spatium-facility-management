
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
        return request<any>('/api/platform/billing/plans/?page_size=99&page=1');
    }

    return {
        getPlans
    }
}
