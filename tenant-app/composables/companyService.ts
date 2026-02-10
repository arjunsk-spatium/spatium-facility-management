export interface CompanyContact {
    id?: string;
    contact_name: string;
    email: string;
    address: string;
    gstin?: string;
    phone: string;
}

export interface Company {
    id: string;
    name: string;
    status: "active" | "inactive";
    logo?: string;
    contacts: CompanyContact[];
}

export interface CompanyInsights {
    totalCompanies: number;
    activeCompanies: number;
    inactiveCompanies: number;
    revenue: number;
}

const MOCK_COMPANIES: Company[] = [
    {
        id: "1",
        name: "Tech Corp",
        status: "active",
        contacts: {
            contact_name: "John Smith",
            email: "john.smith@techcorp.com",
            address: "123 Tech Street, Bangalore",
            phone: "+91 98765 43210",
            gstin: "29ABCDE1234F1ZH",
        },
    },
    {
        id: "2",
        name: "Biz Solutions",
        status: "active",
        contacts: {
            contact_name: "Jane Doe",
            email: "jane.doe@bizsolutions.com",
            address: "456 Business Park, Mumbai",
            phone: "+91 87654 32109",
            gstin: "27FGHIJ5678K2ZP",
        },
    },
    {
        id: "3",
        name: "Global Enterprises",
        status: "active",
        contacts: {
            contact_name: "Raj Kumar",
            email: "raj.kumar@globalent.com",
            address: "789 Corporate Tower, Delhi",
            phone: "+91 76543 21098",
            gstin: "07KLMNO9012L3ZQ",
        },
    },
];

export interface CreateCompanyPayload {
    name: string;
    status: "active" | "inactive";
    logo?: File;
    contacts: {
        contact_name: string;
        email: string;
        address: string;
        gstin?: string;
        phone: string;
    }[];
}

export const useCompanyService = () => {
    const { $api } = useNuxtApp();
    const config = useRuntimeConfig();
    const baseUrl = config.public.apiBaseUrl;

    const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

    const buildUrl = (endpoint: string): string => {
        const url = endpoint.startsWith("http")
            ? endpoint
            : `${baseUrl}${endpoint}`;
        return url;
    };

    const getCompanies = async (): Promise<Company[]> => {
        const url = buildUrl("/api/portal/companies/");
        console.log("[CompanyService] Fetching companies from:", url);
        const response = await $api<{ success: boolean; data: { results: Company[] } }>(url, { method: "GET" });
        console.log("[CompanyService] Companies fetched:", response.data?.results?.length || 0);
        return response.data?.results || [];
    };

    const getCompanyById = async (id: string): Promise<Company | null> => {
        const url = buildUrl(`/api/portal/companies/${id}/`);
        try {
            const response = await $api<{ success: boolean; data: Company }>(url, { method: "GET" });
            return response.data;
        } catch (error: any) {
            if (error.statusCode === 404) return null;
            throw error;
        }
    };

    const createCompany = async (
        data: CreateCompanyPayload,
    ): Promise<Company> => {
        const url = buildUrl("/api/portal/companies/");

        const body: any = {
            name: data.name,
            status: data.status,
            contacts: data.contacts
        };

        if (data.logo) {
            body.logo = data.logo;
        }

        const response = await $api<Company>(url, {
            method: "POST",
            body
        });
        return response;
    };

    const updateCompany = async (
        id: string,
        data: Partial<CreateCompanyPayload>,
    ): Promise<Company | null> => {
        await delay(500);
        const url = buildUrl(`/api/portal/companies/${id}/`);
        const index = MOCK_COMPANIES.findIndex((c) => c.id === id);
        const existingCompany = MOCK_COMPANIES[index];
        if (index === -1 || !existingCompany) return null;

        const updatedCompany: Company = {
            id: existingCompany.id,
            name: data.name ?? existingCompany.name,
            status: data.status ?? existingCompany.status,
            logo: data.logo
                ? URL.createObjectURL(data.logo)
                : existingCompany.logo,
            contacts: {
                contact_name:
                    data.contacts?.contact_name ??
                    existingCompany.contacts.contact_name,
                email: data.contacts?.email ?? existingCompany.contacts.email,
                address:
                    data.contacts?.address ?? existingCompany.contacts.address,
                phone: data.contacts?.phone ?? existingCompany.contacts.phone,
                gstin: data.contacts?.gstin ?? existingCompany.contacts.gstin,
            },
        };
        MOCK_COMPANIES[index] = updatedCompany;
        return updatedCompany;
    };

    const getInsights = async (): Promise<CompanyInsights> => {
        try {
            const url = buildUrl("/api/portal/companies/insights/");
            const response = await $api<CompanyInsights>(url, {
                method: "GET",
            });
            return response;
        } catch (error) {
            console.warn("Using mock insights data");
            const total = MOCK_COMPANIES.length;
            return {
                totalCompanies: total,
                activeCompanies: total,
                inactiveCompanies: 0,
                revenue: total * 1000,
            };
        }
    };

    return {
        getCompanies,
        getCompanyById,
        createCompany,
        updateCompany,
        getInsights,
    };
};
