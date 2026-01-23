
export interface PortalUser {
  id?: string;
  app_name: string;
  full_name: string;
  email: string;
  phone_number: string;
}

export const useUserService = () => {
    const config = useRuntimeConfig();
    const apiBaseUrl = config.public.apiBaseUrl;

    const getUsers = async () => {
        return useFetch<PortalUser[]>(`${apiBaseUrl}/api/portal/users/`, {
            query: { app_name: 'admin' }
        });
    };

    const getUserById = async (id: string) => {
        return useFetch<PortalUser>(`${apiBaseUrl}/api/portal/users/${id}/`);
    };

    const createUser = async (userData: PortalUser) => {
        return useFetch(`${apiBaseUrl}/api/portal/users/create/`, {
            method: 'POST',
            body: userData,
        });
    };

    const updateUser = async (id: string, userData: Partial<PortalUser>) => {
        return useFetch(`${apiBaseUrl}/api/portal/users/${id}/`, {
            method: 'PATCH',
            body: userData,
        });
    };

    const deleteUser = async (id: string) => {
        return useFetch(`${apiBaseUrl}/api/portal/users/${id}/`, {
            method: 'DELETE',
        });
    };

    return {
        getUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
    };
};
