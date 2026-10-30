import { defineStore } from "pinia";
import {
    useCompanyService,
    type Company,
    type CompanyListParams,
} from "../composables/companyService";

export const useAllCompanyStore = defineStore("allCompany", {
    state: () => ({
        companies: [] as Company[],
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
        totalCompanies: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },

    actions: {
        async fetchAllCompanies(params: CompanyListParams = {}, force = false) {
            if (this.init && !force && !params.page && !params.search) return;

            this.loading = true;
            this.error = null;
            try {
                const { getAllCompanies } = useCompanyService();
                const page = params.page ?? this.page;
                const page_size = params.page_size ?? this.pageSize;
                const result = await getAllCompanies({
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
                console.error("[AllCompanyStore] Error fetching all companies:", err);
                this.error = "Failed to fetch all companies: " + err.message;
            } finally {
                this.loading = false;
            }
        },

        async goToPage(page: number, pageSize?: number) {
            await this.fetchAllCompanies({ page, ...(pageSize ? { page_size: pageSize } : {}) }, true);
        },

        async nextPage() {
            if (this.hasNext) {
                await this.fetchAllCompanies({ page: this.page + 1 }, true);
            }
        },

        async prevPage() {
            if (this.hasPrevious && this.page > 1) {
                await this.fetchAllCompanies({ page: this.page - 1 }, true);
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
            } catch (err: any) {
                this.error = "Failed to delete company";
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
