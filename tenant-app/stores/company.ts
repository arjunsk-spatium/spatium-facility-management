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
        // Pagination
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),
    getters: {
        totalCompanies: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },
    actions: {
        async fetchCompanies(params: CompanyListParams = {}) {
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
                this.companies = result.companies;
                this.count = result.count;
                this.next = result.next;
                this.previous = result.previous;
                this.page = page;
                this.pageSize = page_size;
            } catch (err: any) {
                console.error("[CompanyStore] Error fetching companies:", err);
                this.error = "Failed to fetch companies: " + err.message;
            } finally {
                this.loading = false;
            }
        },

        async goToPage(page: number) {
            await this.fetchCompanies({ page });
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
                if (this.currentCompany?.id === id) {
                    this.currentCompany = null;
                }
            } catch (err) {
                this.error = "Failed to delete company";
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async fetchInsightsAction(startDate?: string, endDate?: string) {
            this.loading = true;
            try {
                const { getInsights } = useCompanyService();
                this.insights = await getInsights(startDate, endDate);
            } catch (err) {
                this.error = "Failed to fetch insights";
            } finally {
                this.loading = false;
            }
        },
        async fetchCompanyFacilitiesAction(companyId: string) {
            this.loading = true;
            this.error = null;
            try {
                const { getCompanyFacilities } = useCompanyService();
                this.currentCompanyFacilities =
                    await getCompanyFacilities(companyId);
            } catch (err: any) {
                console.error(
                    "[CompanyStore] Error fetching company facilities:",
                    err,
                );
                this.error =
                    "Failed to fetch company facilities: " + err.message;
            } finally {
                this.loading = false;
            }
        },
        async createCompanyFacilityMappingAction(
            data: CreateCompanyFacilityMappingPayload,
        ) {
            this.loading = true;
            this.error = null;
            try {
                const { createCompanyFacilityMapping } = useCompanyService();
                const newMapping = await createCompanyFacilityMapping(data);
                this.currentCompanyFacilities.push(newMapping);
                return newMapping;
            } catch (err: any) {
                console.error(
                    "[CompanyStore] Error creating facility mapping:",
                    err,
                );
                this.error =
                    "Failed to create facility mapping: " + err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async deleteCompanyFacilityMappingAction(mappingId: string) {
            this.loading = true;
            this.error = null;
            try {
                const { deleteCompanyFacilityMapping } = useCompanyService();
                await deleteCompanyFacilityMapping(mappingId);
                this.currentCompanyFacilities =
                    this.currentCompanyFacilities.filter(
                        (f) => f.id !== mappingId,
                    );
            } catch (err: any) {
                console.error(
                    "[CompanyStore] Error deleting facility mapping:",
                    err,
                );
                this.error =
                    "Failed to delete facility mapping: " + err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },
        async generateCompanyQRCodeAction(
            companyId: string,
            companyName: string,
            facilityId: string,
        ) {
            this.loading = true;
            this.error = null;
            try {
                const { generateCompanyQRCode } = useCompanyService();
                await generateCompanyQRCode(companyId, companyName, facilityId);
            } catch (err: any) {
                console.error(
                    "[CompanyStore] Error generating company QR code:",
                    err,
                );
                this.error =
                    "Failed to generate company QR code: " + err.message;
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
