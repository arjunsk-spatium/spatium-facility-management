export interface Company {
    id: string
    name: string
    address: string
    status: 'active' | 'inactive'
    logoUrl?: string
    contactEmail?: string
    contactPhone?: string
}

export interface CompanyInsights {
    totalCompanies: number
    activeCompanies: number
    inactiveCompanies: number
    revenue: number
}

const MOCK_COMPANIES: Company[] = [
    {
        id: '1',
        name: 'Tech Corp',
        address: '123 Tech St',
        status: 'active',
        contactEmail: 'contact@tech.com'
    },
    {
        id: '2',
        name: 'Biz Solutions',
        address: '456 Biz Ave',
        status: 'inactive',
        contactEmail: 'info@biz.com'
    }
]

export const useCompanyService = () => {
    
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const getCompanies = async (): Promise<Company[]> => {
        await delay(300)
        return [...MOCK_COMPANIES]
    }

    const getCompanyById = async (id: string): Promise<Company | null> => {
        await delay(300)
        return MOCK_COMPANIES.find(c => c.id === id) || null
    }

    const createCompany = async (data: Omit<Company, 'id'>): Promise<Company> => {
        await delay(500)
        const newCompany: Company = {
            ...data,
            id: Math.random().toString(36).substr(2, 9)
        }
        MOCK_COMPANIES.push(newCompany)
        return newCompany
    }

    const updateCompany = async (id: string, data: Partial<Omit<Company, 'id'>>): Promise<Company | null> => {
        await delay(500)
        const index = MOCK_COMPANIES.findIndex(c => c.id === id)
        if (index === -1) return null
        
        MOCK_COMPANIES[index] = { ...MOCK_COMPANIES[index], ...data }
        return MOCK_COMPANIES[index]
    }

    const getInsights = async (): Promise<CompanyInsights> => {
        await delay(300)
        const total = MOCK_COMPANIES.length
        const active = MOCK_COMPANIES.filter(c => c.status === 'active').length
        return {
            totalCompanies: total,
            activeCompanies: active,
            inactiveCompanies: total - active,
            revenue: total * 1000 // Mock revenue logic
        }
    }

    return {
        getCompanies,
        getCompanyById,
        createCompany,
        updateCompany,
        getInsights
    }
}
