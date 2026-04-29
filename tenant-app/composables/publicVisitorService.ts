import type { ApiResponse } from "./visitorService";

export interface PublicVisitorData {
    tenant_id: string;
    visitor: {
        id: string;
        name: string;
        email: string | null;
        from_company: string | null;
        visitor_type: string;
        status: string;
        creator_type: string | null;
        created_by_id: string | null;
        approved_by_id: string | null;
        rejected_by_id: string | null;
        facility_id: string;
        facility_name: string;
        company_id: string;
        company_name: string;
        purpose_of_visit_id: string;
        purpose_of_visit: string;
        appointment_time: string | null;
        check_in_time: string | null;
        check_out_time: string | null;
        is_on_premises: boolean;
        image_url: string | null;
        created_at: string;
        updated_at: string;
    };
}

export interface PurposeOfVisit {
    id: string;
    name: string;
    code: string;
}

export interface PublicCompany {
    id: string;
    name: string;
    email_domain: string | null;
}

export interface CompanyUser {
    id: string;
    full_name: string;
    email: string;
}

export interface FacilityInfo {
    id: string;
    name: string;
    [key: string]: any;
}

export interface PublicTenantConfig {
    credit_system_enabled: boolean;
    visitor_email_required: boolean;
    visitor_company_required: boolean;
}

