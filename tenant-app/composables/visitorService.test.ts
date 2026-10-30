import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useVisitorService } from "./visitorService";

describe("Visitor Service", () => {
    let visitorService: ReturnType<typeof useVisitorService>;
    let originalFetch: typeof global.fetch;
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        originalFetch = global.fetch;
        global.fetch = mockFetch;
        visitorService = useVisitorService();
        
        // Mock token to avoid 401s
        if (typeof window !== "undefined") {
            localStorage.setItem("access_token", "fake-token");
            localStorage.setItem("tenant_id", "fake-tenant");
        }
    });

    afterEach(() => {
        global.fetch = originalFetch;
        if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("tenant_id");
        }
    });

    it("should fetch visitors with pagination and filters", async () => {
        const mockResponse = {
            success: true,
            data: {
                results: [{ id: "v1", name: "John Doe" }],
                count: 1,
                next: null,
                previous: null,
            },
        };
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockResponse,
        });

        const result = await visitorService.getVisitors({ page: 1, search: "John" });

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/client/visitors/");
        expect(url).toContain("page=1");
        expect(url).toContain("search=John");
        expect(result.visitors.length).toBe(1);
        expect(result.count).toBe(1);
    });

    it("should throw error if getVisitors fails", async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({ success: false, message: "Error fetching" }),
        });
        await expect(visitorService.getVisitors()).rejects.toThrow("Error fetching");
    });

    it("should fetch visitor by id", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { id: "v1", name: "John Doe" } }),
        });
        const result = await visitorService.getVisitorById("v1");
        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/client/visitors/v1/");
        expect(result.id).toBe("v1");
    });

    it("should register a walk-in visitor", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { id: "v2" } }),
        });
        const result = await visitorService.registerWalkIn({
            name: "Jane Doe",
            email: "jane@example.com",
        });
        expect(mockFetch).toHaveBeenCalled();
        const options = mockFetch.mock.calls[0][1];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toMatchObject({
            name: "Jane Doe",
            email: "jane@example.com",
            visitor_type: "walk_in",
        });
        expect(result.id).toBe("v2");
    });

    it("should update visitor status with approve action", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { id: "v1", status: "Approved" } }),
        });
        const result = await visitorService.updateVisitorStatus("v1", "Approved", "Looks good");
        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/client/frontdesk/visitors/v1/");
        const options = mockFetch.mock.calls[0][1];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ action: "approve", frontdesk_remarks: "Looks good" });
        expect(result.status).toBe("Approved");
    });

    it("should update visitor status to Checked Out", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { success: true } }),
        });
        await visitorService.updateVisitorStatus("v1", "Checked Out");
        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/visitors/client/visitors/v1/checkout/");
    });

    it("should fallback to PATCH for other status updates", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { id: "v1", status: "Pending" } }),
        });
        const result = await visitorService.updateVisitorStatus("v1", "Pending");
        expect(mockFetch).toHaveBeenCalled();
        const options = mockFetch.mock.calls[0][1];
        expect(options.method).toBe("PATCH");
        expect(JSON.parse(options.body)).toEqual({ status: "Pending" });
        expect(result.status).toBe("Pending");
    });

    it("should verify OTP successfully", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { verified: true } }),
        });
        const result = await visitorService.verifyOtp("1234567890", "1234");
        expect(result).toBe(true);
    });

    it("should get visitor by passcode", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ success: true, data: { id: "v1" } }),
        });
        const result = await visitorService.getVisitorByPasscode("123456");
        expect(result?.id).toBe("v1");
    });

    it("should get stats", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    results: [
                        { id: "v1", is_on_premises: true, status: "Approved" },
                        { id: "v2", is_on_premises: false, status: "Pending" },
                    ],
                    count: 2,
                },
            }),
        });
        const result = await visitorService.getStats();
        expect(result.total).toBe(2);
        expect(result.checkedIn).toBe(1);
        expect(result.pending).toBe(1);
        expect(result.expected).toBe(2);
    });
});
