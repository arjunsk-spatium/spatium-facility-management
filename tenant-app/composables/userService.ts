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
}

export interface SystemModule {
    id: string
    module: string
    submodules: SubModule[]
}

export interface UserModule extends SystemModule {
    isAssigned?: boolean
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

    const getUserModules = async (): Promise<string[]> => {
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
                    'Front Desk': 'frontdesk'
                }

                const userKeys: string[] = []
                
                response.data.forEach((m: any) => {
                    const regKey = moduleNameMap[m.module] || m.module.toLowerCase().replace(/\s+/g, '_')
                    userKeys.push(regKey)
                    
                    if (m.submodules && Array.isArray(m.submodules)) {
                        const regModule = tenantModules.find(r => r.key === regKey)
                        if (regModule && regModule.children) {
                            m.submodules.forEach((sm: any) => {
                                const regChild = regModule.children?.find(c => c.label === sm.name)
                                if (regChild) {
                                    userKeys.push(regChild.key)
                                }
                            })
                        }
                    }
                })
                return userKeys
            }
            return []
        } catch (error) {
            console.error('Failed to fetch user modules:', error)
            return []
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

    const createUser = async (data: Partial<User>): Promise<User> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>('/api/portal/users/org_portal/create/', {
                method: 'POST',
                body: {
                    full_name: data.name,
                    email: data.email,
                    phone_number: data.phone,
                    apps: data.modules || ['Hub']
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
        } catch (error) {
            console.error('Failed to create user:', error)
            throw error
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

    const getUserAssignedModules = async (userId: string): Promise<string[]> => {
        try {
            const { $api } = useNuxtApp()
            const response = await $api<any>(`/api/portal/modules/user/?user_id=${userId}&page_size=9999`)
            
            // The API response might be in response.data.data.results or response.data.results or response.data.data
            let results = response?.data?.data?.results || response?.data?.results || response?.data?.data
            if (Array.isArray(results)) {
                if (results.length > 0) {
                    if (results[0].submodule_permission) {
                        // Old flat mapping format
                        return results.map((p: any) => p.submodule_permission)
                    } else if (results[0].submodules || results[0].module) {
                        // New nested format: modules > submodules > permissions
                        const permIds: string[] = []
                        results.forEach((m: any) => {
                            if (m.submodules && Array.isArray(m.submodules)) {
                                m.submodules.forEach((sm: any) => {
                                    if (sm.permissions && Array.isArray(sm.permissions)) {
                                        sm.permissions.forEach((p: any) => {
                                            if (p.id) permIds.push(p.id)
                                        })
                                    }
                                })
                            }
                        })
                        return permIds
                    }
                }
                return []
            }
            return []
        } catch (error) {
            console.error('Failed to fetch user modules:', error)
            return []
        }
    }

    const assignModulesToUser = async (userId: string, submodulePermissionIds: string[]): Promise<boolean> => {
        try {
            const { $api } = useNuxtApp()
            await $api<any>('/api/portal/modules/user/bulk-assign/', {
                method: 'POST',
                body: {
                    user: userId,
                    submodule_permissions: submodulePermissionIds
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
        getAllSubmodulePermissions
    }
}