export const usePublicVisitorService = () => {
    const route = useRoute();

    const config = useRuntimeConfig();

    const getTenantId = (): string => {
        // Priority: URL query → Pinia store → localStorage → cookie
        const fromQuery = route.query.tenant as string;
        if (fromQuery) return fromQuery;
        try {
            const storeId = useTenantStore().tenant?.id;
            if (storeId) return storeId;
        } catch (_) {}
        if (typeof window !== 'undefined') {
            const fromStorage = localStorage.getItem('tenant_id');
            if (fromStorage) return fromStorage;
        }
        return '';
    };

    // Use direct API fetch to bypass static hosting index.html fallback
    const publicFetch = async <T>(
        endpoint: string,
        options: {
            method?: string;
            body?: any;
            query?: Record<string, any>;
        } = {},
    ): Promise<T> => {
        const { method = "GET", body, query } = options;
        const isFormData =
            typeof FormData !== "undefined" && body instanceof FormData;

        // Build URL using configured target API
        const baseUrl = config.public.apiBaseUrl;
        let url = endpoint.startsWith("http") ? endpoint : `${baseUrl}${endpoint}`;
        
        const finalQuery = { ...query };
        if (method === "GET") {
            finalQuery._t = Date.now();
        }
        
        if (Object.keys(finalQuery).length > 0) {
            const params = new URLSearchParams();
            Object.entries(finalQuery).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    params.append(key, String(value));
                }
            });
            const qs = params.toString();
            if (qs) url = `${url}?${qs}`;
        }

        const headers: Record<string, string> = {
            "X-TENANT-ID": getTenantId(),
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0",
        };
        if (!isFormData) {
            headers["Content-Type"] = "application/json";
        }

        const token = useCookie("visitor_token");
        if (token.value) {
            headers["Authorization"] = `Bearer ${token.value}`;
        }

        const fetchOptions: RequestInit = { 
            method, 
            headers,
            cache: "no-store", 
        };
        if (body && method !== "GET") {
            fetchOptions.body = isFormData ? body : JSON.stringify(body);
        }

        const response = await fetch(url, fetchOptions);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error: any = new Error(
                errorData.message || `HTTP ${response.status}`,
            );
            error.statusCode = response.status;
            error.data = errorData;
            throw error;
        }
        return response.json();
    };

    const requestOtp = async (phone: string): Promise<boolean> => {
        const response = await publicFetch<ApiResponse<any>>(
            "/api/portal/visitors/public/otp/request/",
            { method: "POST", body: { phone } },
        );
        return response.success;
    };

    const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
        const response = await publicFetch<ApiResponse<any>>(
            "/api/portal/visitors/public/otp/verify/",
            { method: "POST", body: { phone, otp } },
        );
        if (response.success && response.data?.access) {
            const token = useCookie("visitor_token", {
                maxAge: response.data.expires_in || 1800,
            });
            token.value = response.data.access;
        }
        return response.success;
    };

    const getMe = async (): Promise<PublicVisitorData | null> => {
        try {
            const response = await publicFetch<ApiResponse<PublicVisitorData>>(
                "/api/portal/visitors/public/me/",
            );
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch {
            return null;
        }
    };

    const getPurposesOfVisit = async (): Promise<PurposeOfVisit[]> => {
        const response = await publicFetch<ApiResponse<PurposeOfVisit[]>>(
            "/api/portal/mobile/hub/purposes-of-visit/",
        );
        if (response.success && response.data) {
            return response.data;
        }
        return [];
    };

    const getCompanies = async (
        facilityId?: string,
    ): Promise<PublicCompany[]> => {
        const query: Record<string, any> = {};
        if (facilityId) query.facility_id = facilityId;
        const response = await publicFetch<ApiResponse<PublicCompany[]>>(
            "/api/portal/visitors/public/companies/",
            { query },
        );
        if (response.success && response.data) {
            return response.data;
        }
        return [];
    };

    const getCompanyUsers = async (
        companyId: string,
    ): Promise<CompanyUser[]> => {
        const response = await publicFetch<ApiResponse<CompanyUser[]>>(
            "/api/portal/visitors/public/company-users/",
            { query: { company_id: companyId } },
        );
        if (response.success && response.data) {
            return response.data;
        }
        return [];
    };

    const getFacility = async (
        facilityId: string,
    ): Promise<FacilityInfo | null> => {
        try {
            const response = await publicFetch<ApiResponse<FacilityInfo>>(
                `/api/portal/visitors/public/facilities/${facilityId}/`,
            );
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch {
            return null;
        }
    };

    const getFacilities = async (): Promise<FacilityInfo[]> => {
        try {
            const response = await publicFetch<ApiResponse<{ results: FacilityInfo[] }>>(
                `/api/portal/facilities/public/facilities/`,
            );
            if (response.success && response.data?.results) {
                return response.data.results;
            }
            return [];
        } catch {
            return [];
        }
    };

    const createWalkIn = async (formData: FormData): Promise<any> => {
        const response = await publicFetch<ApiResponse<any>>(
            "/api/portal/visitors/public/walk-in/",
            { method: "POST", body: formData },
        );
        if (!response.success) {
            throw new Error(
                response.message || "Failed to create walk-in visitor",
            );
        }
        return response.data;
    };

    const preInvite = async (data: {
        facility_id: string;
        purpose_of_visit_id: string;
        name: string;
        phone: string;
        email?: string;
        from_company?: string;
        appointment_date: string;
        appointment_time: string;
    }): Promise<any> => {
        const response = await publicFetch<ApiResponse<any>>(
            "/api/portal/visitors/client/pre-invite/",
            { method: "POST", body: data },
        );
        if (!response.success) {
            throw new Error(
                response.message || "Failed to create pre-invite",
            );
        }
        return response.data;
    };

    const getVisitorStatus = async (visitorId: string): Promise<any> => {
        const response = await publicFetch<ApiResponse<any>>(
            `/api/portal/visitors/public/visitors/${visitorId}/status/`,
            { method: "GET" },
        );
        if (!response.success) {
            throw new Error(
                response.message || "Failed to get visitor status",
            );
        }
        return response.data;
    };

    const getTenantConfig = async (): Promise<PublicTenantConfig | null> => {
        try {
            const response = await publicFetch<ApiResponse<PublicTenantConfig>>(
                "/api/portal/visitors/public/tenant-config/",
                { method: "GET" },
            );
            if (response.success && response.data) {
                return response.data;
            }
            return null;
        } catch {
            return null;
        }
    };

    return {
        requestOtp,
        verifyOtp,
        getMe,
        getPurposesOfVisit,
        getCompanies,
        getCompanyUsers,
        getFacility,
        getFacilities,
        createWalkIn,
        preInvite,
        getVisitorStatus,
        getTenantConfig,
    };
};
