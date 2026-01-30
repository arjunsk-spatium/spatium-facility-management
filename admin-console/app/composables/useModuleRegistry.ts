export interface RegistryModule {
    id: string;
    app: string;
    key: string;
    name: string;
    description: string;
    is_active: boolean;
    is_archive: boolean;
    dependencies: any[];
    submodules_count: number;
    created_at: string;
    updated_at: string;
}

export interface CreateModulePayload {
    app: string;
    key: string;
    name: string;
    description: string;
}

export interface UpdateModulePayload {
    app?: string;
    key?: string;
    name?: string;
    description?: string;
    is_active?: boolean;
}

export interface RegistryResponse {
    success: boolean;
    code: string;
    message: string;
    data: {
        count: number;
        next: string | null;
        previous: string | null;
        results: RegistryModule[];
    };
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export interface SingleRegistryResponse {
    success: boolean;
    code: string;
    message: string;
    data: RegistryModule;
    error: any;
    meta: {
        request_id: string;
        timestamp: string;
    };
}

export const useModuleRegistry = () => {
    const { request } = useApi();

    const getRegistry = async (params: any = {}): Promise<RegistryResponse> => {
        return request<RegistryResponse>('/api/platform/modules/registry/', { params });
    };

    const createModule = async (payload: CreateModulePayload): Promise<SingleRegistryResponse> => {
        return request<SingleRegistryResponse>('/api/platform/modules/registry/', {
            method: 'POST',
            body: payload
        });
    };

    const updateModule = async (id: string, payload: UpdateModulePayload): Promise<SingleRegistryResponse> => {
        return request<SingleRegistryResponse>(`/api/platform/modules/registry/${id}/`, {
            method: 'PATCH',
            body: payload
        });
    };

    const deleteModule = async (id: string): Promise<any> => {
        return request(`/api/platform/modules/registry/${id}/`, {
            method: 'DELETE'
        });
    };

    return {
        getRegistry,
        createModule,
        updateModule,
        deleteModule
    };
};
