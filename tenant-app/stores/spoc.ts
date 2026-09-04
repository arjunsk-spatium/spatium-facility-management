import { defineStore } from 'pinia'

// Types for SPOC module
export interface SpocVisitor {
    id: string
    name: string
    phone_number: string
    email?: string | null
    from_company?: string | null
    visitDate: string
    visitTime?: string | null
    purpose: string
    purpose_of_visit: string
    status: 'Pending' | 'Approved' | 'Rejected'
    facility_name: string
    facility_id: string
    company_name: string | null
    hostName?: string
    passcode?: string
    created_at: string
    image_url?: string | null
    appointment_time?: string | null
    check_in_time?: string | null
    check_out_time?: string | null
    is_on_premises: boolean
    visitor_type?: 'walk_in' | 'pre_invite'
}

export interface SpocEmployee {
    id: string
    name: string
    email: string
    phone?: string
    department?: string
    department_id?: string
    designation?: string
    role?: 'SPOC' | 'Employee'
    status?: string
    avatar?: string
    createdAt?: string
    buildingPassEnabled?: boolean
}

export interface SpocStats {
    totalVisitors: number
    pendingApprovals: number
    checkedInToday: number
    totalEmployees: number
}

export interface SpocVisitorInsightsSummary {
    total_visitors: number
    checked_in: number
    checked_out: number
    pending: number
    expected: number
}

export interface SpocVisitorInsightsStats {
    total_visitors: number
    completed_visits: number
    walk_in: number
    pre_invite: number
    this_month: number
    checked_in?: number
    checked_out?: number
    pending?: number
    expected?: number
}

export interface SpocVisitorInsightsTrafficItem {
    date: string
    count: number
}

export interface SpocVisitorInsightsHourlyItem {
    hour: string
    count: number
}

export interface SpocVisitorInsightsPurpose {
    purpose: string
    count: number
    percentage: number
}

export interface SpocVisitorInsightsTopCompany {
    company_id: string
    name: string
    count: number
}

export interface SpocVisitorInsightsData {
    filters?: { start_date: string; end_date: string }
    date_range?: { start_date: string; end_date: string }
    stats: SpocVisitorInsightsStats
    summary: SpocVisitorInsightsSummary
    visit_purpose_breakdown: SpocVisitorInsightsPurpose[]
    visit_purposes: SpocVisitorInsightsPurpose[]
    traffic?: SpocVisitorInsightsTrafficItem[]
    today_hourly_traffic?: SpocVisitorInsightsHourlyItem[]
    top_visiting_companies?: SpocVisitorInsightsTopCompany[]
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
        employeeCount: 0,
        employeePage: 1,
        employeePageSize: 10,
        stats: null as SpocStats | null,
        dashboardData: null as any,
        insights: null as SpocVisitorInsightsData | null,
        insightsLoading: false,
        insightsError: null as string | null,
        purposes: [] as PurposeOfVisit[],
        facilities: [] as { id: string; name: string; companyId?: string }[],
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchStats(facilityId?: string) {
            this.loading = true
            this.error = null
            try {
                const { $api } = useNuxtApp()
                const query: Record<string, any> = {}
                if (facilityId) {
                    query.facility_id = facilityId
                }
                const response = await $api<any>('/api/portal/visitors/client/dashboard/', {
                    method: 'GET',
                    query
                })
                const data = response?.data ?? response
                this.dashboardData = data
                this.stats = {
                    totalVisitors: Number(data?.total_visitors ?? data?.totalVisitors ?? data?.visitors ?? data?.total ?? 0),
                    pendingApprovals: Number(data?.pending_approvals ?? data?.pendingApprovals ?? data?.pending ?? 0),
                    checkedInToday: Number(data?.checked_in_today ?? data?.checkedInToday ?? data?.checked_in ?? 0),
                    totalEmployees: Number(data?.total_employees ?? data?.totalEmployees ?? data?.employees ?? 0)
                }
                return this.stats
            } catch (err: any) {
                console.error('Failed to fetch stats:', err)
                this.error = err?.message || 'Failed to fetch stats'
                return null
            } finally {
                this.loading = false
            }
        },

        async fetchDashboard(facilityId?: string) {
            return await this.fetchStats(facilityId)
        },

