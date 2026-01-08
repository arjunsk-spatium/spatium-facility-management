import { defineStore } from 'pinia'

// Types for SPOC module
export interface SpocVisitor {
    id: string
    name: string
    phone: string
    email?: string
    company?: string
    visitDate: string
    visitTime?: string
    purpose: string
    status: 'pending' | 'approved' | 'checked_in' | 'checked_out' | 'rejected'
    hostName?: string
    passcode?: string
    createdAt?: string
}

export interface SpocEmployee {
    id: string
    name: string
    email: string
    phone?: string
    department?: string
    designation?: string
    avatar?: string
    createdAt?: string
}

export interface SpocStats {
    totalVisitors: number
    pendingApprovals: number
    checkedInToday: number
    totalEmployees: number
}

export const useSpocStore = defineStore('spoc', {
    state: () => ({
        visitors: [] as SpocVisitor[],
        employees: [] as SpocEmployee[],
        stats: null as SpocStats | null,
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchStats() {
            this.loading = true
            try {
                // Mock stats - replace with API call
                await new Promise(resolve => setTimeout(resolve, 300))
                this.stats = {
                    totalVisitors: 156,
                    pendingApprovals: 5,
                    checkedInToday: 12,
                    totalEmployees: 24
                }
            } catch (err) {
                this.error = 'Failed to fetch stats'
            } finally {
                this.loading = false
            }
        },

        async fetchVisitors() {
            this.loading = true
            this.error = null
            try {
                // Mock data - replace with API call
                await new Promise(resolve => setTimeout(resolve, 400))
                this.visitors = [
                    {
                        id: '1',
                        name: 'Rahul Sharma',
                        phone: '+91 98765 43210',
                        email: 'rahul@example.com',
                        visitDate: '2026-01-07',
                        visitTime: '10:00 AM',
                        purpose: 'Business Meeting',
                        status: 'checked_in',
                        hostName: 'John Doe',
                        passcode: '123456'
                    },
                    {
                        id: '2',
                        name: 'Priya Patel',
                        phone: '+91 87654 32109',
                        email: 'priya@example.com',
                        visitDate: '2026-01-07',
                        visitTime: '11:30 AM',
                        purpose: 'Interview',
                        status: 'pending',
                        hostName: 'Jane Smith'
                    },
                    {
                        id: '3',
                        name: 'Amit Kumar',
                        phone: '+91 76543 21098',
                        visitDate: '2026-01-07',
                        visitTime: '02:00 PM',
                        purpose: 'Delivery',
                        status: 'approved',
                        hostName: 'Bob Wilson',
                        passcode: '654321'
                    }
                ]
            } catch (err) {
                this.error = 'Failed to fetch visitors'
            } finally {
                this.loading = false
            }
        },

        async fetchEmployees() {
            this.loading = true
            this.error = null
            try {
                // Mock data - replace with API call
                await new Promise(resolve => setTimeout(resolve, 400))
                this.employees = [
                    {
                        id: '1',
                        name: 'John Doe',
                        email: 'john.doe@company.com',
                        phone: '+91 98765 43210',
                        department: 'Engineering',
                        designation: 'Senior Developer'
                    },
                    {
                        id: '2',
                        name: 'Jane Smith',
                        email: 'jane.smith@company.com',
                        phone: '+91 87654 32109',
                        department: 'HR',
                        designation: 'HR Manager'
                    },
                    {
                        id: '3',
                        name: 'Bob Wilson',
                        email: 'bob.wilson@company.com',
                        phone: '+91 76543 21098',
                        department: 'Sales',
                        designation: 'Sales Executive'
                    }
                ]
            } catch (err) {
                this.error = 'Failed to fetch employees'
            } finally {
                this.loading = false
            }
        },

        async inviteVisitor(data: Partial<SpocVisitor>) {
            this.loading = true
            try {
                // Mock API call - backend handles email/SMS
                await new Promise(resolve => setTimeout(resolve, 500))
                const newVisitor: SpocVisitor = {
                    id: Date.now().toString(),
                    name: data.name || '',
                    phone: data.phone || '',
                    email: data.email,
                    visitDate: data.visitDate || new Date().toISOString().split('T')[0],
                    visitTime: data.visitTime,
                    purpose: data.purpose || 'General Visit',
                    status: 'pending',
                    hostName: data.hostName,
                    passcode: Math.floor(100000 + Math.random() * 900000).toString(),
                    createdAt: new Date().toISOString()
                }
                this.visitors.unshift(newVisitor)
                return newVisitor
            } catch (err) {
                this.error = 'Failed to invite visitor'
                throw err
            } finally {
                this.loading = false
            }
        },

        async addEmployee(data: Partial<SpocEmployee>) {
            this.loading = true
            try {
                await new Promise(resolve => setTimeout(resolve, 300))
                const newEmployee: SpocEmployee = {
                    id: Date.now().toString(),
                    name: data.name || '',
                    email: data.email || '',
                    phone: data.phone,
                    department: data.department,
                    designation: data.designation,
                    createdAt: new Date().toISOString()
                }
                this.employees.push(newEmployee)
                return newEmployee
            } catch (err) {
                this.error = 'Failed to add employee'
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteEmployee(id: string) {
            this.loading = true
            try {
                await new Promise(resolve => setTimeout(resolve, 200))
                const index = this.employees.findIndex(e => e.id === id)
                if (index > -1) {
                    this.employees.splice(index, 1)
                    return true
                }
                return false
            } catch (err) {
                this.error = 'Failed to delete employee'
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateEmployee(id: string, data: Partial<SpocEmployee>) {
            this.loading = true
            try {
                await new Promise(resolve => setTimeout(resolve, 300))
                const index = this.employees.findIndex(e => e.id === id)
                if (index > -1) {
                    this.employees[index] = { ...this.employees[index], ...data }
                    return this.employees[index]
                }
                throw new Error('Employee not found')
            } catch (err) {
                this.error = 'Failed to update employee'
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
