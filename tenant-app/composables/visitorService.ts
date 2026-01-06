import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

export interface Visitor {
    id: string
    name: string
    email: string
    phone: string
    company: string
    photoUrl?: string
    visitPurpose?: string
    hostName?: string
    status: 'pending' | 'approved' | 'rejected' | 'checked-in' | 'checked-out'
    checkInTime?: string
    checkOutTime?: string
    visitDate: string
}

export interface VisitorStats {
    total: number
    checkedIn: number
    pending: number
    expected: number
}

// Mock Data
const MOCK_VISITORS: Visitor[] = [
    {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+1234567890',
        company: 'Tech Corp',
        visitPurpose: 'Meeting',
        hostName: 'Alice Smith',
        status: 'checked-in',
        checkInTime: dayjs().subtract(2, 'hour').toISOString(),
        visitDate: dayjs().toISOString()
    },
    {
        id: '2',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+0987654321',
        company: 'Biz Solutions',
        visitPurpose: 'Interview',
        hostName: 'Bob Jones',
        status: 'pending',
        visitDate: dayjs().toISOString()
    },
    {
        id: '3',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        phone: '+1122334455',
        company: 'Delivery Inc',
        visitPurpose: 'Delivery',
        hostName: 'Reception',
        status: 'approved',
        visitDate: dayjs().add(1, 'day').toISOString()
    }
]

export const useVisitorService = () => {
    const getVisitors = async (): Promise<Visitor[]> => {
        // Simulate API call
        return new Promise((resolve) => {
            setTimeout(() => resolve([...MOCK_VISITORS]), 500)
        })
    }

    const registerWalkIn = async (data: Partial<Visitor>): Promise<Visitor> => {
        return new Promise((resolve) => {
            const newVisitor: Visitor = {
                id: Math.random().toString(36).substr(2, 9),
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || '',
                company: data.company || '',
                visitPurpose: data.visitPurpose,
                hostName: data.hostName,
                status: 'pending',
                visitDate: dayjs().toISOString(),
                ...data
            } as Visitor
            
            // In a real app, this would be saved to DB
            MOCK_VISITORS.push(newVisitor)
            setTimeout(() => resolve(newVisitor), 800)
        })
    }

    const verifyOtp = async (phone: string, otp: string): Promise<boolean> => {
        // Mock OTP verification
        return new Promise((resolve) => {
            setTimeout(() => resolve(otp === '1234'), 500)
        })
    }

    const getVisitorByPasscode = async (passcode: string): Promise<Visitor | null> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (passcode === '123456') {
                    resolve({
                        id: 'invite-1',
                        name: 'Invited Guest',
                        email: 'guest@invite.com',
                        phone: '+9988776655',
                        company: 'VIP Partners',
                        visitPurpose: 'Site Visit',
                        hostName: 'CEO',
                        status: 'approved',
                        visitDate: dayjs().toISOString()
                    })
                } else {
                    resolve(null)
                }
            }, 600)
        })
    }

    const updateVisitorStatus = async (id: string, status: Visitor['status']): Promise<Visitor | null> => {
        return new Promise((resolve) => {
            const visitor = MOCK_VISITORS.find(v => v.id === id)
            if (visitor) {
                visitor.status = status
                if (status === 'checked-in') visitor.checkInTime = dayjs().toISOString()
                if (status === 'checked-out') visitor.checkOutTime = dayjs().toISOString()
            }
            setTimeout(() => resolve(visitor || null), 400)
        })
    }

    const getStats = async (): Promise<VisitorStats> => {
        return new Promise((resolve) => {
            const stats = {
                total: MOCK_VISITORS.length,
                checkedIn: MOCK_VISITORS.filter(v => v.status === 'checked-in').length,
                pending: MOCK_VISITORS.filter(v => v.status === 'pending').length,
                expected: MOCK_VISITORS.filter(v => v.status === 'approved' || v.status === 'pending').length
            }
            setTimeout(() => resolve(stats), 300)
        })
    }

    const getTrends = async () => {
        return new Promise((resolve) => {
            setTimeout(() => resolve([
                { day: 'Mon', count: 45 },
                { day: 'Tue', count: 52 },
                { day: 'Wed', count: 38 },
                { day: 'Thu', count: 65 },
                { day: 'Fri', count: 48 },
                { day: 'Sat', count: 20 },
                { day: 'Sun', count: 15 },
            ]), 400)
        })
    }

    return {
        getVisitors,
        registerWalkIn,
        verifyOtp,
        getVisitorByPasscode,
        updateVisitorStatus,
        getStats,
        getTrends
    }
}
