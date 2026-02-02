
import { type PortalUser } from '~/types/user';

export const useUserService = () => {
    const { request } = useApi();

    const getUsers = async (params: any = {}) => {
        const response = await request<any>('/api/portal/users/list/', { params });
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
