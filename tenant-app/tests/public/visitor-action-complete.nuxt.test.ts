import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import ActionCompletePage from '../../app/pages/public/visitor/review/action-complete.vue'
import { createTestingPinia } from '@pinia/testing'

let mockRouteQuery: Record<string, string> = {}

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('vue-router')>()
    return {
        ...actual,
        useRoute: () => ({
            query: mockRouteQuery,
            params: {}
        }),
        useRouter: () => ({
            back: vi.fn(),
            push: vi.fn()
        })
    }
})

describe('Visitor Review Action Complete Page', () => {
    beforeEach(() => {
        mockRouteQuery = {}
        vi.clearAllMocks()
    })

    const mountOptions = {
        global: {
            plugins: [
                createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        tenant: { tenant: { name: 'Test Tenant' } }
                    }
                })
            ]
        }
    }

    it('should render approved state with dynamic query data', async () => {
        mockRouteQuery = {
            status: 'approved',
            name: 'Gowtham',
            company: 'Spatium',
            date: 'Friday, 21 August 2026',
            time: '04:13 PM',
            photo: 'https://example.com/photo.jpg'
        }

        const wrapper = await mountSuspended(ActionCompletePage, mountOptions)

        expect(wrapper.text()).toContain('Review Complete')
        expect(wrapper.text()).toContain('Request Approved!')
        expect(wrapper.text()).toContain('Gowtham')
        expect(wrapper.text()).toContain('Spatium')
        expect(wrapper.text()).toContain('Friday, 21 August 2026')
        expect(wrapper.text()).toContain('04:13 PM')
        expect(wrapper.text()).toContain('Approved')
        const img = wrapper.find('img')
        expect(img.exists()).toBe(true)
        expect(img.attributes('src')).toBe('https://example.com/photo.jpg')
    })

    it('should render rejected state with dynamic query data and combined date-time', async () => {
        mockRouteQuery = {
            status: 'rejected',
            name: 'Gowtham',
            company: 'Spatium',
            date: 'Friday, 21 August 2026',
            time: '04:13 PM'
        }

        const wrapper = await mountSuspended(ActionCompletePage, mountOptions)

        expect(wrapper.text()).toContain('Request Rejected')
        expect(wrapper.text()).toContain('Rejection Confirmed')
        expect(wrapper.text()).toContain('Rejected Visitor')
        expect(wrapper.text()).toContain('Gowtham')
        expect(wrapper.text()).toContain('Spatium')
        expect(wrapper.text()).toContain('Friday, 21 August 2026 • 04:13 PM')
    })

    it('should fall back gracefully when query parameters are missing', async () => {
        mockRouteQuery = {}

        const wrapper = await mountSuspended(ActionCompletePage, mountOptions)

        expect(wrapper.text()).toContain('Review Complete')
        expect(wrapper.text()).toContain('Request Approved!')
        expect(wrapper.text()).toContain('Visitor')
    })
})
