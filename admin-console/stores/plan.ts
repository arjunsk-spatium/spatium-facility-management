import { defineStore } from 'pinia'
import { usePlanService, type Plan, availableModules } from '../app/composables/planService'

export const usePlanStore = defineStore('plan', {
    state: () => ({
        plans: [] as Plan[],
        currentPlan: null as Plan | null,
        modules: availableModules,
        loading: false,
        error: null as string | null
    }),
    actions: {
        async fetchPlans() {
            this.loading = true
            this.error = null
            try {
                const { getPlans } = usePlanService()
                this.plans = await getPlans()
            } catch (err) {
                this.error = 'Failed to fetch plans'
            } finally {
                this.loading = false
            }
        },
        async fetchPlan(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getPlanById } = usePlanService()
                this.currentPlan = await getPlanById(id)
            } catch (err) {
                this.error = 'Failed to fetch plan'
            } finally {
                this.loading = false
            }
        },
        async createPlanAction(data: Omit<Plan, 'id'>) {
            this.loading = true
            this.error = null
            try {
                const { createPlan } = usePlanService()
                const newPlan = await createPlan(data)
                this.plans.push(newPlan)
                return newPlan
            } catch (err) {
                this.error = 'Failed to create plan'
                throw err
            } finally {
                this.loading = false
            }
        },
        async updatePlanAction(id: string, data: Partial<Omit<Plan, 'id'>>) {
            this.loading = true
            this.error = null
            try {
                const { updatePlan } = usePlanService()
                const updated = await updatePlan(id, data)
                if (updated) {
                    const index = this.plans.findIndex(p => p.id === id)
                    if (index !== -1) {
                        this.plans[index] = updated
                    }
                }
                return updated
            } catch (err) {
                this.error = 'Failed to update plan'
                throw err
            } finally {
                this.loading = false
            }
        },
        async deletePlanAction(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deletePlan } = usePlanService()
                const success = await deletePlan(id)
                if (success) {
                    this.plans = this.plans.filter(p => p.id !== id)
                }
                return success
            } catch (err) {
                this.error = 'Failed to delete plan'
                throw err
            } finally {
                this.loading = false
            }
        }
    }
})
