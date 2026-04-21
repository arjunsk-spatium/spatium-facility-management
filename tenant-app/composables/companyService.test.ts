import { describe, it, expect } from 'vitest'
import { useCompanyService, type Company } from './companyService'

describe('Company Service', () => {
    const { getCompanies, getCompanyById, createCompany, updateCompany, getInsights } = useCompanyService()

    it('should fetch all companies', async () => {
        const companies = await getCompanies()
        expect(companies).toBeDefined()
        expect(Array.isArray(companies)).toBe(true)
        // Check mock data structure if applicable
    })

    it('should fetch a company by id', async () => {
        // Assuming we mock some initial data
        const companies = await getCompanies()
        const firstCompany = companies[0]
        
        const company = await getCompanyById(firstCompany.id)
        expect(company).toBeDefined()
        expect(company?.id).toBe(firstCompany.id)
    })

    it('should create a new company', async () => {
        const newCompanyData = {
            name: 'New Tech',
            address: '123 Tech St',
            status: 'active' as const
        }
        const created = await createCompany(newCompanyData)
        expect(created.id).toBeDefined()
        expect(created.name).toBe('New Tech')
        
        // Verify it was added to list
        const companies = await getCompanies()
        expect(companies.find(c => c.id === created.id)).toBeDefined()
    })

    it('should update an existing company', async () => {
        const companies = await getCompanies()
        const target = companies[0]
        
        const updated = await updateCompany(target.id, { name: 'Updated Name' })
        expect(updated?.name).toBe('Updated Name')
        
        const freshFetch = await getCompanyById(target.id)
        expect(freshFetch?.name).toBe('Updated Name')
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
