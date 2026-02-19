import { useAuthFetch } from "./useAuthFetch";

export interface Tenant {
    id: string;
    name: string;
    logoUrl: string;
    faviconUrl?: string; // Optional favicon
    colors: {
        primary: string;
        secondary: string;
    };
}

export interface TenantConfig {
    id: string;
    tenant: string;
    credit_system_enabled: boolean;
    created_at: string;
    updated_at: string;
}

const MOCK_TENANTS: Record<string, Tenant> = {
    "tenant-a": {
        id: "tenant-a",
        name: "Acme Corp",
        logoUrl: "https://placehold.co/200x50/3378ff/ffffff?text=Acme+Corp",
        faviconUrl: "https://placehold.co/32x32/3378ff/ffffff?text=A",
        colors: {
            primary: "#3378ff", // Blue
            secondary: "#64748b",
        },
    },
    "tenant-b": {
        id: "tenant-b",
        name: "Globex",
        logoUrl: "https://placehold.co/200x50/10b981/ffffff?text=Globex",
        faviconUrl: "https://placehold.co/32x32/10b981/ffffff?text=G",
        colors: {
            primary: "#10b981", // Green
            secondary: "#f59e0b",
        },
    },

    "tenant-c": {
        id: "tenant-c",
        name: "cvent",
        logoUrl:
            "https://curehht.org/wp-content/uploads/2022/04/cvent-logo-HI-Res.png",
        faviconUrl:
            "https://www.cvent.com/themes/custom/themekit/images/favicon/favicon.ico",
        colors: {
            primary: "#0499E4", // Blue
            secondary: "#f59e0b",
        },
    },
};

export const useTenantService = () => {
    const getTenantById = async (id: string): Promise<Tenant | null> => {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return MOCK_TENANTS[id] || null;
    };

    /**
     * Helper to derive tenant ID from current location/domain
     * For now, we will mock this or just return a default
     */
    const getCurrentTenantId = (): string => {
        // In real app, parse window.location.hostname
        // For now, let's hardcode or check query param if needed
        // Simple mock: return 'tenant-a' by default
        return "tenant-c";
    };

    const updateTenantConfig = async (
        tenantId: string,
        config: Partial<TenantConfig>,
    ): Promise<TenantConfig | null> => {
        const { authFetch } = useAuthFetch();
        const response = await authFetch<any>("/api/portal/tenants/configs/", {
            method: "POST",
            body: config,
        });

        if (response.success && response.data) {
            return response.data;
        }
        return null;
    };

    const getTenantConfig = async (
        tenantId: string,
    ): Promise<TenantConfig | null> => {
        const { authFetch } = useAuthFetch();
        const response = await authFetch<any>("/api/portal/tenants/configs/");

        if (
            response.success &&
            response.data &&
            response.data.results &&
            response.data.results.length > 0
        ) {
            return response.data.results[0];
        }
        return null;
    };

    const updateModuleConfig = async (
        moduleId: string,
        billingMode: string,
    ): Promise<boolean> => {
        const { authFetch } = useAuthFetch();
        const response = await authFetch<any>(
            "/api/portal/tenants/module-configs/",
            {
                method: "POST",
                body: {
                    modules: [
                        {
                            module: moduleId,
                            billing_mode: billingMode,
                        },
                    ],
                },
            },
        );
        return response.success === true;
    };

    return {
        getTenantById,
        getCurrentTenantId,
        updateTenantConfig,
        getTenantConfig,
        updateModuleConfig,
    };
};
