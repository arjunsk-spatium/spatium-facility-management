
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import SidebarMenu from './SidebarMenu.vue'
import { createTestingPinia } from '@pinia/testing'
import { ref } from 'vue'

// Mock Composables
const mockGetAllModules = vi.fn()
vi.mock('../composables/useModuleRegistry', () => ({
  useModuleRegistry: () => ({
    getAllModules: mockGetAllModules
  })
}))

const mockGetTenantModules = vi.fn()
vi.mock('../composables/userService', () => ({
  useUserService: () => ({
    getTenantModules: mockGetTenantModules
  })
}))

const mockUseTheme = {
  colorMode: ref('light')
}
vi.mock('../composables/useTheme', () => ({
  useTheme: () => mockUseTheme
}))

const mockRoute = ref({ path: '/dashboard' })
vi.mock('vue-router', () => ({
  useRoute: () => mockRoute.value,
  RouterLink: { template: '<a><slot /></a>' } 
}))

// Ant Design Mocks
// Ant Design Mocks
vi.mock('@ant-design/icons-vue', () => {
    const FakeIcon = { template: '<span />' }
    return {
        BankOutlined: FakeIcon,
        SettingOutlined: FakeIcon,
        BarChartOutlined: FakeIcon,
        UsergroupAddOutlined: FakeIcon,
        CustomerServiceOutlined: FakeIcon,
        HomeOutlined: FakeIcon,
        SafetyCertificateOutlined: FakeIcon,
        ShoppingCartOutlined: FakeIcon,
        TeamOutlined: FakeIcon,
        CalendarOutlined: FakeIcon,
        AppstoreOutlined: FakeIcon,
        DashboardOutlined: FakeIcon
    }
})

describe('SidebarMenu.vue', () => {
    
    // Sample Registry Data
    const registryModules = [
        { key: 'dashboard', label: 'Dashboard Reg', icon: 'Icon1', route: '/dashboard' },
        { 
            key: 'visitors', 
            label: 'Visitors Reg', 
            icon: 'Icon2',
            children: [
                { key: 'visitors-list', label: 'List Reg', route: '/visitors' }
            ]
        }
    ]

    // Sample Skeletal API Data
    const apiModules = [
        { key: 'dashboard', label: 'Dashboard API' },
        { 
            key: 'visitors', 
            label: 'Visitors API',
            children: [
                { key: 'visitors-list', label: 'List API' }
            ]
        }
    ]

  beforeEach(() => {
    mockGetAllModules.mockReturnValue(registryModules)
    mockGetTenantModules.mockResolvedValue(apiModules)
    mockRoute.value = { path: '/dashboard' }
  })

  const mountComponent = () => {
    return mount(SidebarMenu, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              auth: { modules: ['dashboard', 'visitors', 'visitors-list'] },
              tenant: { tenantName: 'Test Tenant' }
            }
          })
        ],
        stubs: {
          'a-menu': { template: '<div><slot /></div>' },
          'a-sub-menu': { template: '<div><slot name="title" /><slot /></div>' },
          'a-menu-item': { template: '<div><slot /></div>' },
          'NuxtLink': { props: ['to'], template: '<a :href="to"><slot /></a>' } 
        }
      }
    })
  }

  it('hydrates content from registry correctly', async () => {
    const wrapper = mountComponent()
    await flushPromises()

    // Check if icons are hydrated (which come from registry)
    // Since we mocked components, we can inspect the VM or the rendered output if simplified
    // Accessing component state (exposed via defineExpose is not present), so we inspect emitted events or check side effects.
    // However, we can assert on the text content. 'Dashboard API' should be used (API takes precedence for Label?)
    // Wait, let's check code: `label: apiMod.label || registryMod.label`. So API label wins.
    // `icon: apiMod.icon || registryMod.icon`. API has no icon, so Registry icon wins.
    // `route: apiMod.route || registryMod.route`. API has no route, so Registry route wins.
    
    // Actually, accessing internal state in script setup is hard without defineExpose. 
    // We can rely on what's rendered.
    // Check if NuxtLink has the correct 'to' prop which comes from registry
    const links = wrapper.findAll('a')
    // Dashboard link
    const dashboardLink = links.find(l => l.text().includes('Dashboard API'))
    expect(dashboardLink).toBeDefined()
    expect(dashboardLink?.attributes('href')).toBe('/dashboard')

    // Visitors link (nested)
    const visitorLink = links.find(l => l.text().includes('List API'))
    expect(visitorLink).toBeDefined()
    expect(visitorLink?.attributes('href')).toBe('/visitors')
  })

  it('filters modules based on authStore', async () => {
    const wrapper = mount(SidebarMenu, {
        global: {
          plugins: [
            createTestingPinia({
              createSpy: vi.fn,
              initialState: {
                auth: { modules: ['dashboard'] }, // Only dashboard access
                tenant: { tenantName: 'Test' }
              }
            })
          ],
          stubs: {
            'a-menu': { template: '<div><slot /></div>' },
            'a-sub-menu': { template: '<div><slot /></div>' },
            'a-menu-item': { template: '<div><slot /></div>' },
            'NuxtLink': { template: '<a><slot /></a>' },
          }
        }
    })
    
    await flushPromises()
    
    const text = wrapper.text()
    expect(text).toContain('Dashboard API')
    expect(text).not.toContain('Visitors API')
  })

  // Testing dynamic logic via route changes
  // Since `findActiveModule` is internal, we check the effect: `selectedKeys` / `openKeys` binding.
  // We mocked `a-menu` v-models? No, typically v-model work on stubs if we emit `update:modelValue`.
  // But here we want to verify the COMPONENT logic updates the ref when ROUTE changes.
  
  // Note: `selectedKeys` is bound to a-menu. We can't easily check the internal ref value unless we spy on the v-model update or defineExpose.
  // However, in our stub of `a-menu`, we can check the props it received?
  // `mount` options allow spying on instances?
  
  // Let's rely on checking `selectedKeys` passed to the child component `a-menu`
})
