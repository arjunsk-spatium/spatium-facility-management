import { describe, it, expect, vi } from 'vitest'
import { useCompanyService, type Company } from './companyService'

const mockCompanies: Company[] = [
    {
        id: '1',
        name: 'Tech Corp',
        status: 'active',
        contacts: [{
            contact_name: 'John Smith',
            email: 'john@techcorp.com',
            address: '123 Tech St',
            phone: '+91 98765 43210'
        }]
    }
]

const mockApiResponse = (data: any) => ({
    success: true,
    data,
})

vi.mock('nuxt/app', () => ({
    useNuxtApp: () => ({
        $api: vi.fn(async (url: string, options: any) => {
            if (url.includes('/api/portal/companies/') && options?.method === 'GET' && !url.match(/\d/)) {
                return mockApiResponse({ count: 1, next: null, previous: null, results: mockCompanies })
            }
            if (url.includes('/api/portal/companies/') && options?.method === 'GET') {
                return mockApiResponse(mockCompanies[0])
            }
            if (url.includes('/api/portal/companies/') && options?.method === 'POST') {
                const newCompany = { ...options.body, id: 'new-id' }
                return newCompany
            }
            if (url.includes('/api/portal/companies/') && options?.method === 'PATCH') {
                return mockApiResponse({ ...mockCompanies[0], ...options.body })
            }
            if (url.includes('/api/portal/dashboard/company-insights/')) {
                return mockApiResponse({
                    summary: { total_companies: 1, active_companies: 1, inactive_companies: 0, total_revenue: 1000, new_last_30_days: 0 },
                    status_distribution: [{ status: 'active', count: 1 }],
                    revenue_trend: [{ month: 'Jan 2026', month_key: '2026-01-01', revenue: 1000, growth_percentage: 0 }],
                    top_companies_by_tickets: []
                })
            }
            throw new Error('Unexpected API call: ' + url)
        })
    }),
    useRuntimeConfig: () => ({
        public: { apiBaseUrl: '' }
    })
}))

describe('Company Service', () => {
    const { getCompanies, getCompanyById, createCompany, updateCompany, getInsights } = useCompanyService()

    it('should fetch all companies', async () => {
        const result = await getCompanies()
        expect(result).toBeDefined()
        expect(Array.isArray(result.companies)).toBe(true)
        expect(result.count).toBeDefined()
        expect(result.companies.length).toBeGreaterThan(0)
    })

    it('should fetch a company by id', async () => {
        const { companies } = await getCompanies()
        const firstCompany = companies[0]
        
        const company = await getCompanyById(firstCompany.id)
        expect(company).toBeDefined()
        expect(company?.id).toBe(firstCompany.id)
    })

    it('should create a new company', async () => {
        const newCompanyData = {
            name: 'New Tech',
            status: 'active' as const,
            contacts: [{
                contact_name: 'Jane',
                email: 'jane@newtech.com',
                address: '123 Tech St',
                phone: '+91 98765 43210'
            }]
        }
        const created = await createCompany(newCompanyData)
        expect(created.id).toBeDefined()
        expect(created.name).toBe('New Tech')
    })

    it('should update an existing company', async () => {
        const { companies } = await getCompanies()
        const target = companies[0]
        
        const updated = await updateCompany(target.id, { name: 'Updated Name' })
        expect(updated?.name).toBe('Updated Name')
    })

    it('should fetch insights data', async () => {
        const insights = await getInsights()
        expect(insights).toBeDefined()
        expect(insights.summary).toBeDefined()
        expect(insights.summary.total_companies).toBeGreaterThanOrEqual(0)
        expect(insights.summary.active_companies).toBeGreaterThanOrEqual(0)
        expect(Array.isArray(insights.status_distribution)).toBe(true)
        expect(Array.isArray(insights.revenue_trend)).toBe(true)
    })
})
