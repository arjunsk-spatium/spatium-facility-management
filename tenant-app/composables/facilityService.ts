// Facility Service - API Integration
// Connects to backend facility and tower APIs

// ============ Types/Interfaces ============

export interface CountryDetails {
    id: string;
    name: string;
    iso2: string;
    iso3: string;
    phone_code: string | null;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface StateDetails {
    id: string;
    country: string;
    country_name: string;
    name: string;
    state_code: string | null;
    is_active: boolean;
    is_archive: boolean;
    created_at: string;
    updated_at: string;
}

export interface CityDetails {
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

export interface ZoneDetails {
    id: string;
    tenant: string;
    country: string;
    state: string;
    city: string;
    name: string;
    country_details: CountryDetails;
    state_details: StateDetails;
    city_details: CityDetails;
    is_archive: boolean;
    archived_at: string | null;
    archived_by: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
}

export interface Wing {
    id: string;
    name: string;
}

export interface Floor {
    id: string;
    name: string;
    number: number;
    wings: Wing[];
}

export interface Tower {
    id: string;
    tenant: string;
    facility: string;
    name: string;
    floor_count: number;
    is_archive: boolean;
    archived_at: string | null;
    archived_by: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Client-side only (for UI compatibility)
    floors?: Floor[];
}

export interface Facility {
    id: string;
    tenant: string;
    name: string;
    address: string;
    postal_code: string | null;
    image_url: string | null;
    country: string;
    state: string;
    city: string;
    zone: string;
    country_details: CountryDetails;
    state_details: StateDetails;
    city_details: CityDetails;
    zone_details: ZoneDetails;
    tower_count: number;
    has_towers: boolean;
    is_archive: boolean;
    archived_at: string | null;
    archived_by: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    // Client-side only (for UI compatibility with existing pages)
    towers?: Tower[];
    staff?: Staff[];
    location?: {
        address: string;
        city: string;
        state: string;
        country: string;
    };
}

export interface Staff {
    id: string;
    name: string;
    role: string;
    email: string;
}

export interface PaginatedResponse<T> {
    count: number;
    next: string | null;
    previous: string | null;
    results: T[];
}

export interface ApiResponse<T> {
    success: boolean;
    code: string;
    message: string;
    data: T;
    error: any | null;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface CreateFacilityPayload {
    name: string;
    address: string;
    country: string;
    state: string;
    city: string;
    zone: string;
    has_towers: boolean;
    postal_code?: string;
    image_url?: File;
}

export interface CreateTowerPayload {
    facility: string;
    name: string;
}

export interface CreateFloorPayload {
    tower: string;
    name: string;
}

export interface UpdateFloorPayload {
    tower: string;
    name: string;
}

export interface CreateWingPayload {
    floor: string;
    name: string;
}

export interface UpdateWingPayload {
    floor: string;
    name: string;
}

// ... existing interfaces ...

export interface FacilityListParams {
    page?: number;
    page_size?: number;
    search?: string;
}

// ... existing interfaces ...

export interface IFacilityService {
    getFacilities(params?: FacilityListParams): Promise<{
        facilities: Facility[];
        count: number;
        next: string | null;
        previous: string | null;
    }>;
    getFacilityById(id: string): Promise<Facility>;
    createFacility(payload: CreateFacilityPayload): Promise<Facility>;
    updateFacility(
        id: string,
        payload: Partial<CreateFacilityPayload>,
    ): Promise<Facility>;
    deleteFacility(id: string): Promise<void>;
    getTowers(facilityId?: string): Promise<Tower[]>;
    createTower(payload: CreateTowerPayload): Promise<Tower>;
    updateTower(id: string, payload: Partial<CreateTowerPayload>): Promise<Tower>;
    deleteTower(id: string): Promise<void>;
    getFloors(towerId: string): Promise<Floor[]>;
    createFloor(payload: CreateFloorPayload): Promise<Floor>;
    updateFloor(id: string, payload: UpdateFloorPayload): Promise<Floor>;
    deleteFloor(id: string): Promise<void>;
    getWings(floorId: string): Promise<Wing[]>;
    createWing(payload: CreateWingPayload): Promise<Wing>;
    updateWing(id: string, payload: UpdateWingPayload): Promise<Wing>;
    deleteWing(id: string): Promise<void>;
    generateFacilityQRCode(facilityId: string, facilityName: string): Promise<void>;
}

export const useFacilityService = (): IFacilityService => {
    const { $api } = useNuxtApp();
    const config = useRuntimeConfig();

    return {
        getFacilities: async (params: FacilityListParams = {}) => {
            const query: any = {};
            if (params.page) query.page = params.page;
            if (params.search) query.search = params.search;

            const response = await $api<
                ApiResponse<PaginatedResponse<Facility>>
            >("/api/portal/facilities/", {
                method: "GET",
                query,
            });

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to fetch facilities",
                );
            }

            return {
                facilities: response.data.results,
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
            };
        },

        getFacilityById: async (id: string) => {
            const response = await $api<ApiResponse<Facility>>(
                `/api/portal/facilities/${id}/`,
                {
                    method: "GET",
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch facility");
            }

            return response.data;
        },

        createFacility: async (payload: CreateFacilityPayload) => {
            const formData = new FormData();
            formData.append("name", payload.name);
            formData.append("address", payload.address);
            formData.append("country", payload.country);
            formData.append("state", payload.state);
            formData.append("city", payload.city);
            formData.append("zone", payload.zone);
            formData.append("has_towers", payload.has_towers.toString());
            if (payload.postal_code)
                formData.append("postal_code", payload.postal_code);
            if (payload.image_url) formData.append("image", payload.image_url);

            const response = await $api<ApiResponse<Facility>>(
                "/api/portal/facilities/",
                {
                    method: "POST",
                    body: formData,
                },
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to create facility",
                );
            }

            return response.data;
        },

