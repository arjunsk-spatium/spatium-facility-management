import { defineStore } from 'pinia';
import { useFacilityService, type Facility } from '../composables/facilityService';

export const useFacilityStore = defineStore('facility', {
    state: () => ({
        facilities: [] as Facility[],
        currentFacility: null as Facility | null,
        loading: false,
        error: null as string | null,
        init: false
    }),

    getters: {
        totalFacilities: (state) => state.facilities.length,
        getFacilityById: (state) => (id: string) => state.facilities.find(f => f.id === id)
    },

    actions: {
        async fetchFacilities(force = false) {
            if (this.init && !force) return;
            
            this.loading = true;
            this.error = null;
            const service = useFacilityService();
            
            try {
                this.facilities = await service.getFacilities();
                this.init = true;
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch facilities';
            } finally {
                this.loading = false;
            }
        },

        async createFacility(facilityData: Omit<Facility, 'id'>) {
            this.loading = true;
            this.error = null;
            const service = useFacilityService();

            try {
                const newFacility = await service.createFacility(facilityData);
                this.facilities.push(newFacility);
                return newFacility;
            } catch (err: any) {
                this.error = err.message || 'Failed to create facility';
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
                this.facilities = this.facilities.filter(f => f.id !== id);
            } catch (err: any) {
                this.error = err.message || 'Failed to delete facility';
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
});
