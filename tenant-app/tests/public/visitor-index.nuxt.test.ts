import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import VisitorIndexPage from "../../app/pages/public/visitor/index.vue";
import { createTestingPinia } from "@pinia/testing";

// Mock the publicVisitorService composable
vi.mock("../../composables/publicVisitorService", () => ({
    usePublicVisitorService: () => ({
        getFacility: vi.fn().mockResolvedValue({
            id: "test-facility-id",
            name: "Test Facility",
            location: "Test Location",
        }),
    }),
}));

// Mock the route to include facility query param
vi.mock("vue-router", async (importOriginal) => {
    const actual = await importOriginal<typeof import("vue-router")>();
    return {
        ...actual,
        useRoute: () => ({
            query: {
                facility: "test-facility-id",
                tenant: "test-tenant-id",
            },
        }),
    };
});

describe("Public Visitor Index Page", () => {
    const mountOptions = {
        global: {
            plugins: [
                createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        tenant: { tenant: { name: "Test Corp" } },
                    },
                }),
            ],
        },
    };

    it("should render Welcome text", async () => {
        const wrapper = await mountSuspended(VisitorIndexPage, mountOptions);
        expect(wrapper.text()).toContain("Welcome");
    });

    it("should show Walk-in Visitor option", async () => {
        const wrapper = await mountSuspended(VisitorIndexPage, mountOptions);
        expect(wrapper.text()).toContain("Walk-in Visitor");
    });

    it("should show Pre-invited Visitor option", async () => {
        const wrapper = await mountSuspended(VisitorIndexPage, mountOptions);
        expect(wrapper.text()).toContain("Pre-invited Visitor");
    });

    it("should show help contact link", async () => {
        const wrapper = await mountSuspended(VisitorIndexPage, mountOptions);
        expect(wrapper.text()).toContain("Need help");
    });
});
