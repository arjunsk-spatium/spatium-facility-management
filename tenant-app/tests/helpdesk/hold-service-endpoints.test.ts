import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHelpdeskService } from '../../composables/helpdeskService';

describe('Helpdesk Service - Hold Workflow Endpoints', () => {
    let service: ReturnType<typeof useHelpdeskService>;
    let originalFetch: typeof global.fetch;
    const mockFetch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        originalFetch = global.fetch;
        global.fetch = mockFetch;
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', 'test-token');
            localStorage.setItem('tenant_id', 'test-tenant');
        }
        service = useHelpdeskService();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('1. GET /api/portal/helpdesk/tickets/request-pending-tickets/ - fetches pending hold requests', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    results: [
                        { id: 'tkt-1', title: 'HVAC repair needed', state: { key: 'ACKNOWLEDGED' } }
                    ],
                    count: 1,
                    next: null,
                    previous: null
                }
            })
        });

        const result = await service.getRequestPendingTickets(1, 10, 'fac-123', 'HVAC');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/request-pending-tickets/');
        expect(url).toContain('page=1');
        expect(url).toContain('page_size=10');
        expect(url).toContain('facility_id=fac-123');
        expect(url).toContain('search=HVAC');
        expect(options.method).toBe('GET');
        expect(result.tickets).toHaveLength(1);
        expect(result.count).toBe(1);
    });

    it('2. POST /api/portal/helpdesk/tickets/{id}/approve-hold/{depId}/ - approves hold with decision notes and extend_minutes', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    id: '29718858-b14c-4c92-b421-635be1f15b54',
                    state: { key: 'ON_HOLD', label: 'On Hold' }
                }
            })
        });

        const result = await service.approveHold(
            '29718858-b14c-4c92-b421-635be1f15b54',
            '9de56f9f-4096-433f-86ed-4d5715ecebdf',
            {
                decision_notes: 'Approved for testing',
                extend_minutes: 120
            }
        );

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/29718858-b14c-4c92-b421-635be1f15b54/approve-hold/9de56f9f-4096-433f-86ed-4d5715ecebdf/');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body).toEqual({
            decision_notes: 'Approved for testing',
            extend_minutes: 120
        });
        expect(result.state.key).toBe('ON_HOLD');
    });

    it('3. POST /api/portal/helpdesk/tickets/{id}/hold/ - direct hold for helpdesk role without approval', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    id: '0b1b5692-bf07-4937-a8e9-030746997b32',
                    state: { key: 'ON_HOLD' }
                }
            })
        });

        const payload = {
            reason_type: '00000000-0000-0000-0000-000000000405',
            notes: 'Testing hold workflow',
            expected_resolution_at: '2026-09-20T12:00:00Z',
            linked_ticket: 'c327626a-1c1e-45d9-b829-9f4a349188c4'
        };

        const result = await service.directHold('0b1b5692-bf07-4937-a8e9-030746997b32', payload);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/0b1b5692-bf07-4937-a8e9-030746997b32/hold/');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body).toEqual(payload);
        expect(result.state.key).toBe('ON_HOLD');
    });

    it('4. GET /api/portal/helpdesk/tickets/on-hold-tickets/ - gets tickets currently on hold with facility filter and pagination', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    results: [
                        { id: '29718858-b14c-4c92-b421-635be1f15b54', state: { key: 'ON_HOLD' } }
                    ],
                    count: 1,
                    next: null,
                    previous: null
                }
            })
        });

        const result = await service.getOnHoldTickets(1, 20, '29718858-b14c-4c92-b421-635be1f15b54');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/on-hold-tickets/');
        expect(url).toContain('page=1');
        expect(url).toContain('page_size=20');
        expect(url).toContain('facility_id=29718858-b14c-4c92-b421-635be1f15b54');
        expect(options.method).toBe('GET');
        expect(result.tickets).toHaveLength(1);
    });

    it('5. POST /api/portal/helpdesk/tickets/{id}/change-resolution-sla/ - changes resolution SLA while on hold', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    id: '29718858-b14c-4c92-b421-635be1f15b54',
                    state: { key: 'ON_HOLD' }
                }
            })
        });

        const result = await service.changeResolutionSla('29718858-b14c-4c92-b421-635be1f15b54', {
            extend_minutes: 45
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/29718858-b14c-4c92-b421-635be1f15b54/change-resolution-sla/');
        expect(options.method).toBe('POST');
        const body = JSON.parse(options.body);
        expect(body).toEqual({ extend_minutes: 45 });
        expect(result.id).toBe('29718858-b14c-4c92-b421-635be1f15b54');
    });

    it('6. POST /api/portal/helpdesk/tickets/{id}/resume-direct/ - resumes ticket directly', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: {
                    id: '29718858-b14c-4c92-b421-635be1f15b54',
                    state: { key: 'IN_PROGRESS' }
                }
            })
        });

        const result = await service.resumeDirect('29718858-b14c-4c92-b421-635be1f15b54');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/29718858-b14c-4c92-b421-635be1f15b54/resume-direct/');
        expect(options.method).toBe('POST');
        expect(result.state.key).toBe('IN_PROGRESS');
    });

    it('7. GET /api/portal/helpdesk/dependency-reason-types/ - fetches ticket hold reason types', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: [
                    { id: '00000000-0000-0000-0000-000000000405', name: 'Parts Delayed', key: 'PARTS_AWAITED' },
                    { id: '00000000-0000-0000-0000-000000000406', name: 'Vendor Visit', key: 'VENDOR_VISIT' }
                ]
            })
        });

        const result = await service.getDependencyReasonTypes();

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/dependency-reason-types/');
        expect(options.method).toBe('GET');
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('00000000-0000-0000-0000-000000000405');
    });

    it('8. GET /api/portal/helpdesk/tickets/{id}/dependencies/ - gets ticket hold history', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: [
                    {
                        id: 'dep-1',
                        ticket: '29718858-b14c-4c92-b421-635be1f15b54',
                        status: 'APPROVED',
                        reason_type: 'PARTS_AWAITED',
                        extend_minutes: 120
                    }
                ]
            })
        });

        const result = await service.getTicketDependencies('29718858-b14c-4c92-b421-635be1f15b54');

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/29718858-b14c-4c92-b421-635be1f15b54/dependencies/');
        expect(options.method).toBe('GET');
        expect(result).toHaveLength(1);
        expect(result[0].extend_minutes).toBe(120);
    });

    it('9. GET /api/portal/helpdesk/tickets/exclude-closed-tickets/ - searches open tickets for linked ticket dependency', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({
                success: true,
                data: [
                    {
                        id: 'a23cd9ff-f044-4067-9d79-27e692ac9a90',
                        ticket_number: 'TKT-1042',
                        title: 'Air conditioner leaking',
                        state: { key: 'IN_PROGRESS', label: 'In Progress' }
                    }
                ]
            })
        });

        const result = await service.getExcludeClosedTickets({
            facility_id: 'a23cd9ff-f044-4067-9d79-27e692ac9a90',
            search: 'TKT-1042'
        });

        expect(mockFetch).toHaveBeenCalledTimes(1);
        const [url, options] = mockFetch.mock.calls[0];
        expect(url).toContain('/api/portal/helpdesk/tickets/exclude-closed-tickets/');
        expect(url).toContain('facility_id=a23cd9ff-f044-4067-9d79-27e692ac9a90');
        expect(url).toContain('search=TKT-1042');
        expect(options.method).toBe('GET');
        expect(result).toHaveLength(1);
        expect(result[0].ticket_number).toBe('TKT-1042');
    });
});

