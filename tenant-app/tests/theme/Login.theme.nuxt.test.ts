import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Login from '../../app/pages/login.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock the auth layout
vi.mock('../../app/layouts/auth.vue', () => ({
  default: {
    template: '<div class="auth-layout"><slot /></div>'
  }
}))

// Mock useTheme composable with configurable mode
let mockColorModeValue = 'light'
let mockInitized = false

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    colorMode: { value: mockColorModeValue },
    isDark: { value: mockColorModeValue === 'dark' },
    setColorMode: vi.fn((mode) => { mockColorModeValue = mode }),
    initTheme: vi.fn(() => { mockInitized = true }),
    toggleTheme: vi.fn()
  })
}))

describe('Login Page Theme Adaptation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockColorModeValue = 'light'
    mockInitized = false
  })

  it('should render login form', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'Test Corp',
                  logoUrl: '',
                  colors: { primary: '#3378ff', secondary: '#64748b' }
                }
              }
            }
          })
        ]
      }
    })

    // Check for form elements
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('input[type="password"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('should display tenant branding', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'Acme Inc',
                  logoUrl: 'https://example.com/logo.png',
                  colors: { primary: '#ff0000', secondary: '#00ff00' }
                }
              }
            }
          })
        ]
      }
    })

    expect(wrapper.text()).toContain('Acme Inc')
  })

  it('should have dark mode classes on container', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ]
      }
    })

    // The login page should have dark mode utility classes
    const html = wrapper.html()
    expect(html).toContain('dark:bg-neutral')
    expect(html).toContain('dark:text-')
  })

  it('should render inspirational quote section on desktop', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ]
      }
    })

    // Quote section should exist (hidden on mobile)
    expect(wrapper.text()).toContain('Daily Inspiration')
  })

  it('should show default branding when no tenant', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ]
      }
    })

    expect(wrapper.text()).toContain('Spatium Hub')
  })

  it('should have email and password inputs with proper labels', async () => {
    const wrapper = await mountSuspended(Login, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ]
      }
    })

    const emailLabel = wrapper.find('label[for="email"]')
    const passwordLabel = wrapper.find('label[for="password"]')

    expect(emailLabel.exists()).toBe(true)
    expect(passwordLabel.exists()).toBe(true)
    expect(emailLabel.text()).toContain('Email')
    expect(passwordLabel.text()).toContain('Password')
  })
})
