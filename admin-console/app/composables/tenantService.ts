
// Tenant Service
export interface Tenant {
    id: string
    name: string
    domain: string
    adminEmail?: string
    planId?: string
    planName?: string
    status?: 'active' | 'trial' | 'suspended' | 'inactive'
    modules?: string[]
    moduleCount?: number
    createdAt?: string
    userCount?: number
    clientUserCount?: number
    onboarded_at?: string
    updated_at?: string
}

export interface SubscriptionPayload {
    tenant: string;
    plan: string;
    max_users?: number;
    max_client_users?: number;
    price?: number;
    billing_cycle?: string;
    status?: string;
    start_date: string;
    end_date: string;
    modules?: string[];
}

// Mock data for display purposes until real APIs are ready
const mockTenants: Tenant[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        domain: 'acme.spatium.app',
        adminEmail: 'admin@acme.com',
        planId: 'pro',
        planName: 'Pro Plan',
        status: 'active',
        modules: ['visitors', 'helpdesk'],
        createdAt: '2024-01-15',
        userCount: 45
    },
    // ... active mock data
]

export const useTenantService = () => {
    const { request } = useApi();

    // Real API Calls for Wizard
    const createTenant = async (data: { name: string; domain: string }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('domain', data.domain);

        return request<Tenant>('/api/platform/tenants/tenants/', {
            method: 'POST',
            body: formData,
        });
    };

    const updateTenant = async (id: string, data: { name: string; domain: string; status?: string }) => {
        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('domain', data.domain);
        if (data.status) {
            formData.append('status', data.status);
        }

        return request<Tenant>(`/api/platform/tenants/tenants/${id}/`, {
            method: 'PATCH',
            body: formData,
        });
    };

    const assignPlan = async (payload: SubscriptionPayload) => {
        // useApi already sets headers, so if payload is JSON, useFetch defaults to application/json
        return request('/api/platform/billing/subscriptions/', {
            method: 'POST',
            body: payload,
        });
    };

    const assignModules = async (payload: { tenant: string; modules: { module: string; priority: number }[] }) => {
        return request('/api/platform/modules/tenant-assignments/', {
            method: 'POST',
            body: payload,
        });
    };

    const getTenantModules = async (tenantId: string) => {
        return request<any>(`/api/platform/modules/tenant-assignments/?tenant_id=${tenantId}`, {
            method: 'GET',
        });
    }

    const getFeatures = async () => {
        return request<any>('/api/platform/modules/features/', {
            method: 'GET',
        });
    };

    const getTenantFeatures = async (tenantId: string) => {
        return request<any>(`/api/platform/modules/tenant-features/?tenant_id=${tenantId}`, {
            method: 'GET',
        });
    };

    const assignFeatures = async (payload: { tenant: string; features: string[]; is_active: boolean }) => {
        return request('/api/platform/modules/tenant-features/', {
            method: 'POST',
            body: payload,
        });
    };

    const updateBranding = async (formData: FormData) => {
        return request('/api/platform/tenants/branding/', {
            method: 'POST',
            body: formData,
        });
    };

    const updatePii = async (payload: any) => {
        return request('/api/platform/tenants/pii/', {
            method: 'POST',
            body: payload,
        });
    };

    const getTenantSubscription = async (tenantId: string) => {
        return request<any>(`/api/platform/billing/subscriptions/?tenant_id=${tenantId}`, {
            method: 'GET',
        });
    };

    const getTenantBranding = async (tenantId: string) => {
        return request<any>(`/api/platform/tenants/branding/?tenant_id=${tenantId}`, {
            method: 'GET',
        });
    };

    const getTenantPii = async (tenantId: string) => {
        return request<any>(`/api/platform/tenants/pii/?tenant_id=${tenantId}`, {
            method: 'GET',
        });
    };

    // Mocks / Placeholders for other actions to prevent errors
    const getTenants = async () => {
        return request<any>('/api/platform/tenants/tenants/', {
            method: 'GET',
        });
    }



    const getTenantById = async (id: string): Promise<Tenant | null> => {
        try {
            const response = await request<any>(`/api/platform/tenants/tenants/${id}/`, {
                method: 'GET',
            });

            // Handle structure: { success: true, data: { ... } } or just { ... }
            if (response && response.success && response.data) {
                return response.data;
            }
            return response as Tenant;
        } catch (error) {
            console.error('Failed to get tenant by id:', error);
            return null;
        }
    }

    const deleteTenant = async (id: string): Promise<boolean> => {
        try {
            await request(`/api/platform/tenants/tenants/${id}/`, {
                method: 'DELETE',
            });
            return true;
        } catch (error) {
            console.error('Failed to delete tenant:', error);
            return false;
        }
    }

    const getDashboardData = async () => {
        return request<any>('/api/platform/tenants/admin/dashboard/', {
            method: 'GET',
        });
    }

    const getTenantInsights = async () => {
        return request<any>('/api/platform/tenants/admin/insights/', {
            method: 'GET',
        });
    }

    return {
        createTenant,
        updateTenant,
        assignPlan,
        assignModules,
        getTenantModules,
        getFeatures,
        getTenantFeatures,
        assignFeatures,
        getTenantSubscription,
        getTenantBranding,
        getTenantPii,
        updateBranding,
        updatePii,
        getTenants,
        getTenantById,
        deleteTenant,
        getDashboardData,
        getTenantInsights
    }
}
