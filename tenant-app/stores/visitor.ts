import { defineStore } from 'pinia'
import { useVisitorService, type Visitor, type VisitorStats } from '../composables/visitorService'

export const useVisitorStore = defineStore('visitor', {
    state: () => ({
        visitors: [] as Visitor[],
        stats: null as VisitorStats | null,
        trends: [] as any[],
        loading: false,
        error: null as string | null,
        currentVisitor: null as Visitor | null
    }),
    actions: {
        async fetchVisitors() {
            this.loading = true
            this.error = null
            try {
                const { getVisitors } = useVisitorService()
                this.visitors = await getVisitors()
            } catch (err) {
                this.error = 'Failed to fetch visitors'
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
        async updateStatus(id: string, status: Visitor['status']) {
            this.loading = true
            try {
                const { updateVisitorStatus } = useVisitorService()
                const updated = await updateVisitorStatus(id, status)
                if (updated) {
                    const index = this.visitors.findIndex(v => v.id === id)
                    if (index !== -1) {
                        this.visitors[index] = updated
                    }
                    // Refresh stats after status update
                    await this.fetchStats()
                }
            } catch (err) {
                this.error = 'Failed to update status'
            } finally {
                this.loading = false
            }
        },
        async registerWalkIn(data: any) {
            this.loading = true
            try {
                const { registerWalkIn } = useVisitorService()
                this.currentVisitor = await registerWalkIn(data)
                return this.currentVisitor
            } catch (err) {
                this.error = 'Registration failed'
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
            } catch (err) {
                this.error = 'Verification failed'
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
