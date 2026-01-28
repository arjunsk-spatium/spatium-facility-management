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

export const useModuleRegistry = () => {
    const { request } = useApi();

    const getRegistry = async (): Promise<RegistryResponse> => {
        return request<RegistryResponse>('/api/platform/modules/registry/');
    };

    return {
        getRegistry
    };
};
