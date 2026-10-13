import { defineStore } from "pinia";
import type { Tenant } from "../composables/tenantService";
import { extractDomainInfo, type DomainInfo } from "../composables/domainUtils";

export type TenantErrorType = 'no_tenant_subdomain' | 'tenant_not_registered' | 'fetch_error' | null;

export const useTenantStore = defineStore("tenant", {
    state: () => ({
        tenant: null as Tenant | null,
        loading: false,
        error: null as string | null,
        errorType: null as TenantErrorType,
        domainInfo: null as DomainInfo | null,
    }),
    actions: {
        async fetchTenant(tenantId: string) {
            const { getTenantById } = useTenantService();
            this.loading = true;
            this.error = null;
            this.errorType = null;
            try {
                const tenant = await getTenantById(tenantId);
                this.tenant = tenant;
            } catch (e) {
                this.error = "Failed to load tenant configuration";
                this.errorType = 'fetch_error';
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
        async fetchTenantByDomain() {
            const { getTenantByDomain } = useTenantService();
            this.loading = true;
            this.error = null;
            this.errorType = null;
            try {
                if (typeof window === "undefined") {
                    this.loading = false;
                    return;
                }

                const currentHost = window.location.host;
                const protocol = window.location.protocol;
                const domainInfo = extractDomainInfo(currentHost, protocol);
                this.domainInfo = domainInfo;

                // 1. If accessing apex/root domain without a tenant subdomain (e.g. domain.com or localhost:4000)
                if (!domainInfo.hasTenantSubdomain) {
                    this.error = "Subdomain required";
                    this.errorType = "no_tenant_subdomain";
                    return;
                }

                // 2. Subdomain exists (e.g. xyz.domain.com or xyz.localhost:4000)
                let lookupDomain = domainInfo.fullHost;
                if (domainInfo.isLocalhost) {
                    // Map local subdomain to production API lookup if applicable
                    lookupDomain = `${domainInfo.subdomain}.nexspace.app`;
                }

                const { tenant, notRegistered } = await getTenantByDomain(lookupDomain);
                if (tenant) {
                    this.tenant = tenant;
                    // Persist tenant ID so API calls can use it immediately
                    localStorage.setItem("tenant_id", tenant.id);
                    // Also set as cookie so the server-side proxy middleware can read it
                    document.cookie = `tenant_id=${tenant.id}; path=/; max-age=86400; SameSite=Lax`;
                } else if (notRegistered) {
                    this.error = "Tenant not registered";
                    this.errorType = "tenant_not_registered";
                } else {
                    this.error = "Tenant not found for domain";
                    this.errorType = "tenant_not_registered";
                }
            } catch (e) {
                this.error = "Failed to load tenant configuration for domain";
                this.errorType = "fetch_error";
                console.error(e);
            } finally {
                this.loading = false;
            }
        },
    },
    getters: {
        primaryColor: (state) => state.tenant?.colors.primary || "#3378ff",
        secondaryColor: (state) => state.tenant?.colors.secondary || "#64748b",
        tenantName: (state) => state.tenant?.name || "Nexspace Hub",
        tenantLogo: (state) => state.tenant?.logoUrl || "",
        darkLogo: (state) => state.tenant?.darkLogoUrl || state.tenant?.logoUrl || "",
        faviconUrl: (state) => state.tenant?.faviconUrl || "/favicon.ico",
    },
});
