import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useDepartmentService } from "./departmentService";

describe("Department Service", () => {
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

    it("should fetch departments", async () => {
        const mockData = [
            { id: "d1", name: "Engineering", description: "Eng team", slug: "engineering" },
            { id: "d2", name: "HR", description: "HR team", slug: "hr" },
        ];
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: { results: mockData } }),
        });

        const service = useDepartmentService();
        const result = await service.fetchDepartments();

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        expect(url).toContain("/api/portal/departments/");
        expect(result).toEqual(mockData);
    });

    it("should create a department", async () => {
        const mockDept = { id: "d1", name: "Engineering", description: "Eng team" };
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockDept }),
        });

        const service = useDepartmentService();
        const result = await service.createDepartment({ name: "Engineering", description: "Eng team" });

        expect(mockFetch).toHaveBeenCalled();
        const options = mockFetch.mock.calls[0][1];
        expect(options.method).toBe("POST");
        expect(JSON.parse(options.body)).toEqual({ name: "Engineering", description: "Eng team" });
        expect(result).toEqual(mockDept);
    });

    it("should update a department", async () => {
        const mockDept = { id: "d1", name: "Engineering 2", description: "Updated" };
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true, data: mockDept }),
        });

        const service = useDepartmentService();
        const result = await service.updateDepartment("d1", { name: "Engineering 2" });

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        const options = mockFetch.mock.calls[0][1];
        expect(url).toContain("/api/portal/departments/d1/");
        expect(options.method).toBe("PATCH");
        expect(JSON.parse(options.body)).toEqual({ name: "Engineering 2" });
        expect(result).toEqual(mockDept);
    });

    it("should delete a department", async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            json: async () => ({ success: true }),
        });

        const service = useDepartmentService();
        const result = await service.deleteDepartment("d1");

        expect(mockFetch).toHaveBeenCalled();
        const url = mockFetch.mock.calls[0][0];
        const options = mockFetch.mock.calls[0][1];
        expect(url).toContain("/api/portal/departments/d1/");
        expect(options.method).toBe("DELETE");
        expect(result).toBe(true);
    });

    it("should return empty array when fetch fails", async () => {
        mockFetch.mockRejectedValue(new Error("Network error"));

        const service = useDepartmentService();
        const result = await service.fetchDepartments();

        expect(result).toEqual([]);
    });
});
