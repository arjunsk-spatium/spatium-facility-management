import { describe, it, expect } from 'vitest'
import { useModuleRegistry } from './useModuleRegistry'

describe('useModuleRegistry', () => {
  it('should return all modules', () => {
    const { getAllModules } = useModuleRegistry()
    const modules = getAllModules()
    
    expect(modules).toBeDefined()
    expect(modules.length).toBeGreaterThan(0)
    
    // Verify key modules exist
    const keys = modules.map(m => m.key)
    expect(keys).toContain('dashboard')
    expect(keys).toContain('visitors')
    expect(keys).toContain('frontdesk')
  })

  it('should have correct structure for module with children', () => {
    const { getAllModules } = useModuleRegistry()
    const modules = getAllModules()
    
    const visitorsModule = modules.find(m => m.key === 'visitors')
    expect(visitorsModule).toBeDefined()
    expect(visitorsModule?.children).toBeDefined()
    expect(visitorsModule?.children?.length).toBeGreaterThan(0)
    expect(visitorsModule?.icon).toBe('UsergroupAddOutlined')
  })

  it('should have correct structure for module without children', () => {
    const { getAllModules } = useModuleRegistry()
    const modules = getAllModules()
    
    const dashboardModule = modules.find(m => m.key === 'dashboard')
    expect(dashboardModule).toBeDefined()
    expect(dashboardModule?.children).toBeUndefined()
    expect(dashboardModule?.route).toBe('/dashboard')
  })
})
