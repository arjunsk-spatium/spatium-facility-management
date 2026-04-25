import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VisitorWidget from "./VisitorWidget.vue";
import { useDashboardStore } from "../../stores/dashboard";

vi.mock("../../stores/dashboard", () => ({
    useDashboardStore: vi.fn(),
}));

describe("VisitorWidget.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useDashboardStore as any).mockReturnValue({
            loading: false,
            summary: {
                visitors: {
                    today_count: 5,
                    last_7_days: [
                        { date: "2024-01-01", count: 10 },
                        { date: "2024-01-02", count: 15 },
                    ],
                },
                pre_invites: {
                    today_count: 2,
                },
            },
        });
    });

    it("renders loading state", () => {
        (useDashboardStore as any).mockReturnValue({ loading: true, summary: null });
        const wrapper = mount(VisitorWidget, {
            global: {
                stubs: {
                    "a-card": { template: "<div><slot name='title'></slot><slot></slot><slot name='extra'></slot></div>" },
                    "a-spin": true,
                    UsergroupAddOutlined: true,
                    NuxtLink: true,
                },
            },
        });
        
        expect(wrapper.find("a-spin-stub").exists()).toBe(true);
    });

    it("renders visitor and pre-invite counts", () => {
        const wrapper = mount(VisitorWidget, {
            global: {
                stubs: {
                    "a-card": { template: "<div><slot name='title'></slot><slot></slot><slot name='extra'></slot></div>" },
                    "a-spin": true,
                    UsergroupAddOutlined: true,
                    NuxtLink: true,
                },
            },
        });
        
        expect(wrapper.text()).toContain("5");
        expect(wrapper.text()).toContain("Visitors Today");
        expect(wrapper.text()).toContain("2");
        expect(wrapper.text()).toContain("Pre-invites Today");
        
        // Sum of last 7 days = 10 + 15 = 25
        expect(wrapper.text()).toContain("Last 7 days total: 25");
    });
});
