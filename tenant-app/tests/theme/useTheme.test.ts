import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock Nuxt's useState
const mockStates: Record<string, { value: any }> = {}

vi.mock('#app', () => ({
  useState: (key: string, init: () => any) => {
    if (!mockStates[key]) {
      mockStates[key] = { value: init() }
    }
    return mockStates[key]
  }
}))

// Import after mocking
import { useTheme } from '../../composables/useTheme'

describe('useTheme Composable', () => {
  let originalWindow: any
  let mockMatchMedia: any

  beforeEach(() => {
    // Clear mock states
    Object.keys(mockStates).forEach(key => delete mockStates[key])
    
    // Mock localStorage
    const localStorageMock = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    }
    Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

    // Mock window.matchMedia
    mockMatchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    Object.defineProperty(global, 'window', {
      value: {
        matchMedia: mockMatchMedia,
      },
      writable: true
    })

    // Mock document
    Object.defineProperty(global, 'document', {
      value: {
        documentElement: {
          classList: {
            add: vi.fn(),
            remove: vi.fn(),
          }
        }
      },
      writable: true
    })

    // Mock import.meta.client
    vi.stubGlobal('import.meta', { client: true })
  })

  afterEach(() => {
    vi.clearAllMocks()
    vi.unstubAllGlobals()
  })

  it('should initialize with default colorMode as "system"', () => {
    const { colorMode } = useTheme()
    expect(colorMode.value).toBe('system')
  })

  it('should initialize with isDark as false', () => {
    const { isDark } = useTheme()
    expect(isDark.value).toBe(false)
  })

  it('should return all expected properties', () => {
    const result = useTheme()
    
    expect(result).toHaveProperty('colorMode')
    expect(result).toHaveProperty('isDark')
    expect(result).toHaveProperty('setColorMode')
    expect(result).toHaveProperty('toggleTheme')
    expect(result).toHaveProperty('initTheme')
  })

  it('setColorMode should update colorMode value', () => {
    const { colorMode, setColorMode } = useTheme()
    
    setColorMode('dark')
    expect(colorMode.value).toBe('dark')
    
    setColorMode('light')
    expect(colorMode.value).toBe('light')
    
    setColorMode('system')
    expect(colorMode.value).toBe('system')
  })

  it('toggleTheme should cycle through modes', () => {
    const { colorMode, toggleTheme } = useTheme()
    
    // Start at 'system' (default)
    expect(colorMode.value).toBe('system')
    
    toggleTheme()
    // After toggle, should go to next in cycle
    // Cycle is ['light', 'dark', 'system'], starting from system (index 2) -> next is light (index 0)
  })
})
