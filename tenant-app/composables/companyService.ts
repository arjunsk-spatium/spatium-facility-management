export interface Company {
    id: string
    name: string
    address: string
    spoc_name: string
    spoc_email: string
    spoc_phone: string
    gstin?: string
    facility?: string
    logo?: string
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
        address: '123 Tech Street, Bangalore',
        spoc_name: 'John Smith',
        spoc_email: 'john.smith@techcorp.com',
        spoc_phone: '+91 98765 43210',
        gstin: '29ABCDE1234F1ZH',
        facility: 'Facility 1'
    },
    {
        id: '2',
        name: 'Biz Solutions',
        address: '456 Business Park, Mumbai',
        spoc_name: 'Jane Doe',
        spoc_email: 'jane.doe@bizsolutions.com',
        spoc_phone: '+91 87654 32109',
        gstin: '27FGHIJ5678K2ZP',
        facility: 'Facility 2'
    },
    {
        id: '3',
        name: 'Global Enterprises',
        address: '789 Corporate Tower, Delhi',
        spoc_name: 'Raj Kumar',
        spoc_email: 'raj.kumar@globalent.com',
        spoc_phone: '+91 76543 21098',
        gstin: '07KLMNO9012L3ZQ',
        facility: 'Facility 1'
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
        const existingCompany = MOCK_COMPANIES[index]
        if (index === -1 || !existingCompany) return null
        
        const updatedCompany: Company = {
            id: existingCompany.id,
            name: data.name ?? existingCompany.name,
            address: data.address ?? existingCompany.address,
            spoc_name: data.spoc_name ?? existingCompany.spoc_name,
            spoc_email: data.spoc_email ?? existingCompany.spoc_email,
            spoc_phone: data.spoc_phone ?? existingCompany.spoc_phone,
            gstin: data.gstin ?? existingCompany.gstin,
            facility: data.facility ?? existingCompany.facility,
            logo: data.logo ?? existingCompany.logo
        }
        MOCK_COMPANIES[index] = updatedCompany
        return updatedCompany
    }

    const getInsights = async (): Promise<CompanyInsights> => {
        await delay(300)
        const total = MOCK_COMPANIES.length
        // Mock insights without status field
        return {
            totalCompanies: total,
            activeCompanies: total, // All companies are active by default
            inactiveCompanies: 0,
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
