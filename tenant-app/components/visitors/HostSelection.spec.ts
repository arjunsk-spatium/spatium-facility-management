import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HostSelection from "./HostSelection.vue";

const searchHostsMock = vi.fn();

vi.mock("../../composables/visitorService", () => ({
    useVisitorService: () => ({
        searchHosts: searchHostsMock,
    }),
}));

describe("HostSelection.vue", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        searchHostsMock.mockResolvedValue([
            { id: "1", name: "Alice", role: "Manager", avatar: "" },
            { id: "2", name: "Bob", role: "Developer", avatar: "" },
        ]);
    });

    it("renders and loads hosts", async () => {
        const wrapper = mount(HostSelection, {
            global: {
                stubs: ["a-button", "a-input", "BankOutlined", "SearchOutlined", "CheckOutlined", "UserOutlined"],
            },
        });
        
        await wrapper.vm.$nextTick(); // wait for onMounted
        await new Promise((r) => setTimeout(r, 0)); // flush promises

        expect(searchHostsMock).toHaveBeenCalled();
        expect(wrapper.text()).toContain("Innovation Corp HQ");
        expect(wrapper.text()).toContain("Suggested Hosts");
    });

    it("filters hosts based on search query", async () => {
        const wrapper = mount(HostSelection, {
            global: {
                stubs: ["a-button", "a-input", "BankOutlined", "SearchOutlined", "CheckOutlined", "UserOutlined"],
            },
        });
        
        await new Promise((r) => setTimeout(r, 0)); // flush promises

        // Simulate search input
        await wrapper.findComponent({ name: "AInput" }).vm.$emit("update:value", "Alice");
        await wrapper.vm.$nextTick();
        
        // Assert filtered hosts
        const vm = wrapper.vm as any;
        expect(vm.filteredHosts.length).toBe(1);
        expect(vm.filteredHosts[0].name).toBe("Alice");
    });

    it("emits events properly", async () => {
        const wrapper = mount(HostSelection, {
            global: {
                stubs: ["a-button", "a-input", "BankOutlined", "SearchOutlined", "CheckOutlined", "UserOutlined"],
            },
        });
        
        await new Promise((r) => setTimeout(r, 0)); // flush promises
        
        const hostEl = wrapper.findAll(".group").at(0);
        await hostEl?.trigger("click");

        expect(wrapper.emitted()["update:modelValue"][0]).toEqual([
            { id: "1", name: "Alice", role: "Manager", avatar: "" },
        ]);
        
        await wrapper.find(".border-dashed").trigger("click");
        expect(wrapper.emitted()["manual-entry"]).toBeTruthy();
    });
});
