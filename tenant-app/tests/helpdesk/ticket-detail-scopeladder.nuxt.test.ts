import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mountSuspended } from '@nuxt/test-utils/runtime'
import { flushPromises } from '@vue/test-utils'
import TicketDetailPage from '../../app/pages/helpdesk/[id].vue'
import { createTestingPinia } from '@pinia/testing'

vi.mock('vue-router', async (importOriginal) => {
    const actual = await importOriginal<any>()
    return {
        ...actual,
        useRoute: () => ({
            params: { id: 'tkt-test-1' }
        })
    }
})

const mockGetAssignableUsers = vi.fn()
const mockGetStaffByFacility = vi.fn()
const mockGetTicketDependencies = vi.fn().mockResolvedValue([])

vi.mock('../../composables/helpdeskService', async (importOriginal) => {
    const actual = await importOriginal<any>()
    return {
        ...actual,
        useHelpdeskService: () => ({
            getTicketDependencies: mockGetTicketDependencies,
            getAssignableUsers: mockGetAssignableUsers,
            getStaffByFacility: mockGetStaffByFacility,
        })
    }
})

describe('Ticket Detail Page - ScopeLadder Candidate Score Breakdown', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        mockGetAssignableUsers.mockResolvedValue([
            { id: '41f1fc43-2ee2-40bc-9b85-7250c6df0f60', full_name: 'Sarah Engineer' }
        ])
        mockGetStaffByFacility.mockResolvedValue([
            { id: '41f1fc43-2ee2-40bc-9b85-7250c6df0f60', full_name: 'Sarah Engineer' }
        ])
    })

    const mockTicket = {
        id: 'tkt-test-1',
        ticket_number: 'TKT-001',
        title: 'Water leakage',
        description: 'Leak in 3rd floor restroom',
        category_name: 'Plumbing',
        facility: 'fac-1',
        assignee: '2b62a83f-4b3d-4b98-8bc9-966732ba2abb',
        assignee_name: 'Alex Technician',
        state: { key: 'ASSIGNED', label: 'Assigned' },
        timeline: [
            {
                id: 'time-1',
                from_state: 'OPEN',
                to_state: 'ASSIGNED',
                created_at: '2026-09-25T10:00:00Z',
                metadata: {
                    scope_type: 'FLOOR',
                    score_breakdown: {
                        '2b62a83f-4b3d-4b98-8bc9-966732ba2abb': 5.0,
                        '41f1fc43-2ee2-40bc-9b85-7250c6df0f60': 4.5
                    }
                }
            }
        ]
    }

    it('resolves candidate names from assignee and staff list instead of showing raw IDs', async () => {
        const wrapper = await mountSuspended(TicketDetailPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: {
                                user: { id: 'user-admin', role: 'admin' },
                                permissions: ['helpdesk-tickets:view', 'helpdesk-tickets:action']
                            },
                            helpdesk: {
                                currentTicket: mockTicket,
                                loading: false
                            }
                        }
                    })
                ]
            }
        })

        await flushPromises()

        const text = wrapper.text()
        expect(text).toContain('ScopeLadder Dispatch Reasoning')
        expect(text).toContain('FLOOR')
        // Should display resolved names:
        // - Alex Technician (from ticket assignee)
        // - Sarah Engineer (from staff list)
        expect(text).toContain('Alex Technician')
        expect(text).toContain('Sarah Engineer')
        expect(text).toContain('Assigned')
        // Should NOT show raw UUIDs as primary visible labels
        expect(text).not.toContain('2b62a83f-4b3d-4b98-8bc9-966732ba2abb')
        expect(text).not.toContain('41f1fc43-2ee2-40bc-9b85-7250c6df0f60')
    })

    it('falls back to short candidate label when UUID cannot be resolved', async () => {
        const ticketWithUnknownUuid = {
            ...mockTicket,
            assignee: null,
            assignee_name: null,
            timeline: [
                {
                    id: 'time-1',
                    from_state: 'OPEN',
                    to_state: 'ASSIGNED',
                    created_at: '2026-09-25T10:00:00Z',
                    metadata: {
                        scope_type: 'WING',
                        score_breakdown: {
                            '98765432-1234-5678-9abc-def012345678': 3.75
                        }
                    }
                }
            ]
        }

        mockGetAssignableUsers.mockResolvedValue([])
        mockGetStaffByFacility.mockResolvedValue([])

        const wrapper = await mountSuspended(TicketDetailPage, {
            global: {
                plugins: [
                    createTestingPinia({
                        createSpy: vi.fn,
                        initialState: {
                            auth: {
                                user: { id: 'user-admin', role: 'admin' },
                                permissions: ['helpdesk-tickets:view']
                            },
                            helpdesk: {
                                currentTicket: ticketWithUnknownUuid,
                                loading: false
                            }
                        }
                    })
                ]
            }
        })

        await flushPromises()

        const text = wrapper.text()
        expect(text).toContain('Candidate (98765432)')
        expect(text).not.toContain('98765432-1234-5678-9abc-def012345678')
    })
})
