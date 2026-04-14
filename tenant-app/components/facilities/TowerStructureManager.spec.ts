import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import TowerStructureManager from "./TowerStructureManager.vue";
import { message } from "ant-design-vue";

// Mock facility service
const mockService = {
    getFloors: vi.fn(),
    getWings: vi.fn(),
    createFloor: vi.fn(),
    updateFloor: vi.fn(),
    createWing: vi.fn(),
    updateWing: vi.fn(),
};

vi.mock("../../composables/facilityService", () => ({
    useFacilityService: () => mockService,
}));

// Mock Ant Design Vue message
vi.mock("ant-design-vue", () => ({
    message: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("TowerStructureManager", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset default implementations if needed
        mockService.getFloors.mockResolvedValue([]);
    });

    it("renders empty state when no floors", async () => {
        const wrapper = mount(TowerStructureManager, {
            props: { towerId: "tower1" },
            global: {
                stubs: {
                    "a-button": { template: "<button><slot /></button>" },
                    "a-spin": true,
                    "a-collapse": true,
                    "a-collapse-panel": true,
                    "a-modal": true,
                    "a-form": true,
                    "a-form-item": true,
                    "a-input": true,
                    PlusOutlined: true,
                    EditOutlined: true,
                },
            },
        });

        // Wait for async fetch in watch immediate
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockService.getFloors).toHaveBeenCalledWith("tower1");
        expect(wrapper.text()).toContain("No floors found");
        expect(wrapper.text()).toContain("Add First Floor");
    });

    it("renders floors and wings", async () => {
        const floors = [
            { id: "f1", name: "Floor 1", wings: [] },
            {
                id: "f2",
                name: "Floor 2",
                wings: [{ id: "w1", name: "Wing A" }],
            },
        ];

        mockService.getFloors.mockResolvedValue(floors);
        // getWings is called if wings are missing in floor object, but here f1 has wings array (empty).
        // Let's mimic real scenario: if f.wings is present, getWings not called.
        // If f.wings missing, getWings called.
        // In my code: `if (!f.wings) { ... getWings ... }`

        // Let's create a floor without wings property to test fetch
        const rawFloors = [{ id: "f3", name: "Floor 3" }];
        mockService.getFloors.mockResolvedValueOnce(rawFloors);
        mockService.getWings.mockResolvedValueOnce([
            { id: "w2", name: "Wing B" },
        ]);

        const wrapper = mount(TowerStructureManager, {
            props: { towerId: "tower1" },
            global: {
                stubs: {
                    "a-button": { template: "<button><slot /></button>" },
                    "a-spin": true,
                    "a-collapse": { template: "<div><slot /></div>" },
                    "a-collapse-panel": {
                        template:
                            '<div><slot name="header"></slot><slot name="extra"></slot><slot></slot></div>',
                        props: ["header", "extra"],
                    },
                    "a-modal": true,
                    "a-form": true,
                    "a-form-item": true,
                    "a-input": true,
                    PlusOutlined: true,
                    EditOutlined: true,
                },
            },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockService.getWings).toHaveBeenCalledWith("f3");
        expect(wrapper.text()).toContain("Floor 3");
        expect(wrapper.text()).toContain("Wing B");
    });

    it("adds a floor", async () => {
        mockService.getFloors.mockResolvedValue([]);
        mockService.createFloor.mockResolvedValue({
            id: "f_new",
            name: "New Floor",
            wings: [],
        });

        const wrapper = mount(TowerStructureManager, {
            props: { towerId: "tower1" },
            global: {
                stubs: {
                    "a-button": { template: "<button><slot /></button>" },
                    "a-input": {
                        template:
                            "<input @input=\"$emit('update:value', $event.target.value)\" />",
                        props: ["value"],
                    },
                    // ... other stubs
                    "a-spin": true,
                    "a-collapse": true,
                    "a-collapse-panel": true,
                    "a-modal": {
                        template: "<div><slot /></div>",
                        emits: ["ok"],
                    },
                    "a-form": true,
                    "a-form-item": true,
                    PlusOutlined: true,
                    EditOutlined: true,
                },
            },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        // Simulate open modal
        wrapper.vm.isAddFloorModalOpen = true;
        await wrapper.vm.$nextTick();

        // Simulate input
        wrapper.vm.floorForm.name = "New Floor";

        // Simulate submit
        await wrapper.vm.handleAddFloor();

        expect(mockService.createFloor).toHaveBeenCalledWith({
            tower: "tower1",
            name: "New Floor",
        });
        expect(message.success).toHaveBeenCalledWith("Floor added");
        // Check refresh called
        expect(mockService.getFloors).toHaveBeenCalledTimes(2); // Initial + Refresh
    });

    it("updates a wing", async () => {
        const floor = {
            id: "f1",
            name: "Floor 1",
            wings: [{ id: "w1", name: "Wing A" }],
        };
        mockService.getFloors.mockResolvedValue([floor]);

        const wrapper = mount(TowerStructureManager, {
            props: { towerId: "tower1" },
            global: {
                stubs: {
                    "a-button": { template: "<button><slot /></button>" },
                    "a-spin": true,
                    "a-collapse": { template: "<div><slot /></div>" },
                    "a-collapse-panel": {
                        template:
                            '<div><slot name="header"></slot><slot name="extra"></slot><slot></slot></div>',
                        props: ["header", "extra"],
                    },
                    "a-modal": true,
                    "a-form": true,
                    "a-form-item": true,
                    "a-input": true,
                    PlusOutlined: true,
                    EditOutlined: true,
                },
            },
        });

        await new Promise((resolve) => setTimeout(resolve, 0));

        // Simulate open edit mock
        const wing = { id: "w1", name: "Wing A" };
        // We need to access component instance method or modify state directly
        // openEditWing is not exposed on `vm` unless defined in script setup?
        // Script setup exposes all top-level bindings to template, but wrapper.vm usually has access.
        // However, typescript might complain. `(wrapper.vm as any)` works.

        await (wrapper.vm as any).openEditWing(wing);

        expect((wrapper.vm as any).isEditWingModalOpen).toBe(true);
        expect((wrapper.vm as any).editWingForm).toEqual({
            id: "w1",
            name: "Wing A",
        });

        // Update value
        (wrapper.vm as any).editWingForm.name = "Wing A Updated";

        // Submit
        await (wrapper.vm as any).handleUpdateWing();

        expect(mockService.updateWing).toHaveBeenCalledWith("w1", {
            floor: "f1",
            name: "Wing A Updated",
        });
    });
});
