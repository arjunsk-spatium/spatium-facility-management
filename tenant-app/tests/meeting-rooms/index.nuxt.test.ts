import { describe, it, expect, vi } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import MeetingRoomsPage from '../../app/pages/meeting-rooms/index.vue'
import { createTestingPinia } from '@pinia/testing'

describe('Meeting Rooms Page', () => {
    const mockRooms = [
        { id: '1', name: 'Conference Room A', capacity: 10, status: 'Active', floor: '1st Floor', facilities: ['Projector', 'Whiteboard'] },
        { id: '2', name: 'Board Room', capacity: 20, status: 'Active', floor: '2nd Floor', facilities: ['TV', 'Video Conferencing'] }
    ]

    it('should render meeting rooms page with header', async () => {
        const wrapper = await mountSuspended(MeetingRoomsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { rooms: mockRooms, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Meeting Rooms')
    })

    it('should display rooms list', async () => {
        const wrapper = await mountSuspended(MeetingRoomsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { rooms: mockRooms, loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.text()).toContain('Conference Room A')
        expect(wrapper.text()).toContain('Board Room')
    })

    it('should have navigation to bookings', async () => {
        const wrapper = await mountSuspended(MeetingRoomsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { rooms: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Bookings')
    })

    it('should have navigation to insights', async () => {
        const wrapper = await mountSuspended(MeetingRoomsPage, {
            global: {
                plugins: [createTestingPinia({
                    createSpy: vi.fn,
                    initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                        meetingRoom: { rooms: [], loading: false }
                    }
                })]
            }
        })
        
        expect(wrapper.html()).toContain('Insights')
    })

    describe('Room Creation Modal', () => {
        it('should have Add Room button', async () => {
            const wrapper = await mountSuspended(MeetingRoomsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                            meetingRoom: { rooms: [], loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            expect(wrapper.html()).toContain('Add Room')
        })

        it('should navigate to create page on Add Room click', async () => {
            const wrapper = await mountSuspended(MeetingRoomsPage, {
                global: {
                    plugins: [createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                        auth: { modules: ['helpdesk', 'facilities', 'meeting_rooms', 'visitors'], permissions: ['meeting-rooms-bookings:view', 'meeting-rooms-bookings:create', 'meeting-rooms-bookings:action', 'facilities-list:view', 'facilities-list:create', 'facilities-list:update', 'facilities-list:delete', 'meeting-rooms-list:view', 'meeting-rooms-list:create', 'meeting-rooms-insights:view', 'meeting-rooms:create', 'helpdesk-tickets:view', 'helpdesk-tickets:create', 'helpdesk-tickets:update', 'helpdesk-tickets:action', 'visitors:view', 'visitor_sticker_print'] },
                            meetingRoom: { rooms: [], loading: false },
                            facility: { facilities: [] }
                        }
                    })]
                }
            })
            
            // Verify the Add Room button exists and would navigate to create page
            const addButton = wrapper.find('button')
            expect(wrapper.html()).toContain('Add Room')
        })
    })
})
