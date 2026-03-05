export interface Tenant {
    id: string;
    name: string;
    logoUrl: string;
    faviconUrl?: string;
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

export const useTenantService = () => {
    const { $api } = useNuxtApp();

    const getTenantById = async (id: string): Promise<Tenant | null> => {
        // Return a default tenant configuration
        // Replace with real API call when tenant API is available
        return {
            id,
            name: "Spatium Hub",
            logoUrl: "",
            faviconUrl: "/favicon.ico",
            colors: {
                primary: "#0499E4",
                secondary: "#64748b",
            },
        };
    };

    /**
     * Helper to derive tenant ID from current location/domain
     * For now, we will mock this or just return a default
     */
    const getCurrentTenantId = (): string => {
        if (typeof window !== "undefined") {
            try {
                const userStr = localStorage.getItem("auth_user");
                if (userStr) {
                    const user = JSON.parse(userStr);
                    if (user.tenant_id) return user.tenant_id;
                }
            } catch (e) {
                console.error("Error reading tenant_id from localStorage", e);
            }
        }
        // Fallback for mock tenant loading
        return "tenant-c";
    };

    const updateTenantConfig = async (
        tenantId: string,
        config: Partial<TenantConfig>,
    ): Promise<TenantConfig | null> => {
        const response = await $api<any>("/api/portal/tenants/configs/", {
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
        const response = await $api<any>("/api/portal/tenants/configs/");

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
        const response = await $api<any>(
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
