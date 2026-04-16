import { type PortalUser } from "~/types/user";

export const useUserService = () => {
    const { request } = useApi();

    const getUsers = async (params: any = {}) => {
        let url = "/api/platform/users/admin/list/";
        if (params.tenant_id) {
            url = `/api/platform/tenants/tenants/${params.tenant_id}/users/`;
            const { tenant_id, ...queryParams } = params;
            const response = await request<any>(url, { params: queryParams });
            return response?.data?.results || [];
        }
        const response = await request<any>(url, { params });
        return response?.data?.results || [];
    };

    const getUserById = async (id: string) => {
        const response = await request<any>(
            `/api/platform/users/admin/${id}/detail/`,
        );
        return response?.data;
    };

    const createUser = async (userData: Partial<PortalUser>) => {
        return request("/api/platform/users/admin/create/", {
            method: "POST",
            body: userData,
        });
    };

    const updateUser = async (id: string, userData: Partial<PortalUser>) => {
        return request(`/api/platform/users/admin/${id}/update/`, {
            method: "PATCH",
            body: userData,
        });
    };

    const patchUser = async (id: string, userData: Partial<PortalUser>) => {
        return request(`/api/portal/users/${id}/update/`, {
            method: "PATCH",
            body: userData,
        });
    };

    const deleteUser = async (id: string) => {
        return request(`/api/platform/users/admin/${id}/delete/`, {
            method: "DELETE",
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
