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
    expect(keys).toContain('banners')
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

  it('should contain User Management submodules (Management Staff and Operational Staff)', () => {
    const { getAllModules } = useModuleRegistry()
    const modules = getAllModules()

    const usersModule = modules.find(m => m.key === 'users')
    expect(usersModule).toBeDefined()
    expect(usersModule?.children).toBeDefined()
    expect(usersModule?.children?.length).toBe(2)
    const childKeys = usersModule?.children?.map(c => c.key)
    expect(childKeys).toContain('users-management')
    expect(childKeys).toContain('users-operational')
  })

  it('should contain Feed submodule matching backend Feed label', () => {
    const { getAllModules } = useModuleRegistry()
    const modules = getAllModules()

    const feedModule = modules.find(m => m.key === 'feed')
    expect(feedModule).toBeDefined()
    expect(feedModule?.children).toBeDefined()
    expect(feedModule?.children?.[0].label).toBe('Feed')
  })
})
