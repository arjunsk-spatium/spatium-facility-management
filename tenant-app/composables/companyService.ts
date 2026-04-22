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
    email_domain?: string;
    logo?: string;
    contacts: CompanyContact[];
}

export interface CompanyInsights {
    summary: {
        total_companies: number;
        active_companies: number;
        inactive_companies: number;
        total_revenue: number;
        new_last_30_days: number;
    };
    status_distribution: Array<{
        status: string;
        count: number;
    }>;
    revenue_trend: Array<{
        month: string;
        month_key: string;
        revenue: number;
        growth_percentage: number | null;
    }>;
    top_companies_by_tickets: Array<{
        company_name: string;
        ticket_count: number;
    }>;
}

export interface CompanyFacilityMapping {
    id?: string;
    company: string;
    facility_id: string;
    tower_id?: string;
    floor_id?: string;
    facility_name?: string;
    tower_name?: string;
    floor_name?: string;
}

export interface CreateCompanyFacilityMappingPayload {
    company: string;
    facility_id: string;
    tower_id?: string;
    floor_id?: string;
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

export interface CompanyListParams {
    page?: number;
    page_size?: number;
    search?: string;
}

export interface CreateCompanyPayload {
    name: string;
    status: "active" | "inactive";
    email_domain?: string;
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

    const getCompanies = async (params: CompanyListParams = {}): Promise<{
        companies: Company[];
        count: number;
        next: string | null;
        previous: string | null;
    }> => {
        const url = buildUrl("/api/portal/companies/");
        console.log("[CompanyService] Fetching companies from:", url);
        const query: any = {};
        if (params.page) query.page = params.page;
        if (params.page_size) query.page_size = params.page_size;
        if (params.search) query.search = params.search;

        const response = await $api<{
            success: boolean;
            data: { count: number; next: string | null; previous: string | null; results: Company[] };
        }>(url, { method: "GET", query });
        console.log(
            "[CompanyService] Companies fetched:",
            response.data?.results?.length || 0,
        );
        return {
            companies: response.data?.results || [],
            count: response.data?.count || 0,
            next: response.data?.next || null,
            previous: response.data?.previous || null,
        };
    };

    const getCompanyById = async (id: string): Promise<Company | null> => {
        const url = buildUrl(`/api/portal/companies/${id}/`);
        try {
            const response = await $api<{ success: boolean; data: Company }>(
                url,
                { method: "GET" },
            );
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

        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("status", data.status);
        formData.append("contacts", JSON.stringify(data.contacts));
        if (data.email_domain) formData.append("email_domain", data.email_domain);

        if (data.logo) {
            formData.append("logo", data.logo);
        }

        const response = await $api<Company>(url, {
            method: "POST",
            body: formData,
        });
        return response;
    };

    const updateCompany = async (
        id: string,
        data: Partial<CreateCompanyPayload>,
    ): Promise<Company | null> => {
        const url = buildUrl(`/api/portal/companies/${id}/`);

        const formData = new FormData();
        if (data.name !== undefined) formData.append("name", data.name);
        if (data.status !== undefined) formData.append("status", data.status);
        if (data.email_domain !== undefined) formData.append("email_domain", data.email_domain);
        if (data.contacts !== undefined)
            formData.append("contacts", JSON.stringify(data.contacts));
        if (data.logo instanceof File) formData.append("logo", data.logo);

        const response = await $api<Company>(url, {
            method: "PATCH",
            body: formData,
        });
        return response;
    };

    const getInsights = async (startDate?: string, endDate?: string): Promise<CompanyInsights> => {
        try {
            const url = buildUrl("/api/portal/dashboard/company-insights/");
            const query: Record<string, string> = {}
            if (startDate) query.start_date = startDate
            if (endDate) query.end_date = endDate
            const response = await $api<{
                success: boolean;
                data: CompanyInsights;
            }>(url, {
                method: "GET",
                query,
            });
            return response.data;
        } catch (error) {
            console.warn("Using mock insights data");
            const total = MOCK_COMPANIES.length;
            return {
                summary: {
                    total_companies: total,
                    active_companies: total,
                    inactive_companies: 0,
                    total_revenue: total * 1000,
                    new_last_30_days: 1,
                },
                status_distribution: [
                    { status: "active", count: total },
                    { status: "inactive", count: 0 },
                ],
                revenue_trend: [
                    { month: "Jan 2026", month_key: "2026-01-01", revenue: 0, growth_percentage: 0 },
                    { month: "Feb 2026", month_key: "2026-02-01", revenue: 0, growth_percentage: 0 },
                    { month: "Mar 2026", month_key: "2026-03-01", revenue: 0, growth_percentage: 0 },
                ],
                top_companies_by_tickets: [],
            };
        }
    };

    const getCompanyFacilities = async (companyId: string): Promise<CompanyFacilityMapping[]> => {
        const url = buildUrl("/api/portal/companies/mappings/");
        const response = await $api<{
            success: boolean;
            data: { results: CompanyFacilityMapping[] };
        }>(url, { 
            method: "GET",
            query: { company: companyId }
        });
        return response.data?.results || [];
    };

    const createCompanyFacilityMapping = async (
        data: CreateCompanyFacilityMappingPayload
    ): Promise<CompanyFacilityMapping> => {
        const url = buildUrl("/api/portal/companies/mappings/");
        const response = await $api<CompanyFacilityMapping>(url, {
            method: "POST",
            body: data,
        });
        return response;
    };

    const deleteCompanyFacilityMapping = async (mappingId: string): Promise<void> => {
        const url = buildUrl(`/api/portal/companies/mappings/${mappingId}/`);
        await $api(url, {
            method: "DELETE",
        });
    };

    const deleteCompany = async (id: string): Promise<void> => {
        const url = buildUrl(`/api/portal/companies/${id}/`);
        await $api(url, {
            method: "DELETE",
        });
    };

    const generateCompanyQRCode = async (
        companyId: string,
        companyName: string,
        facilityId: string,
    ): Promise<void> => {
        const domain = window.location.origin;
        const fullUrl = `${domain}/public/visitor/register?facility_id=${facilityId}&company_id=${companyId}`;

        const response = await $api<Blob>(
            "/api/portal/visitors/client/qr-code/pdf/",
            {
                method: "POST",
                body: {
                    full_url: fullUrl,
                    facility_name: companyName,
                },
                responseType: "blob",
            },
        );

        const url = window.URL.createObjectURL(response);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${companyName}-qrcode.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    return {
        getCompanies,
        getCompanyById,
        createCompany,
        updateCompany,
        deleteCompany,
        getInsights,
        getCompanyFacilities,
        createCompanyFacilityMapping,
        deleteCompanyFacilityMapping,
        generateCompanyQRCode,
    };
};