        updateFacility: async (
            id: string,
            payload: Partial<CreateFacilityPayload>,
        ) => {
            const formData = new FormData();
            if (payload.name) formData.append("name", payload.name);
            if (payload.address) formData.append("address", payload.address);
            if (payload.country) formData.append("country", payload.country);
            if (payload.state) formData.append("state", payload.state);
            if (payload.city) formData.append("city", payload.city);
            if (payload.zone) formData.append("zone", payload.zone);
            if (payload.has_towers !== undefined)
                formData.append("has_towers", payload.has_towers.toString());
            if (payload.postal_code)
                formData.append("postal_code", payload.postal_code);
            if (payload.image_url) formData.append("image", payload.image_url);

            const response = await $api<ApiResponse<Facility>>(
                `/api/portal/facilities/${id}/`,
                {
                    method: "PATCH",
                    body: formData,
                },
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to update facility",
                );
            }

            return response.data;
        },

        deleteFacility: async (id: string) => {
            const response = await $api<ApiResponse<null>>(
                `/api/portal/facilities/${id}/`,
                {
                    method: "DELETE",
                },
            );

            if (!response.success) {
                throw new Error(
                    response.message || "Failed to delete facility",
                );
            }
        },

        getTowers: async (facilityId?: string) => {
            const query: any = {};
            if (facilityId) query.facility = facilityId;

            const response = await $api<ApiResponse<PaginatedResponse<Tower>>>(
                "/api/portal/facilities-towers/",
                {
                    method: "GET",
                    query,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch towers");
            }

            return response.data.results;
        },

        createTower: async (payload: CreateTowerPayload) => {
            const response = await $api<ApiResponse<Tower>>(
                "/api/portal/facilities-towers/",
                {
                    method: "POST",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to create tower");
            }

            return response.data;
        },

        updateTower: async (id: string, payload: Partial<CreateTowerPayload>) => {
            const response = await $api<ApiResponse<Tower>>(
                `/api/portal/facilities-towers/${id}/`,
                {
                    method: "PATCH",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to update tower");
            }

            return response.data;
        },

        deleteTower: async (id: string) => {
            const response = await $api<ApiResponse<null>>(
                `/api/portal/facilities-towers/${id}/`,
                {
                    method: "DELETE",
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to delete tower");
            }
        },

        createFloor: async (payload: CreateFloorPayload) => {
            const response = await $api<ApiResponse<Floor>>(
                `/api/portal/facilities-floors/`,
                {
                    method: "POST",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to create floor");
            }

            return response.data;
        },

        updateFloor: async (id: string, payload: UpdateFloorPayload) => {
            const response = await $api<ApiResponse<Floor>>(
                `/api/portal/facilities-floors/${id}/`,
                {
                    method: "PATCH",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to update floor");
            }

            return response.data;
        },

        deleteFloor: async (id: string) => {
            const response = await $api<ApiResponse<null>>(
                `/api/portal/facilities-floors/${id}/`,
                {
                    method: "DELETE",
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to delete floor");
            }
        },

        createWing: async (payload: CreateWingPayload) => {
            const response = await $api<ApiResponse<Wing>>(
                `/api/portal/facilities-wings/`,
                {
                    method: "POST",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to create wing");
            }

            return response.data;
        },
        getFloors: async (towerId: string) => {
            const response = await $api<ApiResponse<PaginatedResponse<Floor>>>(
                `/api/portal/facilities-floors/`,
                {
                    method: "GET",
                    query: { tower: towerId },
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch floors");
            }

            return response.data.results;
        },

        getWings: async (floorId: string) => {
            const response = await $api<ApiResponse<PaginatedResponse<Wing>>>(
                `/api/portal/facilities-wings/`,
                {
                    method: "GET",
                    query: { floor: floorId },
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to fetch wings");
            }

            return response.data.results;
        },

        updateWing: async (id: string, payload: UpdateWingPayload) => {
            const response = await $api<ApiResponse<Wing>>(
                `/api/portal/facilities-wings/${id}/`,
                {
                    method: "PATCH",
                    body: payload,
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to update wing");
            }

            return response.data;
        },

        deleteWing: async (id: string) => {
            const response = await $api<ApiResponse<null>>(
                `/api/portal/facilities-wings/${id}/`,
                {
                    method: "DELETE",
                },
            );

            if (!response.success) {
                throw new Error(response.message || "Failed to delete wing");
            }
        },

        generateFacilityQRCode: async (facilityId: string, facilityName: string) => {
            const domain = window.location.origin;
            const fullUrl = `${domain}/public/visitor?facility=${facilityId}`;
            
            const response = await $api<Blob>('/api/portal/visitors/client/qr-code/pdf/', {
                method: 'POST',
                body: {
                    full_url: fullUrl,
                    facility_name: facilityName
                },
                responseType: 'blob'
            });
            
            // Trigger download
            const url = window.URL.createObjectURL(response);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${facilityName}-qrcode.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        },
    };
};
