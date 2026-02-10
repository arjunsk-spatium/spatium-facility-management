import { defineStore } from 'pinia'
import { useCompanyService, type Company, type CompanyInsights, type CreateCompanyPayload } from '../composables/companyService'

export const useCompanyStore = defineStore('company', {
    state: () => ({
        companies: [] as Company[],
        currentCompany: null as Company | null,
        insights: null as CompanyInsights | null,
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchCompanies() {
            this.loading = true;
            this.error = null;
            try {
                const { getCompanies } = useCompanyService();
                this.companies = await getCompanies();
            } catch (err: any) {
                console.error("[CompanyStore] Error fetching companies:", err);
                this.error = "Failed to fetch companies: " + err.message;
            } finally {
                this.loading = false;
            }
        },
        async fetchCompany(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getCompanyById } = useCompanyService()
                this.currentCompany = await getCompanyById(id)
            } catch (err) {
                this.error = 'Failed to fetch company'
            } finally {
                this.loading = false
            }
        },
        async createCompanyAction(data: CreateCompanyPayload) {
            this.loading = true
            this.error = null
            try {
                const { createCompany } = useCompanyService()
                const newCompany = await createCompany(data)
                this.companies.push(newCompany)
                return newCompany
            } catch (err) {
                this.error = 'Failed to create company'
                throw err
            } finally {
                this.loading = false
            }
        },
        async updateCompanyAction(id: string, data: Partial<CreateCompanyPayload>) {
            this.loading = true
            this.error = null
            try {
                const { updateCompany } = useCompanyService()
                const updated = await updateCompany(id, data)
                if (updated) {
                    const index = this.companies.findIndex(c => c.id === id)
                    if (index !== -1) {
                        this.companies[index] = updated
                    }
                    if (this.currentCompany?.id === id) {
                        this.currentCompany = updated
                    }
                }
                return updated
            } catch (err) {
                this.error = 'Failed to update company'
            } finally {
                this.loading = false
            }
        },
        async fetchInsightsAction() {
            this.loading = true
            try {
                const { getInsights } = useCompanyService()
                this.insights = await getInsights()
            } catch (err) {
                this.error = 'Failed to fetch insights'
            } finally {
                this.loading = false
            }
        }
    }
})
