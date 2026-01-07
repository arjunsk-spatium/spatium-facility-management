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

export interface ModuleChild {
    key: string
    label: string
    route: string
}

export interface Module {
    key: string
    label: string
    icon?: string
    route?: string
    children?: ModuleChild[]
}

export const useUserService = () => {
    // Simulate API delay
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

    // Available modules for the tenant - this would come from API in production
    const tenantModules: Module[] = [
        { key: 'dashboard', label: 'Dashboard', icon: 'BarChartOutlined', route: '/dashboard' },
        {
            key: 'visitors',
            label: 'Visitors',
            icon: 'UsergroupAddOutlined',
            children: [
                { key: 'visitors-insights', label: 'Insights', route: '/visitors/insights' },
                { key: 'visitors-list', label: 'All Visitors', route: '/visitors' }
            ]
        },
        {
            key: 'companies',
            label: 'Companies',
            icon: 'BankOutlined',
            children: [
                { key: 'companies-insights', label: 'Insights', route: '/companies/insights' },
                { key: 'companies-list', label: 'All Companies', route: '/companies' }
            ]
        },
        {
            key: 'helpdesk',
            label: 'Helpdesk',
            icon: 'CustomerServiceOutlined',
            children: [
                { key: 'helpdesk-insights', label: 'Insights', route: '/helpdesk/insights' },
                { key: 'helpdesk-tickets', label: 'Tickets', route: '/helpdesk' }
            ]
        },
        {
            key: 'facilities',
            label: 'Facilities',
            icon: 'HomeOutlined',
            children: [
                { key: 'facilities-insights', label: 'Insights', route: '/facilities/insights' },
                { key: 'facilities-list', label: 'All Facilities', route: '/facilities' }
            ]
        },
        {
            key: 'meeting_rooms',
            label: 'Meeting Rooms',
            icon: 'CalendarOutlined',
            children: [
                { key: 'meeting-rooms-insights', label: 'Insights', route: '/meeting-rooms/insights' },
                { key: 'meeting-rooms-list', label: 'All Rooms', route: '/meeting-rooms' },
                { key: 'meeting-rooms-bookings', label: 'Bookings', route: '/meeting-rooms/bookings' }
            ]
        },
        { key: 'users', label: 'User Management', icon: 'TeamOutlined', route: '/users' },
        { key: 'configure', label: 'Configure', icon: 'SettingOutlined', route: '/configure' },
        // SPOC Modules - for company SPOCs
        { key: 'spoc_dashboard', label: 'Company Dashboard', icon: 'DashboardOutlined', route: '/spoc' },
        {
            key: 'spoc_visitors',
            label: 'Visitors',
            icon: 'UsergroupAddOutlined',
            children: [
                { key: 'spoc-visitors-insights', label: 'Insights', route: '/spoc/visitors/insights' },
                { key: 'spoc-visitors-list', label: 'Visitor List', route: '/spoc/visitors' },
                { key: 'spoc-visitors-invite', label: 'Invite Visitor', route: '/spoc/visitors/invite' }
            ]
        },
        { key: 'spoc_employees', label: 'Employees', icon: 'TeamOutlined', route: '/spoc/employees' }
    ]

    // Mock users data
    const mockUsers: User[] = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+91 98765 43210',
            role: 'Admin',
            modules: ['dashboard', 'companies', 'visitors', 'facilities', 'helpdesk', 'meeting_rooms', 'configure', 'users', 'spoc_dashboard', 'spoc_visitors', 'spoc_employees']
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
        deleteUser
    }
}
