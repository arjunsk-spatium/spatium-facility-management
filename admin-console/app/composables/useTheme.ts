// Theme composable for managing dark/light mode
export const useTheme = () => {
  const colorMode = useState<'light' | 'dark' | 'system'>('color-mode', () => 'system')
  const isDark = useState<boolean>('is-dark', () => false)

  const getSystemTheme = (): 'light' | 'dark' => {
    if (import.meta.client) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return 'light'
  }

  const applyTheme = (theme: 'light' | 'dark') => {
    if (import.meta.client) {
      const html = document.documentElement
      if (theme === 'dark') {
        html.classList.add('dark')
        isDark.value = true
      } else {
        html.classList.remove('dark')
        isDark.value = false
      }
    }
  }

  const setColorMode = (mode: 'light' | 'dark' | 'system') => {
    colorMode.value = mode
    
    if (import.meta.client) {
      localStorage.setItem('color-mode', mode)
    }

    if (mode === 'system') {
      applyTheme(getSystemTheme())
    } else {
      applyTheme(mode)
    }
  }

  const toggleTheme = () => {
    const modes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']
    const currentIndex = modes.indexOf(colorMode.value)
    const nextIndex = (currentIndex + 1) % modes.length
    setColorMode(modes[nextIndex])
  }

  const initTheme = () => {
    if (import.meta.client) {
      const saved = localStorage.getItem('color-mode') as 'light' | 'dark' | 'system' | null
      const mode = saved || 'system'
      colorMode.value = mode

      if (mode === 'system') {
        applyTheme(getSystemTheme())
        
        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (colorMode.value === 'system') {
            applyTheme(e.matches ? 'dark' : 'light')
          }
        })
      } else {
        applyTheme(mode)
      }
    }
  }

  return {
    colorMode,
    isDark,
    setColorMode,
    toggleTheme,
    initTheme
  }
}
