import { describe, it, expect, vi } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import FacilitiesPage from "../../app/pages/facilities/index.vue";
import { createTestingPinia } from "@pinia/testing";

describe("Facilities List Page", () => {
    // Mock with API response structure
    const mockFacilities = [
        {
            id: "da845d5e-5373-464b-b93c-d3108aa44cd4",
            name: "HQ Building",
            address: "123 Main St",
            tenant: "bf524f63-22dd-4b35-827b-fe56b7629e99",
            country: "29d69a36-88c8-4253-b81a-216770d7877f",
            state: "b460ccaf-5c5e-4c68-91e4-eddf9de42aba",
            city: "14cae8f1-7ca6-4952-ad68-3e01f7e342d1",
            zone: "23ae50b8-e165-4238-a9eb-49629059324a",
            country_details: { id: "1", name: "USA" },
            state_details: { id: "1", name: "NY" },
            city_details: { id: "1", name: "New York" },
            zone_details: { id: "1", name: "Zone A" },
            tower_count: 2,
            has_towers: true,
            is_archive: false,
            location: {
                city: "New York",
                state: "NY",
                country: "USA",
                address: "123 Main St",
            },
            towers: [],
            staff: [],
        },
        {
            id: "3ab28644-95e3-4ff9-bff6-67b3da84e00e",
            name: "Tech Park",
            address: "456 Tech Ave",
            tenant: "bf524f63-22dd-4b35-827b-fe56b7629e99",
            country: "29d69a36-88c8-4253-b81a-216770d7877f",
            state: "c560ccaf-5c5e-4c68-91e4-eddf9de42aba",
            city: "24cae8f1-7ca6-4952-ad68-3e01f7e342d1",
            zone: "33ae50b8-e165-4238-a9eb-49629059324a",
            country_details: { id: "1", name: "USA" },
            state_details: { id: "2", name: "CA" },
            city_details: { id: "2", name: "San Francisco" },
            zone_details: { id: "2", name: "Zone B" },
            tower_count: 1,
            has_towers: false,
            is_archive: false,
            location: {
                city: "San Francisco",
                state: "CA",
                country: "USA",
                address: "456 Tech Ave",
            },
            towers: [],
            staff: [],
        },
    ];

    it("should render facilities page with header", async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            facility: {
                                facilities: mockFacilities,
                                loading: false,
                                count: 2,
                                page: 1,
                                pageSize: 10,
                            },
                        },
                    }),
                ],
            },
        });

        expect(wrapper.text()).toContain("Facilities");
    }, 15000);

    it("should display facilities list", async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            facility: {
                                facilities: mockFacilities,
                                loading: false,
                                count: 2,
                                page: 1,
                                pageSize: 10,
                            },
                        },
                    }),
                ],
            },
        });

        expect(wrapper.text()).toContain("HQ Building");
        expect(wrapper.text()).toContain("Tech Park");
    }, 15000);

    it('should have "Add Facility" button', async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            facility: {
                                facilities: [],
                                loading: false,
                                count: 0,
                                page: 1,
                                pageSize: 10,
                            },
                        },
                    }),
                ],
            },
        });

        expect(wrapper.html()).toContain("Add");
    }, 15000);

    it("should display location from city_details", async () => {
        const wrapper = await mountSuspended(FacilitiesPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            facility: {
                                facilities: mockFacilities,
                                loading: false,
                                count: 2,
                                page: 1,
                                pageSize: 10,
                            },
                        },
                    }),
                ],
            },
        });

        expect(wrapper.text()).toContain("New York");
        expect(wrapper.text()).toContain("USA");
    }, 15000);
});
