import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useAuthStore } from "./auth";

// Mock the userService
vi.mock("../composables/userService", () => ({
    useUserService: () => ({
        getUserModules: vi
            .fn()
            .mockResolvedValue(["dashboard", "visitors", "companies"]),
    }),
}));

describe("Auth Store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe("Initial State", () => {
        it("should have null user initially", () => {
            const store = useAuthStore();
            expect(store.user).toBeNull();
        });

        it("should have null token initially", () => {
            const store = useAuthStore();
            expect(store.token).toBeNull();
        });

        it("should have empty modules array initially", () => {
            const store = useAuthStore();
            expect(store.modules).toEqual([]);
        });
    });

    describe("Getters", () => {
        it("isAuthenticated should return false when no token", () => {
            const store = useAuthStore();
            expect(store.isAuthenticated).toBe(false);
        });

        it("isAuthenticated should return true when token exists", () => {
            const store = useAuthStore();
            store.token = "test-token";
            expect(store.isAuthenticated).toBe(true);
        });

        it("hasModule should return true for existing module", () => {
            const store = useAuthStore();
            store.modules = ["dashboard", "visitors"];
            expect(store.hasModule("dashboard")).toBe(true);
        });

        it("hasModule should return false for non-existing module", () => {
            const store = useAuthStore();
            store.modules = ["dashboard"];
            expect(store.hasModule("visitors")).toBe(false);
        });
    });

    describe("Actions", () => {
        it("login should set user and token", async () => {
            const store = useAuthStore();
            const user = { id: 1, name: "John Doe" };
            const token = "auth-token-123";

            // Mock global $fetch
            const fetchMock = vi.fn().mockResolvedValue({
                success: true,
                data: { user, access: token, refresh: "refresh-token" },
            });
            vi.stubGlobal("$fetch", fetchMock);

            // Mock useRuntimeConfig
            const configMock = { public: { apiBaseUrl: "http://localhost" } };
            vi.stubGlobal("useRuntimeConfig", () => configMock);
            // Mock useValidation (called in catch block, but if success we might not need it)
            // But verify calls

            await store.login("test@example.com", "123456", "app-id");

            expect(store.user).toEqual(user);
            expect(store.token).toBe(token);

            vi.unstubAllGlobals();
        });

        it("logout should clear user, token and modules", () => {
            const store = useAuthStore();
            // Set state directly
            store.user = { name: "Test" };
            store.token = "token";
            store.modules = ["dashboard"];

            store.logout();

            expect(store.user).toBeNull();
            expect(store.token).toBeNull();
            expect(store.modules).toEqual([]);
        });

        it("fetchModules should populate modules array", async () => {
            const store = useAuthStore();
            await store.fetchModules();

            expect(store.modules).toContain("dashboard");
            expect(store.modules).toContain("visitors");
            expect(store.modules).toContain("companies");
        });
    });
});
