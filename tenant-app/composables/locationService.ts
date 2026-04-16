// Location Service - APIs for countries, states, cities, zones
// Used for cascading dropdowns in facility forms

export interface Country {
    id: string;
    name: string;
    iso2: string;
    iso3: string;
    phone_code: string;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface State {
    id: string;
    country: string;
    country_name: string;
    name: string;
    state_code: string;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface City {
    id: string;
    state: string;
    state_name: string;
    country_id: string;
    country_name: string;
    name: string;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface Zone {
    id: string;
    tenant: string;
    country: string;
    state: string;
    city: string;
    name: string;
    country_details: Country;
    state_details: State;
    city_details: City;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: {
        success: boolean;
        code: string;
        message: string;
        data: T;
        error: any;
        meta: any;
    };
    error: any;
    meta: any;
}

// Simple response wrapper for zones API (slightly different structure)
interface ZoneApiResponse {
    success: boolean;
    code: string;
    message: string;
    data: PaginatedResponse<Zone>;
    error: any;
    meta: any;
}

export const useLocationService = () => {
    const { $api } = useNuxtApp();

    // Get all countries
    const getCountries = async (): Promise<Country[]> => {
        try {
            const response = await $api<
                ApiResponse<PaginatedResponse<Country>>
            >(`/api/common/masters/countries/`, {
                method: "GET",
                query: { page: 1, page_size: 999 },
            });
            return response.data.data.results;
        } catch (error) {
            console.error("Failed to fetch countries:", error);
            throw error;
        }
    };

    // Get states by country ID
    const getStatesByCountry = async (countryId: string): Promise<State[]> => {
        try {
            const response = await $api<ApiResponse<PaginatedResponse<State>>>(
                `/api/common/masters/states/`,
                {
                    method: "GET",
                    query: { country_id: countryId, page: 1, page_size: 999 },
                },
            );
            return response.data.data.results;
        } catch (error) {
            console.error("Failed to fetch states:", error);
            throw error;
        }
    };

    // Get cities by state ID
    const getCitiesByState = async (stateId: string): Promise<City[]> => {
        try {
            const response = await $api<ApiResponse<PaginatedResponse<City>>>(
                `/api/common/masters/cities/`,
                {
                    method: "GET",
                    query: { state_id: stateId, page: 1, page_size: 999 },
                },
            );
            return response.data.data.results;
        } catch (error) {
            console.error("Failed to fetch cities:", error);
            throw error;
        }
    };

    // Get all zones
    const getAllZones = async (): Promise<Zone[]> => {
        try {
            const response = await $api<{
                success: boolean;
                data: { results: Zone[] };
            }>(`/api/portal/zones/`, {
                method: "GET",
                query: { page: 1, page_size: 999 },
            });
            return response.data.results;
        } catch (error) {
            console.error("Failed to fetch zones:", error);
            throw error;
        }
    };

    // Get zones by city ID
    const getZonesByCity = async (cityId: string): Promise<Zone[]> => {
        try {
            const response = await $api<ZoneApiResponse>(
                `/api/portal/zones/by-city/${cityId}/`,
                {
                    method: "GET",
                    query: { page: 1, page_size: 999 },
                },
            );
            return response.data.results;
        } catch (error) {
            console.error("Failed to fetch zones:", error);
            throw error;
        }
    };

    // Create a new zone
    const createZone = async (zoneData: {
        name: string;
        country: string;
        state: string;
        city: string;
    }): Promise<Zone> => {
        try {
            const response = await $api<{
                success: boolean;
                data: Zone;
            }>(`/api/portal/zones/`, {
                method: "POST",
                body: zoneData,
            });
            return response.data;
        } catch (error) {
            console.error("Failed to create zone:", error);
            throw error;
        }
    };

    return {
        getCountries,
        getStatesByCountry,
        getCitiesByState,
        getAllZones,
        getZonesByCity,
        createZone,
    };
};
