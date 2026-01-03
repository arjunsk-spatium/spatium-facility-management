import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import InsightsPage from '../../app/pages/companies/insights.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Insights Page', () => {
    it('should render dashboard title', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            insights: {
                                totalCompanies: 10,
                                activeCompanies: 8,
                                inactiveCompanies: 2,
                                revenue: 100000
                            },
                            loading: false
                        }
                    }
                })]
            }
        })
        expect(wrapper.text()).toContain('Company Insights')
    })

    it('should display key statistics', async () => {
        const wrapper = await mountSuspended(InsightsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: {
                            insights: {
                                totalCompanies: 50,
                                activeCompanies: 40,
                                inactiveCompanies: 10,
                                revenue: 50000
                            },
                            loading: false
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('50') // Total
        expect(wrapper.text()).toContain('40') // Active
        expect(wrapper.text()).toContain('10') // Inactive
    })
})
