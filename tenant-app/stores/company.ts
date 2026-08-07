import { defineStore } from "pinia";
import {
    useCompanyService,
    type Company,
    type CompanyInsights,
    type CreateCompanyPayload,
    type CompanyFacilityMapping,
    type CreateCompanyFacilityMappingPayload,
    type CompanyListParams,
} from "../composables/companyService";

export const useCompanyStore = defineStore("company", {
    state: () => ({
        companies: [] as Company[],
        currentCompany: null as Company | null,
        currentCompanyFacilities: [] as CompanyFacilityMapping[],
        insights: null as CompanyInsights | null,
        loading: false,
        error: null as string | null,
        init: false,
        // Pagination
        count: 0,
        page: 1,
        pageSize: 1,
        next: null as string | null,
        previous: null as string | null,
    }),
    getters: {
        totalCompanies: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },
    actions: {
        async fetchCompanies(params: CompanyListParams = {}, force = false) {
            if (this.init && !force && !params.page && !params.search) return;

            this.loading = true;
            this.error = null;
            try {
                const { getCompanies } = useCompanyService();
                const page = params.page ?? this.page;
                const page_size = params.page_size ?? this.pageSize;
                const result = await getCompanies({
                    ...params,
                    page,
                    page_size,
                });
                this.companies = result.companies || [];
                this.count = result.count || 0;
                this.next = result.next || null;
                this.previous = result.previous || null;
                this.page = page;
                this.pageSize = page_size;
                this.init = true;
            } catch (err: any) {
                console.error("[CompanyStore] Error fetching companies:", err);
                this.error = "Failed to fetch user companies: " + err.message;
            } finally {
                this.loading = false;
            }
        },

        async goToPage(page: number) {
            await this.fetchCompanies({ page }, true);
        },
        async fetchCompany(id: string) {
            this.loading = true;
            this.error = null;
            try {
                const { getCompanyById } = useCompanyService();
                this.currentCompany = await getCompanyById(id);
            } catch (err) {
                this.error = "Failed to fetch company";
            } finally {
                this.loading = false;
            }
        },
        async createCompanyAction(data: CreateCompanyPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { createCompany } = useCompanyService();
                const newCompany = await createCompany(data);
                if (!newCompany.contacts) {
                    newCompany.contacts = [];
                }
                this.companies.push(newCompany);
                return newCompany;
            } catch (err) {
                this.error = "Failed to create company";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async updateCompanyAction(
            id: string,
            data: Partial<CreateCompanyPayload>,
        ) {
            this.loading = true;
            this.error = null;
            try {
                const { updateCompany } = useCompanyService();
                const updated = await updateCompany(id, data);
                if (updated) {
                    const index = this.companies.findIndex((c) => c.id === id);
                    if (index !== -1) {
                        this.companies[index] = updated;
                    }
                    if (this.currentCompany?.id === id) {
                        this.currentCompany = updated;
                    }
                }
                return updated;
            } catch (err) {
                this.error = "Failed to update company";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async deleteCompanyAction(id: string) {
            this.loading = true;
            this.error = null;
            try {
                const { deleteCompany } = useCompanyService();
                await deleteCompany(id);
                this.companies = this.companies.filter((c) => c.id !== id);
                this.count = Math.max(0, this.count - 1);
            } catch (err) {
                this.error = "Failed to delete company";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async fetchInsightsAction(startDate?: string, endDate?: string) {
            this.loading = true;
            this.error = null;
            try {
                const { getInsights } = useCompanyService();
                this.insights = await getInsights(startDate, endDate);
            } catch (err) {
                this.error = "Failed to fetch insights";
            } finally {
                this.loading = false;
            }
        },
        async fetchCompanyFacilities(companyId: string) {
            this.loading = true;
            this.error = null;
            try {
                const { getCompanyFacilities } = useCompanyService();
                this.currentCompanyFacilities = await getCompanyFacilities(companyId);
            } catch (err) {
                this.error = "Failed to fetch company facilities";
            } finally {
                this.loading = false;
            }
        },
        async fetchCompanyFacilitiesAction(companyId: string) {
            return this.fetchCompanyFacilities(companyId);
        },
        async addCompanyFacilityMapping(data: CreateCompanyFacilityMappingPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { createCompanyFacilityMapping } = useCompanyService();
                const newMapping = await createCompanyFacilityMapping(data);
                this.currentCompanyFacilities.push(newMapping);
                return newMapping;
            } catch (err) {
                this.error = "Failed to add facility mapping";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async addCompanyFacilityMappingAction(data: CreateCompanyFacilityMappingPayload) {
            return this.addCompanyFacilityMapping(data);
        },
        async removeCompanyFacilityMapping(mappingId: string) {
            this.loading = true;
            this.error = null;
            try {
                const { deleteCompanyFacilityMapping } = useCompanyService();
                await deleteCompanyFacilityMapping(mappingId);
                this.currentCompanyFacilities = this.currentCompanyFacilities.filter(
                    (m) => m.id !== mappingId
                );
            } catch (err) {
                this.error = "Failed to remove facility mapping";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async removeCompanyFacilityMappingAction(mappingId: string) {
            return this.removeCompanyFacilityMapping(mappingId);
        },
        async generateCompanyQRCode(
            companyId: string,
            companyName: string,
            facilityId: string,
        ) {
            this.loading = true;
            this.error = null;
            try {
                const { generateCompanyQRCode } = useCompanyService();
                await generateCompanyQRCode(companyId, companyName, facilityId);
            } catch (err) {
                this.error = "Failed to generate QR Code";
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});

export const useUserCompanyStore = useCompanyStore;
