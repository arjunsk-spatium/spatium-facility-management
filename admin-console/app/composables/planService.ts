// Plan Service - Mock data
export interface Plan {
    id: string
    name: string
    description: string
    price: number
    billingCycle: 'monthly' | 'yearly'
    modules: string[]
    maxUsers: number
    features: string[]
    isActive: boolean
}

// Available modules
export const availableModules = [
    { id: 'visitors', name: 'Visitor Management', icon: 'UserOutlined' },
    { id: 'helpdesk', name: 'Helpdesk', icon: 'CustomerServiceOutlined' },
    { id: 'meeting-rooms', name: 'Meeting Rooms', icon: 'CalendarOutlined' },
    { id: 'companies', name: 'Companies', icon: 'BankOutlined' },
    { id: 'facilities', name: 'Facilities', icon: 'HomeOutlined' },
    { id: 'employees', name: 'Employees', icon: 'TeamOutlined' },
    { id: 'assets', name: 'Assets', icon: 'ToolOutlined' },
    { id: 'reports', name: 'Reports', icon: 'BarChartOutlined' }
]

const mockPlans: Plan[] = [
    {
        id: 'starter',
        name: 'Starter Plan',
        description: 'Perfect for small businesses getting started',
        price: 999,
        billingCycle: 'monthly',
        modules: ['visitors'],
        maxUsers: 10,
        features: ['Basic visitor management', 'Email notifications', 'Standard support'],
        isActive: true
    },
    {
        id: 'pro',
        name: 'Pro Plan',
        description: 'For growing businesses with more needs',
        price: 2499,
        billingCycle: 'monthly',
        modules: ['visitors', 'helpdesk', 'meeting-rooms'],
        maxUsers: 50,
        features: ['All Starter features', 'Helpdesk ticketing', 'Meeting room booking', 'Priority support'],
        isActive: true
    },
    {
        id: 'enterprise',
        name: 'Enterprise Plan',
        description: 'Full-featured solution for large organizations',
        price: 4999,
        billingCycle: 'monthly',
        modules: ['visitors', 'helpdesk', 'meeting-rooms', 'companies', 'facilities', 'employees'],
        maxUsers: 500,
        features: ['All Pro features', 'Multi-facility support', 'Custom integrations', 'Dedicated support', 'SLA guarantee'],
        isActive: true
    },
    {
        id: 'custom',
        name: 'Custom Plan',
        description: 'Tailored solution for specific requirements',
        price: 0,
        billingCycle: 'monthly',
        modules: [],
        maxUsers: 0,
        features: ['Custom pricing', 'Custom modules', 'Custom integrations', 'White-label option'],
        isActive: true
    }
]

export const usePlanService = () => {
    const getPlans = async (): Promise<Plan[]> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        return [...mockPlans]
    }

    const getPlanById = async (id: string): Promise<Plan | null> => {
        await new Promise(resolve => setTimeout(resolve, 200))
        return mockPlans.find(p => p.id === id) || null
    }

    const createPlan = async (data: Omit<Plan, 'id'>): Promise<Plan> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newPlan: Plan = {
            ...data,
            id: String(Date.now())
        }
        mockPlans.push(newPlan)
        return newPlan
    }

    const updatePlan = async (id: string, data: Partial<Omit<Plan, 'id'>>): Promise<Plan | null> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockPlans.findIndex(p => p.id === id)
        if (index !== -1) {
            mockPlans[index] = { ...mockPlans[index], ...data } as Plan
            return mockPlans[index]
        }
        return null
    }

    const deletePlan = async (id: string): Promise<boolean> => {
        await new Promise(resolve => setTimeout(resolve, 300))
        const index = mockPlans.findIndex(p => p.id === id)
        if (index !== -1) {
            mockPlans.splice(index, 1)
            return true
        }
        return false
    }

    const getModules = async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return availableModules
    }

    return {
        getPlans,
        getPlanById,
        createPlan,
        updatePlan,
        deletePlan,
        getModules
    }
}
