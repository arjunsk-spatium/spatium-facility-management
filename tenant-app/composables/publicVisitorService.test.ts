import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { usePublicVisitorService } from "./publicVisitorService";

vi.mock("#imports", () => ({
    useRuntimeConfig: () => ({
        public: {
            apiBaseUrl: "https://api.example.com",
        },
    }),
    useRoute: () => ({
        query: { tenant: "tenant-123" },
    }),
    useCookie: () => {
        return { value: "mock-token" };
    },
}));

vi.mock("nuxt/app", () => ({
    useRuntimeConfig: () => ({
        public: {
            apiBaseUrl: "https://api.example.com",
        },
    }),
    useRoute: () => ({
        query: { tenant: "tenant-123" },
    }),
    useCookie: () => {
        return { value: "mock-token" };
    },
}));

// Mock useRuntimeConfig and useRoute directly since they are auto-imported in setup
vi.stubGlobal("useRuntimeConfig", () => ({
    public: {
        apiBaseUrl: "https://api.example.com",
    },
}));

vi.stubGlobal("useRoute", () => ({
    query: { tenant: "tenant-123" },
}));

vi.stubGlobal("useCookie", () => {
    return { value: "mock-token" };
});

vi.mock("../stores/tenant", () => ({
    useTenantStore: () => ({
        tenant: { id: "tenant-store-id" },
    }),
}));

describe("Public Visitor Service", () => {
    let originalFetch: typeof global.fetch;
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        originalFetch = global.fetch;
        global.fetch = mockFetch;
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it("should request OTP", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        const service = usePublicVisitorService();
        const result = await service.requestOtp("1234567890");

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/public/otp/request/");
        
        const options = mockFetch.mock.calls[0][1];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ phone: "1234567890" });
        expect(result).toBe(true);
    });

    it("should verify OTP", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { access: "new-token", expires_in: 3600 } }),
        });

        const service = usePublicVisitorService();
        const result = await service.verifyOtp("1234567890", "1234");

        expect(result).toBe(true);
        expect(mockFetch).toHaveBeenCalled();
        const options = mockFetch.mock.calls[0][1];
        expect(JSON.parse(options.body)).toEqual({ phone: "1234567890", otp: "1234" });
    });

    it("should get me", async () => {
        const mockData = { id: "v1", name: "John" };
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockData }),
        });

        const service = usePublicVisitorService();
        const result = await service.getMe();

        expect(result).toEqual(mockData);
        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/public/me/");
    });

    it("should get purposes of visit", async () => {
        const mockData = [{ id: "p1", name: "Meeting" }];
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockData }),
        });

        const service = usePublicVisitorService();
        const result = await service.getPurposesOfVisit();

        expect(result).toEqual(mockData);
    });

    it("should get companies", async () => {
        const mockData = [{ id: "c1", name: "Acme" }];
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockData }),
        });

        const service = usePublicVisitorService();
        const result = await service.getCompanies("fac-1");

        expect(result).toEqual(mockData);
        expect(mockFetch.mock.calls[0][0]).toContain("facility_id=fac-1");
    });

    it("should create walk in with FormData", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { id: "new-v" } }),
        });

        const service = usePublicVisitorService();
        const formData = new FormData();
        formData.append("name", "Jane");
        
        const result = await service.createWalkIn(formData);

        expect(result.id).toBe("new-v");
        const options = mockFetch.mock.calls[0][1];
        expect(options.body).toBeInstanceOf(FormData);
    });

    it("should handle pre-invite", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { id: "inv-1" } }),
        });

        const service = usePublicVisitorService();
        const inviteData = {
            facility_id: "fac-1",
            purpose_of_visit_id: "p1",
            name: "John",
            phone: "123",
            appointment_date: "2024-01-01",
            appointment_time: "10:00",
        };
        const result = await service.preInvite(inviteData);

        expect(result.id).toBe("inv-1");
        const options = mockFetch.mock.calls[0][1];
        expect(JSON.parse(options.body)).toEqual(inviteData);
    });
});
