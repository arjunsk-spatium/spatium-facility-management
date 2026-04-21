import { defineStore } from 'pinia'
import { useDashboardService, type DashboardSummaryData } from '../composables/dashboardService'

export const useDashboardStore = defineStore('dashboard', {
    state: () => ({
        summary: null as DashboardSummaryData | null,
        loading: false,
        error: null as string | null,
    }),
    actions: {
        async fetchSummary() {
            this.loading = true
            this.error = null
            try {
                const { getSummary } = useDashboardService()
                this.summary = await getSummary()
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch dashboard summary'
            } finally {
                this.loading = false
            }
        },
    },
})
