export interface Department {
    id: string
    tenant: string
    company_id: string
    name: string
    description: string | null
    slug: string
    created_by: string
    created_at: string
    updated_at: string
    is_archive: boolean
    archived_at: string | null
    archived_by: string | null
}

export const useDepartmentService = () => {
    const { $api } = useNuxtApp()

    const fetchDepartments = async (): Promise<Department[]> => {
        try {
            const response = await $api<any>('/api/portal/departments/')
            if (response.success && response.data?.results) {
                return response.data.results
            }
            return []
        } catch {
            return []
        }
    }

    const createDepartment = async (data: { name: string; description?: string }): Promise<Department | null> => {
        const response = await $api<any>('/api/portal/departments/', {
            method: 'POST',
            body: data
        })
        if (response.success && response.data) {
            return response.data
        }
        return null
    }

    const updateDepartment = async (id: string, data: { name?: string; description?: string }): Promise<Department | null> => {
        const response = await $api<any>(`/api/portal/departments/${id}/`, {
            method: 'PATCH',
            body: data
        })
        if (response.success && response.data) {
            return response.data
        }
        return null
    }

    const deleteDepartment = async (id: string): Promise<boolean> => {
        try {
            const response = await $api<any>(`/api/portal/departments/${id}/`, {
                method: 'DELETE'
            })
            return response.success === true
        } catch {
            return false
        }
    }

    return {
        fetchDepartments,
        createDepartment,
        updateDepartment,
        deleteDepartment
    }
}
