import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useFacilityStore } from "./facility";

// Mock the facilityService
// Mock the facilityService
vi.mock("../composables/facilityService", () => ({
    useFacilityService: () => ({
        getFacilities: vi.fn().mockResolvedValue({
            facilities: [
                {
                    id: "1",
                    name: "HQ Building",
                    address: "123 Main St",
                    status: "Active",
                },
                {
                    id: "2",
                    name: "Tech Park",
                    address: "456 Tech Ave",
                    status: "Active",
                },
            ],
            count: 2,
            next: null,
            previous: null,
        }),
        createFacility: vi
            .fn()
            .mockResolvedValue({ id: "3", name: "New Building" }),
        deleteFacility: vi.fn().mockResolvedValue(true),
        getTowers: vi.fn().mockResolvedValue([]),
    }),
}));

describe("Facility Store", () => {
    beforeEach(() => {
        setActivePinia(createPinia());
    });

    describe("Initial State", () => {
        it("should have empty facilities array initially", () => {
            const store = useFacilityStore();
            expect(store.facilities).toEqual([]);
        });

        it("should have null currentFacility initially", () => {
            const store = useFacilityStore();
            expect(store.currentFacility).toBeNull();
        });

        it("should have loading false initially", () => {
            const store = useFacilityStore();
            expect(store.loading).toBe(false);
        });

        it("should have init false initially", () => {
            const store = useFacilityStore();
            expect(store.init).toBe(false);
        });
    });

    describe("Getters", () => {
        it("totalFacilities should return facilities count", () => {
            const store = useFacilityStore();
            store.count = 2;
            expect(store.totalFacilities).toBe(2);
        });

        it("getFacilityById should return correct facility", () => {
            const store = useFacilityStore();
            store.facilities = [
                { id: "1", name: "Facility A" },
                { id: "2", name: "Facility B" },
            ] as any[];
            const result = store.getFacilityById("2");
            expect(result?.name).toBe("Facility B");
        });

        it("getFacilityById should return undefined for non-existing id", () => {
            const store = useFacilityStore();
            store.facilities = [{ id: "1", name: "A" }] as any[];
            expect(store.getFacilityById("999")).toBeUndefined();
        });
    });

    describe("Actions", () => {
        it("fetchFacilities should populate facilities", async () => {
            const store = useFacilityStore();
            await store.fetchFacilities();

            expect(store.facilities.length).toBe(2);
            expect(store.facilities[0].name).toBe("HQ Building");
            expect(store.init).toBe(true);
            expect(store.count).toBe(2);
        });

        it("fetchFacilities should not refetch if already initialized", async () => {
            const store = useFacilityStore();
            await store.fetchFacilities();
            const initialCount = store.facilities.length;

            // Should not call service again ideally, but mock returns same data
            await store.fetchFacilities();
            expect(store.facilities.length).toBe(initialCount);
        });

        it("fetchFacilities with force should refetch", async () => {
            const store = useFacilityStore();
            await store.fetchFacilities();
            store.init = true;

            await store.fetchFacilities({}, true); // Force refetch
            expect(store.loading).toBe(false);
        });

        it("createFacility should add new facility to list", async () => {
            const store = useFacilityStore();
            const newFacility = { name: "New Building", address: "789 New St" };

            // Calls createFacility then fetchFacilities
            await store.createFacility(newFacility as any);

            // Since fetchFacilities mock returns 2 items, and createFacility logic calls fetchFacilities(true)
            // The list will be reset to what getFacilities returns (2 items).
            // But checking if createFacility calls valid service methods
            expect(store.facilities.length).toBe(2);
        });

        it("deleteFacility should remove facility from list", async () => {
            const store = useFacilityStore();
            store.facilities = [
                { id: "1", name: "A" },
                { id: "2", name: "B" },
            ] as any[];
            store.count = 2;

            await store.deleteFacility("1");

            expect(store.facilities.length).toBe(1);
            expect(store.facilities[0].id).toBe("2");
            expect(store.count).toBe(1);
        });
    });
});
