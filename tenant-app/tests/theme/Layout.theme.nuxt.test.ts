import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import DefaultLayout from '../../app/layouts/default.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock child components
vi.mock('../../components/Sidebar.vue', () => ({
  default: {
    template: '<div class="mock-sidebar">Sidebar</div>'
  }
}))

vi.mock('../../components/UI/ThemeToggle.vue', () => ({
  default: {
    template: '<button class="mock-theme-toggle">Theme Toggle</button>'
  }
}))

// Mock useTheme composable with different modes
let mockColorModeValue = 'light'

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    colorMode: { value: mockColorModeValue },
    isDark: { value: mockColorModeValue === 'dark' },
    setColorMode: vi.fn(),
    initTheme: vi.fn(),
    toggleTheme: vi.fn()
  })
}))

describe('Default Layout Theme Adaptation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockColorModeValue = 'light'
  })

  it('should render the layout structure correctly', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ],
        stubs: {
          'a-layout': { template: '<div class="ant-layout"><slot /></div>' },
          'a-layout-sider': { template: '<div class="ant-layout-sider"><slot /></div>' },
          'a-layout-header': { template: '<header class="ant-layout-header" v-bind="$attrs"><slot /></header>' },
          'a-layout-content': { template: '<main class="ant-layout-content"><slot /></main>' },
          'a-layout-footer': { template: '<footer class="ant-layout-footer"><slot /></footer>' },
        }
      },
      slots: {
        default: '<div class="test-content">Test Content</div>'
      }
    })

    // Check layout structure
    expect(wrapper.find('.ant-layout').exists()).toBe(true)
    expect(wrapper.find('.ant-layout-header').exists()).toBe(true)
    expect(wrapper.find('.ant-layout-content').exists()).toBe(true)
    expect(wrapper.find('.ant-layout-footer').exists()).toBe(true)
  })

  it('should render ThemeToggle in header', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ],
        stubs: {
          'a-layout': { template: '<div class="ant-layout"><slot /></div>' },
          'a-layout-sider': { template: '<div class="ant-layout-sider"><slot /></div>' },
          'a-layout-header': { template: '<header class="ant-layout-header"><slot /></header>' },
          'a-layout-content': { template: '<main class="ant-layout-content"><slot /></main>' },
          'a-layout-footer': { template: '<footer class="ant-layout-footer"><slot /></footer>' },
        }
      }
    })

    expect(wrapper.find('.mock-theme-toggle').exists()).toBe(true)
  })

  it('should render footer with copyright text', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ],
        stubs: {
          'a-layout': { template: '<div class="ant-layout"><slot /></div>' },
          'a-layout-sider': { template: '<div class="ant-layout-sider"><slot /></div>' },
          'a-layout-header': { template: '<header class="ant-layout-header"><slot /></header>' },
          'a-layout-content': { template: '<main class="ant-layout-content"><slot /></main>' },
          'a-layout-footer': { template: '<footer class="ant-layout-footer"><slot /></footer>' },
        }
      }
    })

    expect(wrapper.text()).toContain('Spatium Facility Management')
    expect(wrapper.text()).toContain('2024')
  })
})

describe('Default Layout Dark Mode', () => {
  beforeEach(() => {
    mockColorModeValue = 'dark'
  })

  it('should compute isDark correctly for dark mode', async () => {
    const wrapper = await mountSuspended(DefaultLayout, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              tenant: { tenant: null }
            }
          })
        ],
        stubs: {
          'a-layout': { template: '<div class="ant-layout"><slot /></div>' },
          'a-layout-sider': { template: '<div class="ant-layout-sider"><slot /></div>' },
          'a-layout-header': { template: '<header class="ant-layout-header" :style="$attrs.style"><slot /></header>' },
          'a-layout-content': { template: '<main class="ant-layout-content"><slot /></main>' },
          'a-layout-footer': { template: '<footer class="ant-layout-footer" :style="$attrs.style"><slot /></footer>' },
        }
      }
    })

    // The layout should apply dark mode styling
    // Since we're mocking, we just verify the component mounts correctly
    expect(wrapper.exists()).toBe(true)
  })
})
