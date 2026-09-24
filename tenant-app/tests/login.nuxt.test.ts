import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Login from '../app/pages/login.vue'
import { createTestingPinia } from '@pinia/testing'
import { useTenantStore } from '../stores/tenant'
import { useAuthStore } from '../stores/auth'

// Mock the layout since we only want to test the page content
vi.mock('../layouts/auth.vue', () => ({
    default: {
        template: '<div><slot /></div>'
    }
}))

vi.mock('../stores/tenant', () => ({
    useTenantStore: vi.fn(() => ({
        tenant: {
            id: 'test',
            name: 'Test Corp',
            logoUrl: 'http://example.com/logo.png',
            colors: { primary: '#3378ff', secondary: '#64748b' }
        },
        tenantName: 'Test Corp',
        darkLogo: 'http://example.com/logo.png',
        tenantLogo: 'http://example.com/logo.png',
        primaryColor: '#3378ff',
        secondaryColor: '#64748b'
    }))
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

        // Verify tenant name from store is displayed on image alt
        const img = wraper.find('img[alt="Test Corp"]')
        expect(img.exists()).toBe(true)
        expect(wraper.text()).toContain('Nice to see you again')
        expect(img.attributes('src')).toBe('http://example.com/logo.png')
    })

    it('should render default branding if store is empty', async () => {
        // override mock
        vi.mocked(useTenantStore).mockReturnValueOnce({
            tenant: null,
            tenantName: 'Nexspace Hub',
            darkLogo: '',
            tenantLogo: '',
            primaryColor: '#3378ff',
            secondaryColor: '#64748b'
        } as any)

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
        
        // Should show default Nexspace Hub text
        expect(wraper.text()).toContain('Nexspace Hub')
    })

    it('should show a validation message and not request an OTP when email is empty (BUG_01)', async () => {
        const wraper = await mountSuspended(Login, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const authStore = useAuthStore()

        const vm = wraper.vm as any
        vm.form.email = ''
        await vm.handleEmailSubmit()

        expect(vm.errorMsg).toBe('Please enter your email address.')
        expect(authStore.requestOtp).not.toHaveBeenCalled()
        expect(vm.step).toBe('email')
    })

    it('should show a validation message for an invalid email format (BUG_01)', async () => {
        const wraper = await mountSuspended(Login, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })
        const authStore = useAuthStore()

        const vm = wraper.vm as any
        vm.form.email = 'not-an-email'
        await vm.handleEmailSubmit()

        expect(vm.errorMsg).toBe('Please enter a valid email address.')
        expect(authStore.requestOtp).not.toHaveBeenCalled()
    })

    it('should style the Change Email control as a link with a pointer cursor (BUG_02)', async () => {
        const wraper = await mountSuspended(Login, {
            global: {
                plugins: [createTestingPinia({ createSpy: vi.fn })]
            }
        })

        const vm = wraper.vm as any
        vm.step = 'otp'
        await wraper.vm.$nextTick()

        const button = wraper.findAll('button').find(b => b.text().includes('Change Email'))
        expect(button).toBeDefined()
        expect(button!.attributes('class')).toContain('cursor-pointer')
    })
})
