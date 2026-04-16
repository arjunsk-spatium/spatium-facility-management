
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { ref } from 'vue'
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
        
        // Ant Design components render with class names, not kebab-case tags
        expect(wrapper.html()).toContain('ant-layout-sider')
    })

    it('should have sidebar menu rendered', async () => {
        const wrapper = await mountSuspended(Sidebar, {
            global: {
                plugins: [createTestingPinia()],
                components: { SidebarMenu: SidebarMenuStub }
            }
        })
        
        // Sidebar should contain the ant-menu from SidebarMenu component
        expect(wrapper.html()).toContain('ant-menu')
    })
})
