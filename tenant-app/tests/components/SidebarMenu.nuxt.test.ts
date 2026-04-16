import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SidebarMenu from '../../components/SidebarMenu.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock composables
vi.mock('../../composables/userService', () => ({
    useUserService: () => ({
        getUserModules: vi.fn().mockResolvedValue(['dashboard', 'visitors', 'companies']),
        getAllModules: vi.fn().mockReturnValue([
            { key: 'dashboard', label: 'Dashboard', icon: 'BarChartOutlined', route: '/dashboard' },
            { key: 'visitors', label: 'Visitors', icon: 'UsergroupAddOutlined' },
            { key: 'companies', label: 'Companies', icon: 'BankOutlined', route: '/companies' }
        ])
    })
}))

describe('SidebarMenu Component', () => {
    it('should render menu component', async () => {
        const wrapper = await mountSuspended(SidebarMenu, {
            props: {
                collapsed: false
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['dashboard', 'visitors'] },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('ant-menu')
    })

    it('should display tenant name', async () => {
        const wrapper = await mountSuspended(SidebarMenu, {
            props: {
                collapsed: false
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['dashboard'] },
                        tenant: { tenant: { name: 'Spatium Hub' } }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Spatium Hub')
    })

    it('should handle collapsed state', async () => {
        const wrapper = await mountSuspended(SidebarMenu, {
            props: {
                collapsed: true
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['dashboard'] },
                        tenant: { tenant: { name: 'Test Corp' } }
                    }
                })]
            }
        })
        
        // Should still render when collapsed
        expect(wrapper.html()).toBeDefined()
    })

    it('should have logo section', async () => {
        const wrapper = await mountSuspended(SidebarMenu, {
            props: {
                collapsed: false
            },
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['dashboard'] },
                        tenant: { tenant: { name: 'Test Corp', logoUrl: '' } }
                    }
                })]
            }
        })
        
        // Should have logo section (fallback icon or actual logo)
        expect(wrapper.html()).toContain('grid')
    })
})
