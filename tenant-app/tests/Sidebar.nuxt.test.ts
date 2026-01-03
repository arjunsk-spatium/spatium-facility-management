
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import Sidebar from '../components/Sidebar.vue'
import { createTestingPinia } from '@pinia/testing'

// Mock composables
const mockUseSidebar = {
    isMobile: ref(false),
    isOpen: ref(false),
    collapsed: ref(false),
    closeMobileSidebar: vi.fn(),
    toggleMobileSidebar: vi.fn(),
    toggleDesktopCollapse: vi.fn()
}

vi.mock('../composables/useSidebar', () => ({
    useSidebar: () => mockUseSidebar
}))

vi.mock('../composables/useTheme', () => ({
    useTheme: () => ({ colorMode: ref('light') })
}))

// Mock SidebarMenu component
const SidebarMenuStub = {
    template: '<div data-testid="sidebar-menu">Menu</div>',
    props: ['collapsed']
}

describe('Sidebar', () => {
    beforeEach(() => {
        mockUseSidebar.isMobile.value = false;
        mockUseSidebar.isOpen.value = false;
        mockUseSidebar.collapsed.value = false;
    })

    it('should render desktop slider when not mobile', async () => {
        const wrapper = await mountSuspended(Sidebar, {
            global: {
                plugins: [createTestingPinia()],
                components: { SidebarMenu: SidebarMenuStub }
            }
        })
        
        expect(wrapper.find('a-layout-sider').exists()).toBe(true)
        expect(wrapper.find('a-drawer').exists()).toBe(false)
    })

    it('should render mobile drawer when mobile', async () => {
        mockUseSidebar.isMobile.value = true;
        
        const wrapper = await mountSuspended(Sidebar, {
            global: {
                plugins: [createTestingPinia()],
                components: { SidebarMenu: SidebarMenuStub }
            }
        })
        
        expect(wrapper.find('a-drawer').exists()).toBe(true)
        expect(wrapper.find('a-layout-sider').exists()).toBe(false)
    })
})
