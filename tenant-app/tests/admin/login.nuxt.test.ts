import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Login from '../../app/pages/admin/login.vue'
import { createTestingPinia } from '@pinia/testing'
import { useTenantStore } from '../../stores/tenant'

vi.mock('../../stores/tenant', () => ({
    useTenantStore: vi.fn(() => ({
        tenant: {
            id: 'test-tenant',
            name: 'Test Corp',
            logoUrl: 'http://example.com/logo.png',
            colors: { primary: '#000', secondary: '#fff' }
        },
        tenantName: 'Test Corp',
        tenantLogo: 'http://example.com/logo.png',
        darkLogo: 'http://example.com/logo.png',
        primaryColor: '#000',
        secondaryColor: '#fff'
    }))
}))

// Mock the layout since we only want to test the page content
vi.mock('../../layouts/auth.vue', () => ({
    default: {
        template: '<div><slot /></div>'
    }
}))

describe('Admin Login Page', () => {
    it('should render tenant name and Admin Access text', async () => {
        const wraper = await mountSuspended(Login)

        // Verify logo and alt text
        const img = wraper.find('img[alt="Test Corp"]')
        expect(img.exists()).toBe(true)
        expect(wraper.text()).toContain('Admin Access')
        expect(img.attributes('src')).toBe('http://example.com/logo.png')
    })

    it('should render default branding if store is empty', async () => {
        vi.mocked(useTenantStore).mockReturnValueOnce({
            tenant: null,
            tenantName: 'Spatium Hub',
            tenantLogo: '',
            darkLogo: '',
            primaryColor: '#3378ff',
            secondaryColor: '#64748b'
        } as any)

        const wraper = await mountSuspended(Login)
        
        // Should show default Spatium Hub text
        expect(wraper.text()).toContain('Spatium Hub')
        expect(wraper.text()).toContain('Admin Access')
    })
})
