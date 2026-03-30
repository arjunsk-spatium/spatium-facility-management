import { useModuleRegistry, type Module } from './useModuleRegistry'

export interface User {
    id: number
    name: string
    email: string
    phone?: string
    role: string
    modules: string[]
    avatar?: string
    createdAt?: string
}

export const useUserService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    const { getAllModules } = useModuleRegistry()
    const tenantModules = getAllModules()

    // Mock users data
    const mockUsers: User[] = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            role: 'Admin',
            modules: ['dashboard', 'companies', 'visitors', 'facilities', 'helpdesk', 'meeting_rooms', 'configure', 'users', 'frontdesk', 'spoc_dashboard', 'spoc_visitors', 'spoc_employees']
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@example.com',
            phone: '+91 87654 32109',
            role: 'Manager',
            modules: ['dashboard', 'companies', 'visitors', 'helpdesk']
        },
        {
            id: 3,
            name: 'Bob Wilson',
            email: 'bob.wilson@example.com',
            phone: '+91 76543 21098',
            role: 'Staff',
            modules: ['dashboard', 'visitors']
        },
        {
            id: 4,
            name: 'Alice Brown',
            email: 'alice.brown@example.com',
            phone: '+91 65432 10987',
            role: 'Staff',
            modules: ['dashboard', 'helpdesk', 'facilities']
        }
    ]

    const getUserModules = async (): Promise<string[]> => {
        await delay(300)
        return tenantModules.map(m => m.key)    
    }

    const getTenantModules = async (): Promise<Module[]> => {
        await delay(200)
        return tenantModules
    }

    const getUsers = async (): Promise<User[]> => {
        await delay(400)
        return [...mockUsers]
    }

    const getPortalUserList = async (): Promise<any> => {
        const { authFetch } = useAuthFetch()
        try {
            const response = await authFetch<any>('/api/portal/modules/user/list')
            return response
        } catch (error) {
            console.error('Failed to fetch portal user list:', error)
            throw error
        }
    }

    const getUserById = async (id: number): Promise<User | undefined> => {
        await delay(200)
        return mockUsers.find(u => u.id === id)
    }

    const createUser = async (data: Partial<User>): Promise<User> => {
        await delay(300)
        const newUser: User = {
            id: Date.now(),
            name: data.name || '',
            email: data.email || '',
            phone: data.phone,
            role: data.role || 'Staff',
            modules: data.modules || ['dashboard']
        }
        mockUsers.push(newUser)
        return newUser
    }

    const updateUser = async (id: number, data: Partial<User>): Promise<User | undefined> => {
        await delay(300)
        const index = mockUsers.findIndex(u => u.id === id)
        if (index > -1) {
            mockUsers[index] = { ...mockUsers[index], ...data }
            return mockUsers[index]
        }
        return undefined
    }

    const updateUserModules = async (userId: number, modules: string[]): Promise<boolean> => {
        await delay(300)
        const index = mockUsers.findIndex(u => u.id === userId)
        if (index > -1) {
            mockUsers[index].modules = modules
            return true
        }
        return false
    }

    const deleteUser = async (id: number): Promise<boolean> => {
        await delay(200)
        const index = mockUsers.findIndex(u => u.id === id)
        if (index > -1) {
            mockUsers.splice(index, 1)
            return true
        }
        return false
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
        getPortalUserList
    }
}
