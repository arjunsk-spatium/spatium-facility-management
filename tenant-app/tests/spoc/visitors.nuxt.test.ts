import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import SpocVisitorListPage from '../../app/pages/spoc/visitors/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useFacilityStore } from '../../stores/facility'
import { useSpocStore } from '../../stores/spoc'

let mockRouteQuery: Record<string, string> = {}
const mockReplace = vi.fn()

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
            push: vi.fn(),
            replace: mockReplace
        })
    }
})

describe('SPOC Visitor List Page', () => {
    beforeEach(() => {
        mockRouteQuery = {}
        mockReplace.mockClear()
    })

    const mockVisitors = [
        {
            id: '1',
            name: 'Rahul Sharma',
            phone: '+91 98765 43210',
            email: 'rahul@example.com',
            visitDate: '2026-01-07',
            visitTime: '10:00 AM',
            purpose: 'Business Meeting',
            status: 'Checked In',
            hostName: 'John Doe',
            visitor_pass_url: 'http://pass1.pdf'
        },
        {
            id: '2',
            name: 'Priya Patel',
            phone: '+91 87654 32109',
            visitDate: '2026-01-07',
            visitTime: '11:30 AM',
            purpose: 'Interview',
            status: 'Pending',
            hostName: 'Jane Smith'
        },
        {
            id: '3',
            name: 'Amit Kumar',
            phone: '+91 76543 21098',
            visitDate: '2026-01-07',
            purpose: 'Delivery',
            status: 'Approved',
            hostName: 'Bob Wilson',
            visitor_pass_url: 'http://pass2.pdf'
        }
    ]

    it('should render visitor list page with header', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Visitor List')
        expect(wrapper.text()).toContain("Manage and track your company's visitors")
    })

    it('should display visitors in the list', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Rahul Sharma')
        expect(wrapper.text()).toContain('Priya Patel')
        expect(wrapper.text()).toContain('Amit Kumar')
    })

    it('should show status badges for visitors', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Checked In')
        expect(wrapper.text()).toContain('Pending')
        expect(wrapper.text()).toContain('Approved')
    })

    it('should have status filter dropdown', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        // Check for filter controls
        expect(wrapper.html()).toContain('All Status')
    })

    it('should have "Invite Visitor" button', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Invite')
        expect(wrapper.html()).toContain('/spoc/visitors/invite')
    })

    it('should have "Insights" button linking to insights page', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Insights')
        expect(wrapper.html()).toContain('/spoc/visitors/insights')
    })

    it('should display passcode when available', async () => {
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Generated')
    })

    it('should filter visitors by status=pending from route query', async () => {
        mockRouteQuery = { status: 'pending' }
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })

        // Priya Patel is Pending
        expect(wrapper.text()).toContain('Priya Patel')
        // Rahul Sharma is Checked In, Amit Kumar is Approved -> should NOT be visible in filtered list
        expect(wrapper.text()).not.toContain('Rahul Sharma')
        expect(wrapper.text()).not.toContain('Amit Kumar')
    })

    it('should filter visitors by status=approved from route query', async () => {
        mockRouteQuery = { status: 'approved' }
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Amit Kumar')
        expect(wrapper.text()).not.toContain('Priya Patel')
        expect(wrapper.text()).not.toContain('Rahul Sharma')
    })

    it('should filter visitors by status=checked_in from route query', async () => {
        mockRouteQuery = { status: 'checked_in' }
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Rahul Sharma')
        expect(wrapper.text()).not.toContain('Priya Patel')
        expect(wrapper.text()).not.toContain('Amit Kumar')
    })

    it('should correctly filter even if visitor status in store is lowercase', async () => {
        const lowercaseVisitors = [
            { id: '1', name: 'User Pending', status: 'pending', purpose: 'Visit' },
            { id: '2', name: 'User Approved', status: 'approved', purpose: 'Meeting' }
        ]
        mockRouteQuery = { status: 'pending' }
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: lowercaseVisitors, loading: false }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('User Pending')
        expect(wrapper.text()).not.toContain('User Approved')
    })

    it('should support capitalized query param status=Pending', async () => {
        mockRouteQuery = { status: 'Pending' }
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Priya Patel')
        expect(wrapper.text()).not.toContain('Rahul Sharma')
        expect(wrapper.text()).not.toContain('Amit Kumar')
    })

    it('should update route query when status filter changes', async () => {
        mockRouteQuery = {}
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: mockVisitors, loading: false }
                    }
                })]
            }
        })

        // Call handleStatusChange directly or via component
        const vm = wrapper.vm as any
        vm.handleStatusChange('Pending')
        expect(mockReplace).toHaveBeenCalledWith({ query: { status: 'pending' } })

        vm.handleStatusChange(null)
        expect(mockReplace).toHaveBeenCalledWith({ query: {} })
    })

    it('should call the facility store QR action when QR Code is clicked', async () => {
        mockRouteQuery = { facility_id: 'fac-1' }
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                spoc: {
                    visitors: [],
                    loading: false,
                    facilities: [{ id: 'fac-1', name: 'Innovations Lab' }]
                }
            }
        })
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: { plugins: [pinia] }
        })
        const facilityStore = useFacilityStore(pinia)

        const vm = wrapper.vm as any
        await vm.generateQR()

        expect(facilityStore.generateFacilityQRCode).toHaveBeenCalledWith('fac-1', 'Innovations Lab')
    })

    it('should not call the QR action when no facility is selected', async () => {
        mockRouteQuery = {}
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                spoc: {
                    visitors: [],
                    loading: false,
                    facilities: [{ id: 'fac-1', name: 'Innovations Lab' }]
                }
            }
        })
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: { plugins: [pinia] }
        })
        const facilityStore = useFacilityStore(pinia)

        const vm = wrapper.vm as any
        await vm.generateQR()

        expect(facilityStore.generateFacilityQRCode).not.toHaveBeenCalled()
    })

    it('should only show visitors of the selected facility', async () => {
        mockRouteQuery = { facility_id: 'fac-2' }
        const facilityVisitors = [
            { id: '1', name: 'HQ Visitor', status: 'Pending', facility_id: 'fac-1' },
            { id: '2', name: 'Lab Visitor', status: 'Pending', facility_id: 'fac-2' }
        ]
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        spoc: { visitors: facilityVisitors, loading: false }
                    }
                })]
            }
        })

        expect(wrapper.text()).toContain('Lab Visitor')
        expect(wrapper.text()).not.toContain('HQ Visitor')
    })

    it('should request the given page from the store when pagination changes', async () => {
        mockRouteQuery = {}
        const pinia = createTestingPinia({
            createSpy: vi.fn,
            initialState: {
                spoc: {
                    visitors: [],
                    loading: false,
                    visitorCount: 25,
                    visitorPage: 1,
                    visitorPageSize: 10
                }
            }
        })
        const wrapper = await mountSuspended(SpocVisitorListPage, {
            global: { plugins: [pinia] }
        })
        const store = useSpocStore(pinia)

        const vm = wrapper.vm as any
        expect(vm.paginationConfig.total).toBe(25)

        await vm.handleVisitorPageChange(2, 20)
        expect(store.fetchVisitors).toHaveBeenCalledWith({
            facilityId: undefined,
            page: 2,
            page_size: 20
        })
    })
})


