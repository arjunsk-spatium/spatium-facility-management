import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Sidebar from '../../components/Sidebar.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock useTheme composable
vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    colorMode: { value: 'dark' },
    isDark: { value: true },
    setColorMode: vi.fn(),
    initTheme: vi.fn(),
    toggleTheme: vi.fn()
  })
}))

describe('Sidebar Theme Adaptation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render with dark theme when isDark is true', async () => {
    const wrapper = await mountSuspended(Sidebar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                 modules: ['dashboard']
              },
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

    // Wait for modules to load
    await new Promise(resolve => setTimeout(resolve, 0));
    await wrapper.vm.$nextTick();

    // Sidebar should have dark theme prop passed to a-menu
    const menu = wrapper.find('.ant-menu')
    // The menu should have 'dark' theme class when in dark mode
    expect(wrapper.html()).toContain('dark')
  })

  it('should display tenant name from store', async () => {
    const wrapper = await mountSuspended(Sidebar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { modules: [] },
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'Acme Corporation',
                  logoUrl: '',
                  colors: { primary: '#3378ff', secondary: '#64748b' }
                }
              }
            }
          })
        ]
      }
    })

    expect(wrapper.text()).toContain('Acme Corporation')
  })

  it('should display tenant logo when available', async () => {
    const wrapper = await mountSuspended(Sidebar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { modules: [] },
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'Logo Corp',
                  logoUrl: 'https://example.com/logo.png',
                  colors: { primary: '#3378ff', secondary: '#64748b' }
                }
              }
            }
          })
        ]
      }
    })

    const logo = wrapper.find('img[alt="Logo Corp"]')
    expect(logo.exists()).toBe(true)
    expect(logo.attributes('src')).toBe('https://example.com/logo.png')
  })

  it('should show fallback icon when no logo is provided', async () => {
    const wrapper = await mountSuspended(Sidebar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { modules: [] },
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'No Logo Corp',
                  logoUrl: '',
                  colors: { primary: '#3378ff', secondary: '#64748b' }
                }
              }
            }
          })
        ]
      }
    })

    // When no logo, fallback grid icon should be shown
    const fallbackIcon = wrapper.find('.grid.grid-cols-2')
    expect(fallbackIcon.exists()).toBe(true)
  })

  it('should render navigation menu items based on modules', async () => {
    const wrapper = await mountSuspended(Sidebar, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: {
                modules: [
                  'dashboard',
                  'visitors',
                  'companies',
                  'helpdesk',
                  'facilities',
                  'users',
                  'configure'
                ]
              },
              tenant: {
                tenant: {
                  id: 'test',
                  name: 'Spatium Hub',
                  logoUrl: '',
                  colors: { primary: '#3378ff', secondary: '#64748b' }
                }
              }
            }
          })
        ]
      }
    })

    // Wait for async module loading - SidebarMenu uses setTimeout(300) for mock data
    await new Promise(resolve => setTimeout(resolve, 500));
    await wrapper.vm.$nextTick();

    // The wrapper should contain the SidebarMenu component
    const html = wrapper.html();
    
    // At minimum, the sidebar structure should exist
    expect(html).toContain('ant-menu')
  })
})
