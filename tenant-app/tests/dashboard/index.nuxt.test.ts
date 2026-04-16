import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DashboardPage from '../../app/pages/dashboard/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Dashboard Page', () => {
    it('should render dashboard page', async () => {
        const wrapper = await mountSuspended(DashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: { companies: [] },
                        visitor: { stats: null },
                        helpdesk: { tickets: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Dashboard')
    })

    it('should display overview tagline', async () => {
        const wrapper = await mountSuspended(DashboardPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        company: { companies: [] },
                        visitor: { stats: null },
                        helpdesk: { tickets: [] }
                    }
                })]
            }
        })
        
        // Page has "Overview of your facility management modules" 
        expect(wrapper.text()).toContain('Overview')
    })
})
