import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import VisitorTrendWidget from "./VisitorTrendWidget.vue";
import { useDashboardStore } from "../../stores/dashboard";

vi.mock("../../stores/dashboard", () => ({
    useDashboardStore: vi.fn(),
}));

vi.mock("@antv/g2plot", () => {
    return {
        Line: vi.fn().mockImplementation(() => ({
            render: vi.fn(),
            destroy: vi.fn(),
        })),
    };
});

describe("VisitorTrendWidget.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        (useDashboardStore as any).mockReturnValue({
            loading: false,
            summary: {
                visitors: {
                    last_7_days: [
                        { date: "2024-01-01", count: 10 },
                        { date: "2024-01-02", count: 15 },
                    ],
                },
            },
        });
    });

    it("renders loading state", () => {
        (useDashboardStore as any).mockReturnValue({ loading: true, summary: null });
        const wrapper = mount(VisitorTrendWidget, {
            global: {
                stubs: {
                    "a-card": { template: "<div><slot name='title'></slot><slot></slot><slot name='extra'></slot></div>" },
                    "a-spin": true,
                },
            },
        });
        
        expect(wrapper.find("a-spin-stub").exists()).toBe(true);
    });

    it("renders chart data correctly", async () => {
        const wrapper = mount(VisitorTrendWidget, {
            global: {
                stubs: {
                    "a-card": { template: "<div><slot name='title'></slot><slot></slot><slot name='extra'></slot></div>" },
                    "a-spin": true,
                },
            },
        });
        
        await wrapper.vm.$nextTick(); // Wait for chart rendering setup
        expect(wrapper.text()).not.toContain("No data available");
    });

    it("renders no data state", async () => {
        (useDashboardStore as any).mockReturnValue({
            loading: false,
            summary: {
                visitors: { last_7_days: [] },
            },
        });
        
        const wrapper = mount(VisitorTrendWidget, {
            global: {
                stubs: {
                    "a-card": { template: "<div><slot name='title'></slot><slot></slot><slot name='extra'></slot></div>" },
                    "a-spin": true,
                },
            },
        });
        
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("No data available");
    });
});
