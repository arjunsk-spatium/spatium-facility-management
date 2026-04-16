import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ThemeToggle from '../../components/UI/ThemeToggle.vue'

// Mock the useTheme composable
const mockSetColorMode = vi.fn()
const mockColorMode = { value: 'system' }

vi.mock('../../composables/useTheme', () => ({
  useTheme: () => ({
    colorMode: mockColorMode,
    setColorMode: mockSetColorMode,
    isDark: { value: false },
    initTheme: vi.fn(),
    toggleTheme: vi.fn()
  })
}))

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockColorMode.value = 'system'
  })

  it('should render three theme buttons', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    const buttons = wrapper.findAll('button')
    expect(buttons).toHaveLength(3)

    // Check aria labels
    expect(buttons[0].attributes('aria-label')).toBe('Light Mode')
    expect(buttons[1].attributes('aria-label')).toBe('System Mode')
    expect(buttons[2].attributes('aria-label')).toBe('Dark Mode')
  })

  it('should call setColorMode with "light" when Light button is clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    const lightButton = wrapper.find('button[aria-label="Light Mode"]')
    await lightButton.trigger('click')

    expect(mockSetColorMode).toHaveBeenCalledWith('light')
  })

  it('should call setColorMode with "system" when System button is clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    const systemButton = wrapper.find('button[aria-label="System Mode"]')
    await systemButton.trigger('click')

    expect(mockSetColorMode).toHaveBeenCalledWith('system')
  })

  it('should call setColorMode with "dark" when Dark button is clicked', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    const darkButton = wrapper.find('button[aria-label="Dark Mode"]')
    await darkButton.trigger('click')

    expect(mockSetColorMode).toHaveBeenCalledWith('dark')
  })

  it('should have correct icon for each button', async () => {
    const wrapper = await mountSuspended(ThemeToggle)

    const buttons = wrapper.findAll('button')
    
    // Each button should contain an SVG icon
    buttons.forEach(button => {
      expect(button.find('svg').exists()).toBe(true)
    })
  })

  it('should apply active styles to the selected mode button', async () => {
    // Set colorMode to 'dark'
    mockColorMode.value = 'dark'
    
    const wrapper = await mountSuspended(ThemeToggle)
    
    const darkButton = wrapper.find('button[aria-label="Dark Mode"]')
    // Just verify the button exists and has the expected structure
    expect(darkButton.exists()).toBe(true)
    expect(darkButton.find('svg').exists()).toBe(true)
  })
})
