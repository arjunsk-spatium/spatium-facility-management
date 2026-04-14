import { defineStore } from "pinia";
import type { Tenant } from "../composables/tenantService";

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        tenant: null as Tenant | null,
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchTenant(tenantId: string) {
            const { getTenantById } = useTenantService();
            this.loading = true;
            this.error = null;
            try {
                const tenant = await getTenantById(tenantId);
                this.tenant = tenant;
            } catch (e) {
                this.error = "Failed to load tenant configuration";
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async fetchTenantByDomain() {
            const { getTenantByDomain } = useTenantService();
            this.loading = true;
            this.error = null;
            try {
                let origin = document.location.origin.split("//")[1] || "";
                // If in development, replace .localhost:4000 with .nexaspace.app
                const config = useRuntimeConfig();
                // Since runtimeConfig server env is not strictly available client-side in the same way, we can check the origin string directly
                if (
                    origin.includes(".localhost:4000") ||
                    origin.includes(".localhost")
                ) {
                    origin = origin
                        .replace(".localhost:4000", ".nexspace.app")
                        .replace(".localhost", ".nexspace.app");
                }

                const { tenant, notRegistered } = await getTenantByDomain(origin);
                if (tenant) {
                    this.tenant = tenant;
                    // Persist tenant ID so API calls can use it immediately
                    localStorage.setItem("tenant_id", tenant.id);
                    // Also set as cookie so the server-side proxy middleware can read it
                    document.cookie = `tenant_id=${tenant.id}; path=/; max-age=86400; SameSite=Lax`;

                } else if (notRegistered) {
                    this.error = "Tenant not registered";
                } else {
                    this.error = "Tenant not found for domain";
                }
            } catch (e) {
                this.error = "Failed to load tenant configuration for domain";
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
    },
    getters: {
        primaryColor: (state) => state.tenant?.colors.primary || "#3378ff",
        secondaryColor: (state) => state.tenant?.colors.secondary || "#64748b",
        tenantName: (state) => state.tenant?.name || "Spatium Hub",
        tenantLogo: (state) => state.tenant?.logoUrl || "",
        darkLogo: (state) => state.tenant?.darkLogoUrl || state.tenant?.logoUrl || "",
        faviconUrl: (state) => state.tenant?.faviconUrl || "/favicon.ico",
    },
});
