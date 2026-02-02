
import { type PortalUser } from '~/types/user';

export const useUserService = () => {
    const { request } = useApi();

    const getUsers = async (params: any = {}) => {
        let url = '/api/portal/users/list/';
        if (params.tenant_id) {
            url = `/api/platform/tenants/tenants/${params.tenant_id}/users/`;
             // We keep tenant_id in params as getting it from url might be safer but backend might expect it in query too or ignore it. 
             // Ideally if it's a path param we might want to remove it from query params but kept it for safety unless it causes issues.
             // Actually, usually if it's in the path, we don't need it in the query. Let's send a clean request.
             // However, to be safe and avoid mutating the original params object affecting other things, let's clone.
             const { tenant_id, ...queryParams } = params;
             const response = await request<any>(url, { params: queryParams });
             return response?.data?.results || [];
        }
        const response = await request<any>(url, { params });
        return response?.data?.results || [];
    };

    const getUserById = async (id: string) => {
        const response = await request<any>(`/api/platform/users/admin/${id}/detail/`);
        return response?.data;
    };

    const createUser = async (userData: Partial<PortalUser>) => {
        return request('/api/portal/users/create/', {
            method: 'POST',
            body: userData,
        });
    };

    const updateUser = async (id: string, userData: Partial<PortalUser>) => {
        return request(`/api/platform/users/admin/${id}/update/`, {
            method: 'PATCH',
            body: userData,
        });
    };

    const patchUser = async (id: string, userData: Partial<PortalUser>) => {
        return request(`/api/portal/users/${id}/update/`, {
            method: 'PATCH',
            body: userData,
        });
    };

    const deleteUser = async (id: string) => {
        return request(`/api/portal/users/${id}/`, {
            method: 'DELETE',
        });
    };

    return {
        getUsers,
        getUserById,
        createUser,
        updateUser,
        patchUser,
        deleteUser,
    };
};
