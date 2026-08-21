import { useModuleRegistry, type Module } from './useModuleRegistry'

export interface User {
    id: string
    name: string
    email: string
    phone?: string
    role: string
    modules: string[]
    avatar?: string
    createdAt?: string
    status?: string
    apps?: string[]
    tenant_id?: string
    company_id?: string | null
    facility_id?: string | null
}

export interface Permission {
    id: string
    name: string
    key: string
}

export interface SubModule {
    id: string
    name: string
    permissions: Permission[]
    features?: any[]
}

export interface SystemModule {
    id: string
    module: string
    submodules: SubModule[]
}

export interface UserFacilityAssignment {
    user_id?: string
    facility_ids: string[]
    is_all_facilities: boolean
}

export interface UserModule extends SystemModule {
    isAssigned?: boolean
}

export interface OperationalStaff {
    id: string
    full_name: string
    email: string
    phone_number?: string
    username?: string
    role_id?: string
    role_name?: string
    role_details?: {
        id: string
        name: string
    }
    facility_id?: string
    facility_name?: string
    facility_details?: {
        id: string
        name: string
    }
    status?: string
    created_at?: string
}

export const useUserService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const { getAllModules } = useModuleRegistry()
    const tenantModules = getAllModules()

    // Mock users data
    const mockUsers: User[] = [
        {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            role: 'Admin',
            modules: ['dashboard', 'companies', 'visitors', 'facilities', 'helpdesk', 'meeting_rooms', 'configure', 'users', 'frontdesk', 'spoc_dashboard', 'spoc_visitors', 'spoc_employees']
        },
        {
            id: '2',
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91 87654 32109',
            role: 'Manager',
            modules: ['dashboard', 'companies', 'visitors', 'helpdesk']
        },
        {
            id: '3',
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            phone: '+91 76543 21098',
            role: 'Staff',
            modules: ['dashboard', 'visitors']
        },
        {
            id: '4',
            name: 'Alice Brown',
            email: 'alice.brown@example.com',
            phone: '+91 65432 10987',
            role: 'Staff',
            modules: ['dashboard', 'helpdesk', 'facilities']
        }
    ]

    const getUserModules = async (): Promise<{ modules: string[], permissions: string[] }> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/modules/user/list')
            if (response?.data) {
                const moduleNameMap: Record<string, string> = {
                    'Dashboard': 'dashboard',
                    'Visitors': 'visitors',
                    'Companies': 'companies',
                    'Helpdesk': 'helpdesk',
                    'Facilities': 'facilities',
                    'Meeting Rooms': 'meeting_rooms',
                    'User Management': 'users',
                    'Configure': 'configure',
                    'Front Desk': 'frontdesk',
                    'Banners': 'banners'
                }

                const userKeys: string[] = []
                const permissions: string[] = []
                
                response.data.forEach((m: any) => {
                    const regKey = moduleNameMap[m.module] || m.module.toLowerCase().replace(/\s+/g, '_')
                    userKeys.push(regKey)
                    
                    if (m.submodules && Array.isArray(m.submodules)) {
                        const regModule = tenantModules.find(r => r.key === regKey)
                        if (regModule && regModule.children) {
                            m.submodules.forEach((sm: any) => {
                                const regChild = regModule.children?.find(c => c.label === sm.name)
                                const childKey = regChild ? regChild.key : sm.name.toLowerCase().replace(/\s+/g, '_')
                                if (regChild) {
                                    userKeys.push(regChild.key)
                                }
                                
                                if (sm.permissions && Array.isArray(sm.permissions)) {
                                    sm.permissions.forEach((p: any) => {
                                        if (p.key) {
                                            permissions.push(`${childKey}:${p.key}`)
                                        }
                                    })
                                }
                                
                                if (sm.features && Array.isArray(sm.features)) {
                                    sm.features.forEach((f: any) => {
                                        const featureKey = f.key || f.name.toLowerCase().replace(/\s+/g, '_')
                                        if (f.permissions && Array.isArray(f.permissions)) {
                                            f.permissions.forEach((p: any) => {
                                                if (p.key) {
                                                    permissions.push(`${featureKey}:${p.key}`)
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        } else {
                            m.submodules.forEach((sm: any) => {
                                const childKey = sm.name.toLowerCase().replace(/\s+/g, '_')
                                userKeys.push(childKey)
                                if (sm.permissions && Array.isArray(sm.permissions)) {
                                    sm.permissions.forEach((p: any) => {
                                        if (p.key) {
                                            permissions.push(`${childKey}:${p.key}`)
                                        }
                                    })
                                }
                                
                                if (sm.features && Array.isArray(sm.features)) {
                                    sm.features.forEach((f: any) => {
                                        const featureKey = f.key || f.name.toLowerCase().replace(/\s+/g, '_')
                                        if (f.permissions && Array.isArray(f.permissions)) {
                                            f.permissions.forEach((p: any) => {
                                                if (p.key) {
                                                    permissions.push(`${featureKey}:${p.key}`)
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                })
                console.log("PARSED PERMISSIONS:", permissions); return { modules: userKeys, permissions }
            }
            return { modules: [], permissions: [] }
        } catch (error) {
            console.error('Failed to fetch user modules:', error)
            return { modules: [], permissions: [] }
        }
    }

    const getTenantModules = async (): Promise<Module[]> => {
        await delay(200)
        return tenantModules
    }

    const getUsers = async (): Promise<User[]> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/users/org_portal/list/?app_name=org_portal')
            if (response?.data?.results) {
                return response.data.results.map((u: any) => ({
                    id: u.id,
                    name: u.full_name || '',
                    email: u.email || '',
                    phone: u.phone_number || '',
                    role: 'Staff',
                    modules: u.apps || [],
                    status: u.status,
                    apps: u.apps,
                    tenant_id: u.tenant_id,
                    company_id: u.company_id,
                    facility_id: u.facility_id,
                    createdAt: u.created_at
                }))
            }
            return []
        } catch (error) {
            console.error('Failed to fetch users:', error)
            return []
        }
    }

    const getPortalUserList = async (): Promise<any> => {
        const { $api } = useNuxtApp()
        try {
            const response = await $api<any>('/api/portal/users/org_portal/list/?app_name=org_portal')
            return response
        } catch (error) {
            console.error('Failed to fetch portal user list:', error)
            throw error
        }
    }

    const getUserById = async (id: string): Promise<User | undefined> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/users/org_portal/${id}/`)
            if (response?.data) {
                const u = response.data
                return {
                    id: u.id,
                    name: u.full_name || '',
                    email: u.email || '',
                    phone: u.phone_number || '',
                    role: 'Staff',
                    modules: u.apps || [],
                    status: u.status,
                    apps: u.apps,
                    tenant_id: u.tenant_id,
                    createdAt: u.created_at
                }
            }
            return undefined
        } catch (error) {
            console.error('Failed to fetch user:', error)
            return undefined
        }
    }

    const extractApiErrorMessage = (error: any): string => {
        const errorData = error?.data || error
        if (errorData?.error?.type === 'VALIDATION_ERROR' && errorData?.error?.fields) {
            const fields = errorData.error.fields
            for (const key of Object.keys(fields)) {
                const fieldErrors = fields[key]
                if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
                    return fieldErrors[0].message || `Invalid ${key}`
                }
            }
        }
        return errorData?.message || error?.message || 'Failed to create user'
    }

    const createUser = async (data: Partial<User>): Promise<User> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/users/org_portal/create/?app_name=org_portal', {
                method: 'POST',
                body: {
                    full_name: data.name,
                    email: data.email,
                    phone_number: data.phone,
                    app_name: 'org_portal',
                    apps: data.modules || ['Hub', 'org_portal']
                }
            })
            if (response?.data) {
                const u = response.data
                return {
                    id: u.id,
                    name: u.full_name || '',
                    email: u.email || '',
                    phone: u.phone_number || '',
                    role: 'Staff',
                    modules: u.apps || [],
                    status: u.status,
                    apps: u.apps,
                    tenant_id: u.tenant_id,
                    createdAt: u.created_at
                }
            }
            throw new Error('Failed to create user')
        } catch (error: any) {
            const message = extractApiErrorMessage(error)
            const err = new Error(message) as any
            err.data = error?.data
            err.statusCode = error?.statusCode
            console.error('Failed to create user:', error)
            throw err
        }
    }

    const updateUser = async (id: string, data: Partial<User>): Promise<User | undefined> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/users/org_portal/${id}/update/`, {
                method: 'PATCH',
                body: {
                    full_name: data.name,
                    email: data.email,
                    phone_number: data.phone,
                    app_name: 'org_portal',
                    apps: data.modules
                }
            })
            if (response?.data) {
                const u = response.data
                return {
                    id: u.id,
                    name: u.full_name || '',
                    email: u.email || '',
                    phone: u.phone_number || '',
                    role: 'Staff',
                    modules: u.apps || [],
                    status: u.status,
                    apps: u.apps,
                    tenant_id: u.tenant_id,
                    createdAt: u.created_at
                }
            }
            return undefined
        } catch (error) {
            console.error('Failed to update user:', error)
            throw error
        }
    }

    const updateUserModules = async (userId: string, modules: string[]): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>(`/api/portal/users/org_portal/${userId}/update/`, {
                method: 'PATCH',
                body: { apps: modules }
            })
            return true
        } catch (error) {
            console.error('Failed to update user modules:', error)
            throw error
        }
    }

    const deleteUser = async (id: string): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>(`/api/portal/users/org_portal/${id}/delete/`, {
                method: 'DELETE'
            })
            return true
        } catch (error) {
            console.error('Failed to delete user:', error)
            throw error
        }
    }

    const getAllSystemModules = async (): Promise<SystemModule[]> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/modules/list/')
            if (response?.data?.data?.results) {
                return response.data.data.results
            }
            return []
        } catch (error) {
            console.error('Failed to fetch system modules:', error)
            return []
        }
    }

    const getUserAssignedModules = async (userId: string): Promise<{ submodules: string[], features: string[] }> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/modules/user/?user_id=${userId}&page_size=9999`)
            
            const result = { submodules: [] as string[], features: [] as string[] }
            const data = response?.data
            
            if (data) {
                // New format: data.submodule_permissions and data.feature_permissions
                if (data.submodule_permissions && Array.isArray(data.submodule_permissions)) {
                    result.submodules = data.submodule_permissions.map((p: any) => p.submodule_permission)
                }
                if (data.feature_permissions && Array.isArray(data.feature_permissions)) {
                    result.features = data.feature_permissions.map((p: any) => p.feature_permission || p.feature || p.id)
                }
                
                // Old format fallback
                if (!data.submodule_permissions) {
                    let results = data.data?.results || data.results || data
                    if (Array.isArray(results) && results.length > 0) {
                        if (results[0].submodule_permission) {
                            result.submodules = results.map((p: any) => p.submodule_permission)
                        } else if (results[0].submodules || results[0].module) {
                            results.forEach((m: any) => {
                                if (m.submodules && Array.isArray(m.submodules)) {
                                    m.submodules.forEach((sm: any) => {
                                        if (sm.permissions && Array.isArray(sm.permissions)) {
                                            sm.permissions.forEach((p: any) => {
                                                if (p.id) result.submodules.push(p.id)
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    }
                }
            }
            return result
        } catch (error) {
            console.error('Failed to fetch user modules:', error)
            return { submodules: [], features: [] }
        }
    }

    const assignModulesToUser = async (userId: string, submodulePermissionIds: string[], featurePermissionIds: string[] = []): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>('/api/portal/modules/user/bulk-assign/', {
                method: 'POST',
                body: {
                    user: userId,
                    submodule_permissions: submodulePermissionIds,
                    feature_permissions: featurePermissionIds
                }
            })
            return true
        } catch (error) {
            console.error('Failed to assign modules:', error)
            throw error
        }
    }

    const getAllSubmodulePermissions = async (): Promise<string[]> => {
        try {
            const modules = await getAllSystemModules()
            const permissions: string[] = []
            modules.forEach(m => {
                m.submodules.forEach(sm => {
                    sm.permissions.forEach(p => {
                        permissions.push(p.id)
                    })
                })
            })
            return permissions
        } catch (error) {
            console.error('Failed to get all permissions:', error)
            return []
        }
    }

    const getUserFacilities = async (userId: string): Promise<UserFacilityAssignment> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/users/org_portal/${userId}/facilities/`)
            const data = response?.data || {}
            return {
                user_id: data.user_id,
                facility_ids: Array.isArray(data.facility_ids) ? data.facility_ids : [],
                is_all_facilities: !!data.is_all_facilities
            }
        } catch (error) {
            console.error('Failed to fetch user facilities:', error)
            return { facility_ids: [], is_all_facilities: false }
        }
    }

    const assignUserFacilities = async (userId: string, payload: { facility_ids: string[]; is_all_facilities: boolean }): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>(`/api/portal/users/org_portal/${userId}/facilities/`, {
                method: 'PUT',
                body: {
                    facility_ids: payload.facility_ids,
                    is_all_facilities: payload.is_all_facilities
                }
            })
            return true
        } catch (error) {
            console.error('Failed to assign user facilities:', error)
            throw error
        }
    }

    const getOperationalStaff = async (facilityId?: string): Promise<OperationalStaff[]> => {
        try {
            const { $api } = useNuxtApp()
            const query: any = { page_size: 9999 }
            if (facilityId) query.facility_id = facilityId
            const response = await $api<any>('/api/portal/users/opstrack/list/', { method: 'GET', query })
            const data = response?.data?.results || response?.data?.data?.results || response?.results || response?.data || []
            return Array.isArray(data) ? data : []
        } catch (error) {
            console.error('Failed to fetch operational staff:', error)
            return []
        }
    }

    const createOperationalStaff = async (payload: {
        full_name: string
        email: string
        phone_number: string
        username: string
        password: string
        facility_id?: string
        role_id?: string
    }): Promise<OperationalStaff> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/users/opstrack/create/', {
                method: 'POST',
                body: payload
            })
            if (response?.data) {
                return response.data
            }
            throw new Error('Failed to create operational staff')
        } catch (error: any) {
            const message = extractApiErrorMessage(error)
            const err = new Error(message) as any
            err.data = error?.data
            err.statusCode = error?.statusCode
            console.error('Failed to create operational staff:', error)
            throw err
        }
    }

    const updateOperationalStaff = async (id: string, payload: Partial<OperationalStaff> & { role_id?: string }): Promise<OperationalStaff> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/users/opstrack/${id}/update/`, {
                method: 'PATCH',
                body: payload
            })
            return response?.data
        } catch (error) {
            console.error('Failed to update operational staff:', error)
            throw error
        }
    }

    const deleteOperationalStaff = async (id: string): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>(`/api/portal/users/opstrack/${id}/delete/`, {
                method: 'DELETE'
            })
            return true
        } catch (error) {
            console.error('Failed to delete operational staff:', error)
            throw error
        }
    }

    return {
        getUserModules,
        getTenantModules,
        getUsers,
        getUserById,
        createUser,
        updateUser,
        updateUserModules,
        deleteUser,
        getPortalUserList,
        getAllSystemModules,
        getUserAssignedModules,
        assignModulesToUser,
        getAllSubmodulePermissions,
        getUserFacilities,
        assignUserFacilities,
        getOperationalStaff,
        createOperationalStaff,
        updateOperationalStaff,
        deleteOperationalStaff
    }
}

