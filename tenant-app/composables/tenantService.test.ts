import { describe, it, expect, vi } from "vitest";
import { useTenantService } from "./tenantService";

// Mock useAuthFetch
const mockAuthFetch = vi.fn();
vi.mock("./useAuthFetch", () => ({
    useAuthFetch: () => ({
        authFetch: mockAuthFetch,
    }),
}));

describe("Tenant Service", () => {
    const { getTenantById, getCurrentTenantId } = useTenantService();

    it("should retrieve keys for tenant-a", async () => {
        const tenant = await getTenantById("tenant-a");
        expect(tenant).toBeDefined();
        expect(tenant?.name).toBe("Acme Corp");
    });

    it("should retrieve keys for tenant-b", async () => {
        const tenant = await getTenantById("tenant-b");
        expect(tenant).toBeDefined();
        expect(tenant?.name).toBe("Globex");
    });

    it("should return null for unknown tenant", async () => {
        const tenant = await getTenantById("unknown-tenant");
        expect(tenant).toBeNull();
    });

    it("should get current tenant id", () => {
        const id = getCurrentTenantId();
        expect(id).toBe("tenant-c");
    });

    it("should update tenant config", async () => {
        mockAuthFetch.mockResolvedValue({
            success: true,
            data: { credit_system_enabled: true },
        });

        const { updateTenantConfig } = useTenantService();
        const result = await updateTenantConfig("tenant-a", {
            credit_system_enabled: true,
        });

        expect(mockAuthFetch).toHaveBeenCalledWith(
            "/api/portal/tenants/configs/",
            {
                method: "POST",
                body: { credit_system_enabled: true },
            },
        );
        expect(result).toBeDefined();
        expect(result?.credit_system_enabled).toBe(true);
    });

    it("should get tenant config", async () => {
        mockAuthFetch.mockResolvedValue({
            success: true,
            data: {
                results: [{ credit_system_enabled: false }],
            },
        });

        const { getTenantConfig } = useTenantService();
        const result = await getTenantConfig("tenant-a");

        expect(mockAuthFetch).toHaveBeenCalledWith(
            "/api/portal/tenants/configs/",
        );
        expect(result).toBeDefined();
        expect(result?.credit_system_enabled).toBe(false);
    });

    it("should update module config", async () => {
        mockAuthFetch.mockResolvedValue({ success: true });

        const { updateModuleConfig } = useTenantService();
        const result = await updateModuleConfig("mod-1", "credit_only");

        expect(mockAuthFetch).toHaveBeenCalledWith(
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
