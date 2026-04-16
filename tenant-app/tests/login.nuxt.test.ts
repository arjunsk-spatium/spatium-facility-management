import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Login from '../app/pages/login.vue'
import { createTestingPinia } from '@pinia/testing'
import { useTenantStore } from '../stores/tenant'

// Mock the layout since we only want to test the page content
vi.mock('../layouts/auth.vue', () => ({
    default: {
        template: '<div><slot /></div>'
    }
}))

describe('Login Page', () => {
    it('should render tenant name and logo from store', async () => {
        const wraper = await mountSuspended(Login, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        tenant: {
                            tenant: {
                                id: 'test-tenant',
                                name: 'Test Corp',
                                logoUrl: 'http://example.com/logo.png',
                                colors: { primary: '#000', secondary: '#fff' }
                            }
                        }
                    }
                })]
            }
        })

        // Verify tenant name from store is displayed
        expect(wraper.text()).toContain('Test Corp')
        expect(wraper.text()).toContain('Nice to see you again')
        
        // Verify logo
        const img = wraper.find('img[alt="Test Corp"]')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('http://example.com/logo.png')
    })

    it('should render default branding if store is empty', async () => {
        const wraper = await mountSuspended(Login, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        tenant: {
                            tenant: null
                        }
                    }
                })]
            }
        })
        
        // Should show default Spatium Hub text
        expect(wraper.text()).toContain('Spatium Hub')
    })
})
