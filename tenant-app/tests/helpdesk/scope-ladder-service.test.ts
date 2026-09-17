import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useHelpdeskService } from '../../composables/helpdeskService'

function mockResponse(data: any, ok = true, status = 200) {
    return Promise.resolve({
        ok,
        status,
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => data,
        text: async () => JSON.stringify(data),
    } as Response)
}

describe('helpdeskService - ScopeLadder & Hold/Resume Extensions', () => {
    let originalFetch: typeof global.fetch
    const mockFetch = vi.fn()
    const service = useHelpdeskService()

    beforeEach(() => {
        originalFetch = global.fetch
        global.fetch = mockFetch
        mockFetch.mockReset()
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', 'fake-token')
            localStorage.setItem('tenant_id', 'test-tenant')
        }
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    describe('Worker Location Scopes', () => {
        it('should get staff location scopes', async () => {
            const mockScopes = [
                { id: '1', scope_type: 'WING', facility_id: 'fac-1', tower_id: 'tow-1', floor_id: 'fl-1', wing_id: 'w-1' }
            ]
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { scopes: mockScopes }
                })
            )

            const result = await service.getStaffLocationScopes('user-123')
            expect(result).toEqual(mockScopes)
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/staff/user-123/location-scopes/'),
                expect.objectContaining({ method: 'GET' })
            )
        })

        it('should set staff location scopes', async () => {
            const mockScopes = [
                { scope_type: 'FACILITY', facility_id: 'fac-1' }
            ]
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { scopes: mockScopes }
                })
            )

            const result = await service.setStaffLocationScopes('user-123', mockScopes as any)
            expect(result).toEqual(mockScopes)
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/staff/user-123/location-scopes/'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ scopes: mockScopes })
                })
            )
        })
    })

    describe('Worker Capacity', () => {
        it('should get staff capacity', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { capacity: { throttle: 6, effort_capacity_min: 480 } }
                })
            )

            const result = await service.getStaffCapacity('user-123')
            expect(result).toEqual({ throttle: 6, effort_capacity_min: 480 })
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/staff/user-123/capacity/'),
                expect.objectContaining({ method: 'GET' })
            )
        })

        it('should set staff capacity', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { capacity: { throttle: 4, effort_capacity_min: 300 } }
                })
            )

            const result = await service.setStaffCapacity('user-123', { throttle: 4, effort_capacity_min: 300 })
            expect(result).toEqual({ throttle: 4, effort_capacity_min: 300 })
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/staff/user-123/capacity/'),
                expect.objectContaining({
                    method: 'PUT',
                    body: JSON.stringify({ throttle: 4, effort_capacity_min: 300 })
                })
            )
        })

        it('should delete staff capacity', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { capacity: null }
                })
            )

            await service.deleteStaffCapacity('user-123')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/staff/user-123/capacity/'),
                expect.objectContaining({ method: 'DELETE' })
            )
        })
    })

    describe('Tenant Helpdesk Config & Scoring Config', () => {
        it('should get and update helpdesk config', async () => {
            const config = {
                priority_aging_enabled: true,
                aging_interval_minutes: 60,
                auto_close_hours: 48,
                auto_mode_capacity_gate_enabled: true
            }
            mockFetch.mockImplementationOnce(() => mockResponse({ success: true, data: config }))
            const fetched = await service.getHelpdeskConfig()
            expect(fetched).toEqual(config)

            mockFetch.mockImplementationOnce(() =>
                mockResponse({ success: true, data: { ...config, auto_close_hours: 72 } })
            )
            const updated = await service.updateHelpdeskConfig({ auto_close_hours: 72 })
            expect(updated.auto_close_hours).toBe(72)
        })

        it('should get and update scoring config', async () => {
            const scoring = {
                alpha: 1.2,
                beta: 1.0,
                gamma: 0.8,
                delta: 1.0,
                epsilon: 1.5,
                reassign_threshold: 0.1,
                handover_penalty: 0.15,
                night_mode_enabled: false
            }
            mockFetch.mockImplementationOnce(() => mockResponse({ success: true, data: scoring }))
            const fetched = await service.getScoringConfig()
            expect(fetched).toEqual(scoring)

            mockFetch.mockImplementationOnce(() =>
                mockResponse({ success: true, data: { ...scoring, night_mode_enabled: true } })
            )
            const updated = await service.updateScoringConfig({ night_mode_enabled: true })
            expect(updated.night_mode_enabled).toBe(true)
        })
    })

    describe('Reject Assignment', () => {
        it('should call reject-assignment endpoint', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'tkt-1', state: { key: 'open', label: 'Open' } }
                })
            )

            const result = await service.rejectAssignment('tkt-1', 'Not my domain')
            expect(result.id).toBe('tkt-1')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/reject-assignment/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ reason: 'Not my domain' })
                })
            )
        })
    })

    describe('Hold / Resume Workflow', () => {
        it('should request hold', async () => {
            const payload = {
                reason_type: 'PARTS_AWAITED' as const,
                notes: 'Awaiting replacement compressor',
                expected_resolution_at: '2026-09-20T10:00:00Z'
            }
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'dep-1', ...payload, status: 'REQUESTED' }
                })
            )

            const res = await service.requestHold('tkt-1', payload)
            expect(res.id).toBe('dep-1')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/request-hold/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            )
        })

        it('should approve hold', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'tkt-1', state: { key: 'on_hold', label: 'On Hold' } }
                })
            )

            const res = await service.approveHold('tkt-1', 'dep-1', 'Approved until part arrives')
            expect(res.id).toBe('tkt-1')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/approve-hold/dep-1/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ decision_notes: 'Approved until part arrives' })
                })
            )
        })

        it('should reject hold', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'dep-1', status: 'REJECTED' }
                })
            )

            const res = await service.rejectHold('tkt-1', 'dep-1', 'Cannot approve hold')
            expect(res.status).toBe('REJECTED')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/reject-hold/dep-1/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ decision_notes: 'Cannot approve hold' })
                })
            )
        })

        it('should direct hold', async () => {
            const payload = {
                reason_type: 'VENDOR_VISIT' as const,
                notes: 'Vendor scheduled for tomorrow'
            }
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'tkt-1', state: { key: 'on_hold', label: 'On Hold' } }
                })
            )

            const res = await service.directHold('tkt-1', payload)
            expect(res.id).toBe('tkt-1')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/hold/'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify(payload)
                })
            )
        })

        it('should resume ticket', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'tkt-1', state: { key: 'in_progress', label: 'In Progress' } }
                })
            )

            const res = await service.resumeTicket('tkt-1')
            expect(res.id).toBe('tkt-1')
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/resume/'),
                expect.objectContaining({ method: 'POST' })
            )
        })

        it('should get ticket dependencies', async () => {
            const deps = [{ id: 'dep-1', reason_type: 'PARTS_AWAITED', status: 'RESUMED' }]
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: deps
                })
            )

            const res = await service.getTicketDependencies('tkt-1')
            expect(res).toEqual(deps)
            expect(mockFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/portal/helpdesk/tickets/tkt-1/dependencies/'),
                expect.objectContaining({ method: 'GET' })
            )
        })
    })

    describe('Assign with Warnings', () => {
        it('should capture warnings when assigning tickets', async () => {
            mockFetch.mockImplementation(() =>
                mockResponse({
                    success: true,
                    data: { id: 'tkt-1', ticket_number: 'TKT-001' },
                    warnings: ['Assignee is at 7/6 open ticket capacity.']
                })
            )

            const res = await service.assignTicket('tkt-1', 'worker-1', 'Urgent')
            expect(res.warnings).toEqual(['Assignee is at 7/6 open ticket capacity.'])
        })
    })
})