        async fetchInsights(startDate?: string, endDate?: string) {
            this.insightsLoading = true
            this.insightsError = null
            try {
                const { $api } = useNuxtApp()
                const query: Record<string, any> = {}
                if (startDate) query.start_date = startDate
                if (endDate) query.end_date = endDate

                const response = await $api<any>('/api/portal/visitors/client/insights/', {
                    method: 'GET',
                    query
                })

                const data = response?.data ?? response
                const statsRaw = data?.stats ?? data?.summary ?? data

                const totalVisitors = Number(statsRaw?.total_visitors ?? statsRaw?.totalVisitors ?? statsRaw?.total ?? 0)
                const completedVisits = Number(statsRaw?.completed_visits ?? statsRaw?.completedVisits ?? statsRaw?.checked_out ?? statsRaw?.checkedOut ?? 0)
                const walkIn = Number(statsRaw?.walk_in ?? statsRaw?.walkIn ?? 0)
                const preInvite = Number(statsRaw?.pre_invite ?? statsRaw?.preInvite ?? 0)
                const thisMonth = Number(statsRaw?.this_month ?? statsRaw?.thisMonth ?? 0)
                const checkedIn = Number(statsRaw?.checked_in ?? statsRaw?.checkedIn ?? walkIn)
                const pending = Number(statsRaw?.pending ?? preInvite)
                const expected = Number(statsRaw?.expected ?? preInvite)

                const rawPurposes = Array.isArray(data?.visit_purpose_breakdown)
                    ? data.visit_purpose_breakdown
                    : (Array.isArray(data?.visit_purposes) ? data.visit_purposes : (Array.isArray(data?.purposes) ? data.purposes : []))

                const totalPurposeCount = rawPurposes.reduce((acc: number, p: any) => acc + (Number(p.count) || 0), 0) || totalVisitors || 1

                const mappedPurposes: SpocVisitorInsightsPurpose[] = rawPurposes.map((p: any) => {
                    const count = Number(p.count) || 0
                    const percentage = p.percentage !== undefined
                        ? Number(p.percentage)
                        : Math.round((count / totalPurposeCount) * 100)
                    return {
                        purpose: p.purpose || p.name || 'Other',
                        count,
                        percentage
                    }
                })

                const filterRange = data?.filters ?? data?.date_range ?? { start_date: startDate || '', end_date: endDate || '' }

                this.insights = {
                    filters: filterRange,
                    date_range: filterRange,
                    stats: {
                        total_visitors: totalVisitors,
                        completed_visits: completedVisits,
                        walk_in: walkIn,
                        pre_invite: preInvite,
                        this_month: thisMonth,
                        checked_in: checkedIn,
                        checked_out: completedVisits,
                        pending,
                        expected
                    },
                    summary: {
                        total_visitors: totalVisitors,
                        checked_in: checkedIn,
                        checked_out: completedVisits,
                        pending,
                        expected
                    },
                    visit_purpose_breakdown: mappedPurposes,
                    visit_purposes: mappedPurposes,
                    traffic: Array.isArray(data?.traffic) ? data.traffic : (Array.isArray(data?.trends) ? data.trends : []),
                    today_hourly_traffic: Array.isArray(data?.today_hourly_traffic) ? data.today_hourly_traffic : (Array.isArray(data?.hourly_traffic) ? data.hourly_traffic : []),
                    top_visiting_companies: Array.isArray(data?.top_visiting_companies) ? data.top_visiting_companies : []
                }
                return this.insights
            } catch (err: any) {
                console.error('Failed to fetch insights:', err)
                this.insightsError = err?.message || 'Failed to fetch visitor insights'
                throw err
            } finally {
                this.insightsLoading = false
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
                        phone_number: v.phone_number || v.phone || '',
                        email: v.email,
                        from_company: v.from_company,
                        visitDate: v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : '',
                        visitTime: v.appointment_time || '',
                        purpose: v.purpose_of_visit || '',
                        purpose_of_visit: v.purpose_of_visit || '',
                        status: v.status || 'Pending',
                        facility_name: v.facility_name || '',
                        facility_id: v.facility_id || '',
                        company_name: v.company_name,
                        hostName: v.created_by_id ? 'Host' : '',
                        passcode: v.visitor_pass_url ? 'Generated' : '',
                        created_at: v.created_at,
                        image_url: v.image_url,
                        appointment_time: v.appointment_time,
                        check_in_time: v.check_in_time,
                        check_out_time: v.check_out_time,
                        is_on_premises: v.is_on_premises || false,
                        visitor_type: v.visitor_type || 'pre_invite'
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

        async fetchEmployees(params: { companyId?: string; search?: string; page?: number; page_size?: number } = {}) {
            this.loading = true
            this.error = null
            try {
                const { $api } = useNuxtApp()

                const query: Record<string, any> = {}
                if (params.companyId) {
                    query.company_id = params.companyId
                }
                if (params.search) {
                    query.search = params.search
                }
                if (params.page) {
                    query.page = params.page
                }
                if (params.page_size) {
                    query.page_size = params.page_size
                }

                const response = await $api<any>('/api/portal/users/client_portal/list/', {
                    method: 'GET',
                    query
                })

                if (response.success && response.data) {
                    const results = response.data.results || response.data
                    this.employeeCount = response.data.count || results.length
                    // Map all users with role based on apps array
                    this.employees = results.map((u: any) => ({
                        id: u.id,
                        name: u.full_name || u.email?.split('@')[0] || 'Unknown',
                        email: u.email,
                        phone: u.phone_number,
                        department: u.department_name || u.department || '',
                        department_id: u.department_id || '',
                        designation: u.designation || '',
                        status: u.status || 'active',
                        buildingPassEnabled: u.building_pass_enabled || false,
                        role: u.apps && u.apps.some((app: string) => app.toLowerCase().replace(/\s/g, '_') === 'client_portal')
                            ? 'SPOC'
                            : 'Employee'
                    }))
                } else {
                    this.employees = []
                    this.employeeCount = 0
                }
            } catch (err) {
                console.error('Failed to fetch employees:', err)
                this.error = 'Failed to fetch employees'
                this.employees = []
                this.employeeCount = 0
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
                            from_company: data.from_company,
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
                const response = await $api<any>('/api/portal/companies/my-facilities/', {
                    method: 'GET',
                    query: { page_size: 100 }
                })
                
                if (response.success && response.data?.results) {
                    this.facilities = response.data.results.map((f: any) => ({
                        id: f.facility_id || f.id,
                        name: f.facility_name || f.name,
                        companyId: f.company || f.company_id
                    }))
                } else if (response.success && Array.isArray(response.data)) {
                    this.facilities = response.data.map((f: any) => ({
                        id: f.facility_id || f.id,
                        name: f.facility_name || f.name,
                        companyId: f.company || f.company_id
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

        async addEmployee(data: Partial<SpocEmployee> & { companyId?: string; role?: 'Employee' | 'SPOC' }) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()
                const authStore = useAuthStore()

                const appName = data.role === 'SPOC' ? 'client_portal' : 'hub'

                const response = await $api<any>('/api/portal/users/client_portal/create/', {
                    method: 'POST',
                    body: {
                        app_name: appName,
                        full_name: data.name,
                        email: data.email,
                        phone_number: data.phone,
                        company_id: data.companyId || authStore.user?.company_id,
                        designation: data.designation,
                        department_id: data.department_id
                    }
                })

                if (response.success && response.data) {
                    const newEmployee: SpocEmployee = {
                        id: response.data.id || Date.now().toString(),
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone,
                        department: data.department,
                        department_id: data.department_id,
                        designation: data.designation,
                        role: data.role || 'Employee',
                        status: 'active',
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
                const { $api } = useNuxtApp()

                await $api<any>(`/api/portal/users/client_portal/${id}/delete/`, {
                    method: 'DELETE'
                })

                const index = this.employees.findIndex(e => e.id === id)
                if (index > -1) {
                    this.employees.splice(index, 1)
                }

                return true
            } catch (err: any) {
                this.error = err?.data?.message || err?.message || 'Failed to delete employee'
                throw err
            } finally {
                this.loading = false
            }
        },

        async bulkUploadEmployees(file: File) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()

                const formData = new FormData()
                formData.append('file', file)

                const response = await $api<any>('/api/portal/users/client_portal/bulk-upload/', {
                    method: 'POST',
                    body: formData
                })

                return response
            } catch (err: any) {
                this.error = err?.data?.message || err?.message || 'Failed to bulk upload employees'
                throw err
            } finally {
                this.loading = false
            }
        },

        async fetchBulkUploadJobs(params: { page?: number; page_size?: number } = {}) {
            try {
                const { $api } = useNuxtApp()

                const query: Record<string, any> = {
                    page: params.page || 1,
                    page_size: params.page_size || 10
                }

                const response = await $api<any>('/api/portal/users/client_portal/bulk-upload/jobs/', {
                    method: 'GET',
                    query
                })

                if (response.success && response.data) {
                    return {
                        results: response.data.results || [],
                        count: response.data.count || 0
                    }
                }
                return { results: [], count: 0 }
            } catch (err: any) {
                console.error('Failed to fetch bulk upload jobs:', err)
                return { results: [], count: 0 }
            }
        },

        async updateEmployee(id: string, data: Partial<SpocEmployee> & { role?: 'Employee' | 'SPOC' }) {
            this.loading = true
            try {
                const { $api } = useNuxtApp()

                const body: Record<string, any> = {
                    full_name: data.name,
                    email: data.email,
                    phone_number: data.phone,
                    designation: data.designation,
                    department_id: data.department_id
                }

                if (typeof data.buildingPassEnabled === 'boolean') {
                    body.building_pass_enabled = data.buildingPassEnabled
                } else if (data.role) {
                    body.app_name = data.role === 'SPOC' ? 'client_portal' : 'hub'
                }

                const response = await $api<any>(`/api/portal/users/client_portal/${id}/update/`, {
                    method: 'PATCH',
                    body
                })

                if (response.success && response.data) {
                    const index = this.employees.findIndex(e => e.id === id)
                    if (index > -1) {
                        this.employees[index] = { ...this.employees[index], ...data }
                        return this.employees[index]
                    }
                }
                throw new Error(response.message || 'Failed to update employee')
            } catch (err: any) {
                this.error = err?.data?.message || err?.message || 'Failed to update employee'
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
