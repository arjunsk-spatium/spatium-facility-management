import { defineStore } from "pinia";
import {
    useFacilityService,
    type Facility,
    type FacilityListParams,
} from "../composables/facilityService";

export const useAllFacilityStore = defineStore("allFacility", {
    state: () => ({
        facilities: [] as Facility[],
        loading: false,
        error: null as string | null,
        init: false,
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
        async fetchAllFacilities(params: FacilityListParams = {}, force = false) {
            if (this.init && !force && !params.page) return;

            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const { page = this.page, page_size = this.pageSize } = params;
                const result = await service.getAllFacilities({ page, page_size });

                this.facilities = result.facilities || [];
                this.count = result.count || 0;
                this.next = result.next || null;
                this.previous = result.previous || null;
                this.page = page;
                this.pageSize = page_size;
                this.init = true;
            } catch (err: any) {
                this.error = err.message || "Failed to fetch all facilities";
            } finally {
                this.loading = false;
            }
        },

        async goToPage(page: number, pageSize?: number) {
            await this.fetchAllFacilities({ page, ...(pageSize ? { page_size: pageSize } : {}) }, true);
        },

        async nextPage() {
            if (this.hasNext) {
                await this.fetchAllFacilities({ page: this.page + 1 }, true);
            }
        },

        async prevPage() {
            if (this.hasPrevious && this.page > 1) {
                await this.fetchAllFacilities({ page: this.page - 1 }, true);
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
    },
});
