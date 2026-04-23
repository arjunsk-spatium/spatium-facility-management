import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTenantService } from "./tenantService";

const mockApi = vi.fn();
vi.mock("#app", () => ({
    useNuxtApp: () => ({
        $api: mockApi,
    }),
}));

vi.mock("../stores/auth", () => ({
    useAuthStore: () => ({
        refreshAccessToken: vi.fn().mockResolvedValue(false),
    }),
}));

describe("Tenant Service", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setActivePinia(createPinia());
    });

    const { getTenantById, getCurrentTenantId } = useTenantService();

    it("should retrieve keys for tenant-a", async () => {
        const tenant = await getTenantById("tenant-a");
        expect(tenant).toBeDefined();
        expect(tenant?.name).toBe("Spatium Hub");
    });

    it("should retrieve keys for tenant-b", async () => {
        const tenant = await getTenantById("tenant-b");
        expect(tenant).toBeDefined();
        expect(tenant?.name).toBe("Spatium Hub");
    });

    it("should return null for unknown tenant", async () => {
        const tenant = await getTenantById("unknown-tenant");
        expect(tenant).toBeDefined();
    });

    it("should get current tenant id", () => {
        const id = getCurrentTenantId();
        expect(id).toBe("tenant-c");
    });

    it("should update tenant config", async () => {
        mockApi.mockResolvedValue({
            success: true,
            data: { credit_system_enabled: true, visitor_company_required: true, visitor_email_required: false },
        });

        const { updateTenantConfig } = useTenantService();
        const result = await updateTenantConfig("tenant-a", {
            credit_system_enabled: true,
            visitor_company_required: true,
            visitor_email_required: false,
        });

        expect(mockApi).toHaveBeenCalledWith(
            "/api/portal/tenants/configs/",
            {
                method: "POST",
                body: { credit_system_enabled: true, visitor_company_required: true, visitor_email_required: false },
            },
        );
        expect(result).toBeDefined();
        expect(result?.credit_system_enabled).toBe(true);
        expect(result?.visitor_company_required).toBe(true);
        expect(result?.visitor_email_required).toBe(false);
    });

    it("should get tenant config", async () => {
        mockApi.mockResolvedValue({
            success: true,
            data: {
                results: [{ credit_system_enabled: false, visitor_company_required: true, visitor_email_required: true }],
            },
        });

        const { getTenantConfig } = useTenantService();
        const result = await getTenantConfig("tenant-a");

        expect(mockApi).toHaveBeenCalledWith(
            "/api/portal/tenants/configs/",
        );
        expect(result).toBeDefined();
        expect(result?.credit_system_enabled).toBe(false);
        expect(result?.visitor_company_required).toBe(true);
        expect(result?.visitor_email_required).toBe(true);
    });

    it("should update module config", async () => {
        mockApi.mockResolvedValue({ success: true });

        const { updateModuleConfig } = useTenantService();
        const result = await updateModuleConfig("mod-1", "credit_only");

        expect(mockApi).toHaveBeenCalledWith(
            "/api/portal/tenants/module-configs/",
            {
                method: "POST",
                body: {
                    modules: [{ module: "mod-1", billing_mode: "credit_only" }],
                },
            },
        );
        expect(result).toBe(true);
    });
});
