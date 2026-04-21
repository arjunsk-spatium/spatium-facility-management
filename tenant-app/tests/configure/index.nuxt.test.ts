import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConfigurePage from '../../app/pages/configure/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Configuration Page', () => {
    it('should render configuration page', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['configure'] }
                    }
                })]
            }
        })
        
        // Page title is "Configure" not "Configuration"
        expect(wrapper.text()).toContain('Configure')
    })

    it('should have configuration tabs', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['configure'] }
                    }
                })]
            }
        })
        
        // Check for actual tab sections (Location, Helpdesk, Room Meta, Visitor Management)
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Visitor Management')
    })
})
