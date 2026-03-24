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

export interface PurposeOfVisit {
    id: string
    name: string
    code: string
}

export const useSpocStore = defineStore('spoc', {
    state: () => ({
        visitors: [] as SpocVisitor[],
        employees: [] as SpocEmployee[],
        stats: null as SpocStats | null,
        purposes: [] as PurposeOfVisit[],
        facilities: [] as { id: string; name: string }[],
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

        async fetchVisitors(facilityId?: string) {
            this.loading = true
            this.error = null
            try {
                const { $api } = useNuxtApp()
                
                const query: Record<string, any> = {}
                if (facilityId) {
                    query.facility_id = facilityId
                }
                
                const response = await $api<any>('/api/portal/visitors/client/visitors/by-company/', {
                    method: 'GET',
                    query
                })
                
                if (response.success && response.data) {
                    const results = response.data.results || response.data
                    // Map API response to SpocVisitor format
                    this.visitors = results.map((v: any) => ({
                        id: v.id,
                        name: v.name,
                        phone: v.phone,
                        email: v.email,
                        visitDate: v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : '',
                        visitTime: v.appointment_time || '',
                        purpose: v.purpose_of_visit || '',
                        status: v.status?.toLowerCase() || 'pending',
                        hostName: '',
                        passcode: ''
                    }))
                } else {
                    this.visitors = []
                }
            } catch (err) {
                console.error('Failed to fetch visitors:', err)
                this.error = 'Failed to fetch visitors'
                this.visitors = []
            } finally {
                this.loading = false
            }
        },

        async fetchEmployees(companyId?: string) {
            this.loading = true
            this.error = null
            try {
                const { $api } = useNuxtApp()
                
                const query: Record<string, any> = {}
                if (companyId) {
                    query.company_id = companyId
                }
                
                const response = await $api<any>('/api/portal/users/client_portal/list/', {
                    method: 'GET',
                    query
                })
                
                if (response.success && response.data) {
                    const results = response.data.results || response.data
                    // Map all users with role based on apps array
                    this.employees = results.map((u: any) => ({
                        id: u.id,
                        name: u.full_name || u.email?.split('@')[0] || 'Unknown',
                        email: u.email,
                        phone: u.phone_number,
                        department: '',
                        designation: '',
                        role: u.apps && u.apps.includes('client_portal') ? 'SPOC' : 'Employee'
                    }))
                } else {
                    this.employees = []
                }
            } catch (err) {
                console.error('Failed to fetch employees:', err)
                this.error = 'Failed to fetch employees'
                this.employees = []
            } finally {
                this.loading = false
            }
        },

        async inviteVisitor(data: Partial<SpocVisitor> & { facility_id?: string; purpose_of_visit_id?: string }) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                
                if (data.facility_id && data.purpose_of_visit_id) {
                    // Call the pre-invite API
                    const response = await $api<any>('/api/portal/visitors/client/pre-invite/', {
                        method: 'POST',
                        body: {
                            facility_id: data.facility_id,
                            purpose_of_visit_id: data.purpose_of_visit_id,
                            name: data.name,
                            phone: data.phone,
                            email: data.email,
                            appointment_date: data.visitDate,
                            appointment_time: data.visitTime
                        }
                    })
                    
                    if (response.success && response.data) {
                        const newVisitor: SpocVisitor = {
                            id: response.data.id || Date.now().toString(),
                            name: data.name || '',
                            phone: data.phone || '',
                            email: data.email,
                            visitDate: data.visitDate || new Date().toISOString().split('T')[0],
                            visitTime: data.visitTime,
                            purpose: data.purpose || 'General Visit',
                            status: 'pending',
                            hostName: data.hostName,
                            passcode: response.data.passcode || response.data.code,
                            createdAt: new Date().toISOString()
                        }
                        this.visitors.unshift(newVisitor)
                        return newVisitor
                    } else {
                        throw new Error(response.message || 'Failed to create pre-invite')
                    }
                } else {
                    // Fallback to mock for testing without facility_id
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
                }
            } catch (err: any) {
                this.error = err?.response?.data?.error?.details?.appointment_date?.[0] 
                    || err?.response?.data?.message 
                    || err?.message 
                    || 'Failed to invite visitor'
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchPurposesOfVisit() {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const response = await $api<any>('/api/portal/mobile/hub/purposes-of-visit/', {
                    method: 'GET'
                })
                
                if (response.success && response.data) {
                    this.purposes = response.data
                } else {
                    this.purposes = []
                }
            } catch (err) {
                console.error('Failed to fetch purposes of visit:', err)
                this.purposes = []
            } finally {
                this.loading = false
            }
        },

        async fetchFacilities() {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const response = await $api<any>('/api/portal/facilities/', {
                    method: 'GET',
                    query: { page_size: 100 }
                })
                
                if (response.success && response.data?.results) {
                    this.facilities = response.data.results.map((f: any) => ({
                        id: f.id,
                        name: f.name
                    }))
                } else {
                    this.facilities = []
                }
            } catch (err) {
                console.error('Failed to fetch facilities:', err)
                this.facilities = []
            } finally {
                this.loading = false
            }
        },

        async addEmployee(data: Partial<SpocEmployee> & { companyId?: string }) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                
                const response = await $api<any>('/api/portal/users/client_portal/create/', {
                    method: 'POST',
                    body: {
                        app_name: 'client_portal',
                        full_name: data.name,
                        email: data.email,
                        phone_number: data.phone,
                        company_id: data.companyId
                    }
                })
                
                if (response.success && response.data) {
                    const newEmployee: SpocEmployee = {
                        id: response.data.id || Date.now().toString(),
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone,
                        department: data.department,
                        designation: data.designation,
                        createdAt: new Date().toISOString()
                    }
                    this.employees.push(newEmployee)
                    return newEmployee
                } else {
                    throw new Error(response.message || 'Failed to add employee')
                }
            } catch (err: any) {
                this.error = err?.data?.message || err?.message || 'Failed to add employee'
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
