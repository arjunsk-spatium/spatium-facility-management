// Tenant Service - Mock data for now
export interface Tenant {
    id: string
    name: string
    domain: string
    adminEmail: string
    planId: string
    planName: string
    status: 'active' | 'trial' | 'suspended' | 'inactive'
    modules: string[]
    createdAt: string
    userCount: number
}

// Mock data
const mockTenants: Tenant[] = [
    {
        id: '1',
        name: 'Acme Corporation',
        domain: 'acme.spatium.app',
        adminEmail: 'admin@acme.com',
        planId: 'pro',
        planName: 'Pro Plan',
        status: 'active',
        modules: ['visitors', 'helpdesk', 'meeting-rooms'],
        createdAt: '2024-01-15',
        userCount: 45
    },
    {
        id: '2',
        name: 'TechStart Inc',
        domain: 'techstart.spatium.app',
        adminEmail: 'admin@techstart.io',
        planId: 'starter',
        planName: 'Starter Plan',
        status: 'trial',
        modules: ['visitors'],
        createdAt: '2024-02-20',
        userCount: 12
    },
    {
        id: '3',
        name: 'Global Enterprises',
        domain: 'global.spatium.app',
        adminEmail: 'admin@global-ent.com',
        planId: 'enterprise',
        planName: 'Enterprise Plan',
        status: 'active',
        modules: ['visitors', 'helpdesk', 'meeting-rooms', 'companies', 'facilities'],
        createdAt: '2023-11-01',
        userCount: 250
    },
    {
        id: '4',
        name: 'Startup Hub',
        domain: 'startuphub.spatium.app',
        adminEmail: 'admin@startuphub.co',
        planId: 'starter',
        planName: 'Starter Plan',
        status: 'suspended',
        modules: ['visitors', 'helpdesk'],
        createdAt: '2024-01-05',
        userCount: 8
    },
    {
        id: '5',
        name: 'Innovation Labs',
        domain: 'innovlabs.spatium.app',
        adminEmail: 'admin@innovlabs.tech',
        planId: 'pro',
        planName: 'Pro Plan',
        status: 'active',
        modules: ['visitors', 'helpdesk', 'meeting-rooms', 'companies'],
        createdAt: '2024-03-10',
        userCount: 78
    }
]

export const useTenantService = () => {
    const getTenants = async (): Promise<Tenant[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500))
        return [...mockTenants]
    }

    const getTenantById = async (id: string): Promise<Tenant | null> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return mockTenants.find(t => t.id === id) || null
    }

    const createTenant = async (data: Omit<Tenant, 'id' | 'createdAt'>): Promise<Tenant> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newTenant: Tenant = {
            ...data,
            id: String(Date.now()),
            createdAt: new Date().toISOString().split('T')[0]
        }
        mockTenants.push(newTenant)
        return newTenant
    }

    const updateTenant = async (id: string, data: Partial<Omit<Tenant, 'id'>>): Promise<Tenant | null> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockTenants.findIndex(t => t.id === id)
        if (index !== -1) {
            mockTenants[index] = { ...mockTenants[index], ...data }
            return mockTenants[index]
        }
        return null
    }

    const deleteTenant = async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        const index = mockTenants.findIndex(t => t.id === id)
        if (index !== -1) {
            mockTenants.splice(index, 1)
            return true
        }
        return false
    }

    const getStats = async () => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return {
            total: mockTenants.length,
            active: mockTenants.filter(t => t.status === 'active').length,
            trial: mockTenants.filter(t => t.status === 'trial').length,
            suspended: mockTenants.filter(t => t.status === 'suspended').length
        }
    }

    return {
        getTenants,
        getTenantById,
        createTenant,
        updateTenant,
        deleteTenant,
        getStats
    }
}
