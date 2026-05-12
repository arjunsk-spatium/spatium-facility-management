import { describe, it, expect, vi, beforeAll } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ConfigurePage from '../../app/pages/configure/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Configuration Page', () => {
    beforeAll(() => {
        if (typeof globalThis.requestAnimationFrame === 'undefined') {
            globalThis.requestAnimationFrame = (cb) => setTimeout(cb, 0) as any;
        }
    })

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

    it('should show only Location and Credit System tabs when no feature modules assigned', async () => {
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
        
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Credit System')
        expect(wrapper.text()).not.toContain('Helpdesk')
        expect(wrapper.text()).not.toContain('Room Meta')
        expect(wrapper.text()).not.toContain('Visitor Management')
    })

    it('should show all tabs when all feature modules are assigned', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { 
                            modules: ['configure', 'helpdesk', 'meeting_rooms', 'visitors'] 
                        }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Helpdesk')
        expect(wrapper.text()).toContain('Room Meta')
        expect(wrapper.text()).toContain('Credit System')
        expect(wrapper.text()).toContain('Visitor Management')
    })

    it('should show Helpdesk tab only when helpdesk module is assigned', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['configure', 'helpdesk'] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Helpdesk')
        expect(wrapper.text()).not.toContain('Room Meta')
        expect(wrapper.text()).not.toContain('Visitor Management')
    })

    it('should show Room Meta tab only when meeting_rooms module is assigned', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['configure', 'meeting_rooms'] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Room Meta')
        expect(wrapper.text()).not.toContain('Helpdesk')
        expect(wrapper.text()).not.toContain('Visitor Management')
    })

    it('should show Visitor Management tab only when visitors module is assigned', async () => {
        const wrapper = await mountSuspended(ConfigurePage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['configure', 'visitors'] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Location')
        expect(wrapper.text()).toContain('Visitor Management')
        expect(wrapper.text()).not.toContain('Helpdesk')
        expect(wrapper.text()).not.toContain('Room Meta')
    })
})
