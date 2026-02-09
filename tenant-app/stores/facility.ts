import { defineStore } from "pinia";
import {
    useFacilityService,
    type Facility,
    type Tower,
    type FacilityListParams,
    type CreateFacilityPayload,
    type CreateTowerPayload,
} from "../composables/facilityService";

export const useFacilityStore = defineStore("facility", {
    state: () => ({
        facilities: [] as Facility[],
        currentFacility: null as Facility | null,
        towers: [] as Tower[],
        loading: false,
        error: null as string | null,
        init: false,
        // Pagination
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),

    getters: {
        totalFacilities: (state) => state.count,
        getFacilityById: (state) => (id: string) =>
            state.facilities.find((f) => f.id === id),
        hasPrevious: (state) => state.previous !== null,
        hasNext: (state) => state.next !== null,
    },

    actions: {
        async fetchFacilities(params: FacilityListParams = {}, force = false) {
            if (this.init && !force && !params.page) return;

            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const { page = this.page, page_size = this.pageSize } = params;
                const result = await service.getFacilities({ page, page_size });

                this.facilities = result.facilities;
                this.count = result.count;
                this.next = result.next;
                this.previous = result.previous;
                this.page = page;
                this.pageSize = page_size;
                this.init = true;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch facilities";
            } finally {
                this.loading = false;
            }
        },

        async fetchFacilityById(id: string) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const facility = await service.getFacilityById(id);
                this.currentFacility = facility;

                // Also fetch towers for this facility
                const towers = await service.getTowers(id);
                this.towers = towers;
                this.currentFacility.towers = towers;

                return facility;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch facility";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async createFacility(facilityData: CreateFacilityPayload) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const newFacility = await service.createFacility(facilityData);
                // Refresh the list
                await this.fetchFacilities({}, true);
                return newFacility;
            } catch (err: any) {
                this.error = err.message || "Failed to create facility";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateFacility(
            id: string,
            updates: Partial<CreateFacilityPayload>,
        ) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const updated = await service.updateFacility(id, updates);
                // Update in list if exists
                const index = this.facilities.findIndex((f) => f.id === id);
                if (index !== -1) {
                    this.facilities[index] = updated;
                }
                if (this.currentFacility?.id === id) {
                    this.currentFacility = updated;
                }
                return updated;
            } catch (err: any) {
                this.error = err.message || "Failed to update facility";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteFacility(id: string) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                await service.deleteFacility(id);
                this.facilities = this.facilities.filter((f) => f.id !== id);
                this.count = Math.max(0, this.count - 1);
            } catch (err: any) {
                this.error = err.message || "Failed to delete facility";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async fetchTowers(facilityId?: string) {
            const service = useFacilityService();

            try {
                this.towers = await service.getTowers(facilityId);
                return this.towers;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch towers";
                throw err;
            }
        },

        async createTower(payload: CreateTowerPayload) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const newTower = await service.createTower(payload);
                this.towers.push(newTower);
                return newTower;
            } catch (err: any) {
                this.error = err.message || "Failed to create tower";
                throw err;
            } finally {
                this.loading = false;
            }
        },

        // Pagination helpers
        async nextPage() {
            if (this.hasNext) {
                await this.fetchFacilities({ page: this.page + 1 }, true);
            }
        },

        async prevPage() {
            if (this.hasPrevious && this.page > 1) {
                await this.fetchFacilities({ page: this.page - 1 }, true);
            }
        },

        async goToPage(page: number) {
            await this.fetchFacilities({ page }, true);
        },
    },
});
