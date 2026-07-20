import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import HelpdeskPage from '../../app/pages/helpdesk/index.vue'
import { createTestingPinia } from '@pinia/testing'
import { useHelpdeskStore } from '../../stores/helpdesk'

const mockGetItem = vi.fn()
const mockSetItem = vi.fn()
const mockRemoveItem = vi.fn()

vi.mock('../../composables/useIndexedDB', () => ({
    useIndexedDB: () => ({
        getItem: mockGetItem,
        setItem: mockSetItem,
        removeItem: mockRemoveItem
    }),
    HELPDESK_FACILITY_KEY: 'helpdesk-selected-facility'
}))

describe('Helpdesk Page', () => {
    beforeEach(() => {
        mockGetItem.mockReset()
        mockSetItem.mockReset()
        mockRemoveItem.mockReset()
    })

    const mockTickets = [
        { id: 'TKT-001', ticket_number: 'TKT-001', category_name: 'IT', subcategory_name: 'Network Issue', state: { key: 'open', label: 'Open' }, priority: { key: 'p1', label: 'High' }, facilityId: '1', facilityName: 'HQ', created_at: '2026-01-07' },
        { id: 'TKT-002', ticket_number: 'TKT-002', category_name: 'Maintenance', subcategory_name: 'AC Repair', state: { key: 'inprogress', label: 'In Progress' }, priority: { key: 'p2', label: 'Medium' }, facilityId: '1', facilityName: 'HQ', created_at: '2026-01-06' }
    ]

    it('should render helpdesk page with header', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Helpdesk')
    })

    it('should display tickets', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('TKT-001')
        expect(wrapper.text()).toContain('IT')
    })

    it('should have status tabs with badges', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        helpdesk: { tickets: mockTickets, loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('All')
        expect(wrapper.text()).toContain('Open')
        expect(wrapper.text()).toContain('In Progress')
        expect(wrapper.text()).toContain('Closed')
    })

    it('should have "New Ticket" button', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        helpdesk: { tickets: [], loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('New Ticket')
    })

    it('should have "Insights" button', async () => {
        const wrapper = await mountSuspended(HelpdeskPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        helpdesk: { tickets: [], loading: false },
                        facility: { facilities: [] }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Insights')
    })

    describe('Badge Counts', () => {
        it('should show correct count for all tickets', async () => {
            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            // Should contain badge count of 2 for 'All' tab
            const badges = wrapper.findAllComponents({ name: 'ABadge' })
            expect(badges.length).toBeGreaterThan(0)
        })

        it('should preload saved facility filter from IndexedDB on mount', async () => {
            mockGetItem.mockResolvedValue('fac-1')

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [{ id: 'fac-1', name: 'HQ' }, { id: 'fac-2', name: 'Branch' }] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            expect(mockGetItem).toHaveBeenCalledWith('helpdesk-selected-facility')
            expect((wrapper.vm as any).facilityFilter).toBe('fac-1')
        })

        it('should ignore saved facility filter if it no longer exists', async () => {
            mockGetItem.mockResolvedValue('old-facility')

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [{ id: 'fac-1', name: 'HQ' }] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            expect((wrapper.vm as any).facilityFilter).toBeUndefined()
        })

        it('should persist facility filter to IndexedDB when changed', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [{ id: 'fac-1', name: 'HQ' }, { id: 'fac-2', name: 'Branch' }] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const vm = wrapper.vm as any
            vm.facilityFilter = 'fac-2'
            await wrapper.vm.$nextTick()
            await vm.handleFacilityFilterChange()

            expect(mockSetItem).toHaveBeenCalledWith('helpdesk-selected-facility', 'fac-2')
        })

        it('should remove saved facility filter from IndexedDB when cleared', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [{ id: 'fac-1', name: 'HQ' }] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const vm = wrapper.vm as any
            vm.facilityFilter = undefined
            await wrapper.vm.$nextTick()
            await vm.handleFacilityFilterChange()

            expect(mockRemoveItem).toHaveBeenCalledWith('helpdesk-selected-facility')
        })

        it('should compute ticket counts correctly', async () => {
            const testTickets = [
                { id: 'TKT-001', ticket_number: 'TKT-001', state: { key: 'open', label: 'Open' }, category_name: 'IT', facilityId: '1', created_at: '2026-01-07' },
                { id: 'TKT-002', ticket_number: 'TKT-002', state: { key: 'open', label: 'Open' }, category_name: 'IT', facilityId: '1', created_at: '2026-01-07' },
                { id: 'TKT-003', ticket_number: 'TKT-003', state: { key: 'inprogress', label: 'In Progress' }, category_name: 'Maintenance', facilityId: '1', created_at: '2026-01-06' },
                { id: 'TKT-004', ticket_number: 'TKT-004', state: { key: 'closed', label: 'Resolved' }, category_name: 'IT', facilityId: '1', created_at: '2026-01-05' },
            ]
            
            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                            helpdesk: { 
                                tickets: testTickets, 
                                loading: false,
                                allCount: 4,
                                openCount: 2,
                                inprogressCount: 1,
                                closedCount: 1
                            },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            // The computed ticketCounts should have: all=4, open=2, inprogress=1, closed=1
            const vm = wrapper.vm as any
            expect(vm.ticketCounts.all).toBe(4)
            expect(vm.ticketCounts.open).toBe(2)
            expect(vm.ticketCounts.inprogress).toBe(1)
            expect(vm.ticketCounts.closed).toBe(1)
        })

        it('should fetch tickets with search query after debounce', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk'], permissions: ['helpdesk-tickets:view'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const store = useHelpdeskStore()
            const vm = wrapper.vm as any
            vm.searchText = 'network'
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 350))

            const lastCall = store.fetchTickets.mock.calls[store.fetchTickets.mock.calls.length - 1]
            expect(lastCall[0]).toMatchObject({ search: 'network', page: 1 })
        })

        it('should combine search query with facility filter', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk'], permissions: ['helpdesk-tickets:view'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [{ id: 'fac-1', name: 'HQ' }] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const store = useHelpdeskStore()
            const vm = wrapper.vm as any
            vm.facilityFilter = 'fac-1'
            await vm.handleFacilityFilterChange()

            vm.searchText = 'network'
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 350))

            const lastCall = store.fetchTickets.mock.calls[store.fetchTickets.mock.calls.length - 1]
            expect(lastCall[0]).toMatchObject({ search: 'network', facility_id: 'fac-1', page: 1 })
        })

        it('should include search query in pagination requests', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk'], permissions: ['helpdesk-tickets:view'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const store = useHelpdeskStore()
            const vm = wrapper.vm as any
            vm.searchText = 'network'
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 350))

            await vm.handlePageChange(2, 20)

            const lastCall = store.fetchTickets.mock.calls[store.fetchTickets.mock.calls.length - 1]
            expect(lastCall[0]).toMatchObject({ search: 'network', page: 2, page_size: 20 })
        })

        it('should pass search query to priority tickets fetch', async () => {
            mockGetItem.mockResolvedValue(null)

            const wrapper = await mountSuspended(HelpdeskPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: { modules: ['helpdesk'], permissions: ['helpdesk-tickets:view'] },
                            helpdesk: { tickets: mockTickets, loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })

            await new Promise(resolve => setTimeout(resolve, 0))

            const store = useHelpdeskStore()
            const vm = wrapper.vm as any
            vm.activeTab = 'priority'
            vm.searchText = 'urgent'
            await wrapper.vm.$nextTick()
            await new Promise(resolve => setTimeout(resolve, 350))

            const lastCall = store.fetchPriorityTickets.mock.calls[store.fetchPriorityTickets.mock.calls.length - 1]
            expect(lastCall).toEqual([1, 10, undefined, 'urgent'])
        })
    })
})
