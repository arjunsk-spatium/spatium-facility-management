import { defineStore } from 'pinia'
import { useVisitorService, type Visitor, type VisitorStats, type VisitorListParams } from '../composables/visitorService'

export type { Visitor, VisitorStats, VisitorListParams }

export const useVisitorStore = defineStore('visitor', {
    state: () => ({
        visitors: [] as Visitor[],
        stats: null as VisitorStats | null,
        trends: [] as any[],
        purposeStats: [] as any[],
        loading: false,
        error: null as string | null,
        currentVisitor: null as Visitor | null,
        count: 0,
        next: null as string | null,
        previous: null as string | null,
    }),
    actions: {
        async fetchVisitors(params: VisitorListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getVisitors } = useVisitorService()
                const result = await getVisitors(params)
                this.visitors = result.visitors
                this.count = result.count
                this.next = result.next
                this.previous = result.previous
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch visitors'
            } finally {
                this.loading = false
            }
        },

        async fetchVisitorsByDateRange(startDate: string, endDate: string, facilityId?: string) {
            this.loading = true
            this.error = null
            try {
                const { getVisitors } = useVisitorService()
                const params: VisitorListParams = {
                    start_date: startDate,
                    end_date: endDate,
                }
                if (facilityId) {
                    params.facility_id = facilityId
                }
                const result = await getVisitors(params)
                this.visitors = result.visitors
                this.count = result.count
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch visitors'
            } finally {
                this.loading = false
            }
        },

        async fetchVisitorsByCompany(companyId: string) {
            this.loading = true
            this.error = null
            try {
                const { getVisitors } = useVisitorService()
                const result = await getVisitors({ company_id: companyId })
                this.visitors = result.visitors
                this.count = result.count
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch visitors'
            } finally {
                this.loading = false
            }
        },

        async fetchVisitorById(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getVisitorById } = useVisitorService()
                this.currentVisitor = await getVisitorById(id)
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch visitor'
            } finally {
                this.loading = false
            }
        },

        async fetchStats() {
            try {
                const { getStats } = useVisitorService()
                this.stats = await getStats()
            } catch (err) {
                console.error('Failed to fetch stats')
            }
        },

        async fetchTrends() {
            try {
                const { getTrends } = useVisitorService()
                this.trends = await getTrends()
            } catch (err) {
                console.error('Failed to fetch trends')
            }
        },

        async fetchPurposeStats() {
            try {
                const { getPurposeStats } = useVisitorService()
                this.purposeStats = (await getPurposeStats()) as any[]
            } catch (err) {
                console.error('Failed to fetch purpose stats')
            }
        },

        async updateStatus(id: string, status: string) {
            this.loading = true
            try {
                const { updateVisitorStatus } = useVisitorService()
                const updated = await updateVisitorStatus(id, status)
                const index = this.visitors.findIndex(v => v.id === id)
                if (index !== -1) {
                    this.visitors[index] = updated
                }
                if (this.currentVisitor?.id === id) {
                    this.currentVisitor = updated
                }
                await this.fetchStats()
            } catch (err: any) {
                this.error = err.message || 'Failed to update status'
                throw err
            } finally {
                this.loading = false
            }
        },

        async registerWalkIn(data: Partial<Visitor>) {
            this.loading = true
            try {
                const { registerWalkIn } = useVisitorService()
                this.currentVisitor = await registerWalkIn(data)
                return this.currentVisitor
            } catch (err: any) {
                this.error = err.message || 'Registration failed'
                throw err
            } finally {
                this.loading = false
            }
        },

        async verifyPasscode(code: string) {
            this.loading = true
            try {
                const { getVisitorByPasscode } = useVisitorService()
                const visitor = await getVisitorByPasscode(code)
                if (visitor) {
                    this.currentVisitor = visitor
                    return visitor
                } else {
                    throw new Error('Invalid Passcode')
                }
            } catch (err: any) {
                this.error = err.message || 'Verification failed'
                throw err
            } finally {
                this.loading = false
            }
        },

        async verifyOtp(phone: string, otp: string) {
            this.loading = true
            try {
                const { verifyOtp } = useVisitorService()
                const verified = await verifyOtp(phone, otp)
                if (!verified) {
                    throw new Error('Invalid OTP')
                }
                return verified
            } catch (err: any) {
                this.error = err.message || 'OTP verification failed'
                throw err
            } finally {
                this.loading = false
            }
        },

        async searchHosts(query: string) {
            const { searchHosts } = useVisitorService()
            return await searchHosts(query)
        },
    },
})
