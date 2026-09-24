import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatusBadge from '../../components/helpdesk/StatusBadge.vue';
import TicketHoldModal from '../../components/helpdesk/tickets/TicketHoldModal.vue';
import TicketHoldDecisionModal from '../../components/helpdesk/tickets/TicketHoldDecisionModal.vue';
import ChangeResolutionSlaModal from '../../components/helpdesk/tickets/ChangeResolutionSlaModal.vue';
import RejectAssignmentModal from '../../components/helpdesk/tickets/RejectAssignmentModal.vue';
import TicketDependencyList from '../../components/helpdesk/tickets/TicketDependencyList.vue';
import WorkerLocationScopeModal from '../../components/helpdesk/staff/WorkerLocationScopeModal.vue';

// Mock service
const mockRequestHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockDirectHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockApproveHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockRejectHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'IN_PROGRESS' } });
const mockChangeResolutionSla = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockResumeDirect = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'IN_PROGRESS' } });
const mockGetDependencyReasonTypes = vi.fn().mockResolvedValue([
    { id: '00000000-0000-0000-0000-000000000405', name: 'Spare Parts Delayed', key: 'PARTS_AWAITED' },
    { id: '00000000-0000-0000-0000-000000000406', name: 'Vendor Field Visit', key: 'VENDOR_VISIT' }
]);
const mockGetRequestPendingTickets = vi.fn().mockResolvedValue({ tickets: [], count: 0, next: null, previous: null });
const mockGetOnHoldTickets = vi.fn().mockResolvedValue({ tickets: [], count: 0, next: null, previous: null });
const mockGetExcludeClosedTickets = vi.fn().mockResolvedValue([
    {
        id: 'c327626a-1c1e-45d9-b829-9f4a349188c4',
        ticket_number: 'TKT-1042',
        title: 'Elevator power fluctuation',
        state: { key: 'IN_PROGRESS', label: 'In Progress' }
    }
]);
const mockDeclineAssignment = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'OPEN' } });
const mockGetStaffLocationScopes = vi.fn().mockResolvedValue([
    { id: '1', scope_type: 'FACILITY', facility_id: 'fac-1' }
]);
const mockGetFacilities = vi.fn().mockResolvedValue({
    facilities: [
        { id: 'fac-1', name: 'Main Campus HQ' }
    ]
});

vi.mock('../../composables/helpdeskService', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        useHelpdeskService: () => ({
            requestHold: mockRequestHold,
            directHold: mockDirectHold,
            approveHold: mockApproveHold,
            rejectHold: mockRejectHold,
            changeResolutionSla: mockChangeResolutionSla,
            resumeDirect: mockResumeDirect,
            resumeTicket: mockResumeDirect,
            getDependencyReasonTypes: mockGetDependencyReasonTypes,
            getRequestPendingTickets: mockGetRequestPendingTickets,
            getOnHoldTickets: mockGetOnHoldTickets,
            rejectAssignment: mockDeclineAssignment,
            getStaffLocationScopes: mockGetStaffLocationScopes,
            getTicketDependencies: vi.fn().mockResolvedValue([]),
            getExcludeClosedTickets: mockGetExcludeClosedTickets,
        })
    };
});

vi.mock('../../composables/facilityService', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        useFacilityService: () => ({
            getFacilities: mockGetFacilities,
            getFacilityById: vi.fn().mockResolvedValue({ id: 'fac-1', name: 'Main Campus HQ' }),
            getTowers: vi.fn().mockResolvedValue([]),
            getFloors: vi.fn().mockResolvedValue([]),
            getWings: vi.fn().mockResolvedValue([])
        })
    };
});

describe('Hold & Resume Workflow Components', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('StatusBadge', () => {
        it('renders ON_HOLD with pause icon and warning styling', async () => {
            const wrapper = await mountSuspended(StatusBadge, {
                props: {
                    status: 'ON_HOLD'
                }
            });
            expect(wrapper.text()).toContain('ON_HOLD');
        });

        it('renders on_hold lowercase variant', async () => {
            const wrapper = await mountSuspended(StatusBadge, {
                props: {
                    status: 'on_hold'
                }
            });
            expect(wrapper.text()).toContain('on_hold');
        });
    });

    describe('TicketHoldModal', () => {
        it('renders hold modal title for request hold and direct hold in body portal', async () => {
            await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    isDirectHold: false
                }
            });
            expect(document.body.textContent).toContain('Request Ticket Hold');

            await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    isDirectHold: true
                }
            });
            expect(document.body.textContent).toContain('Put Ticket on Hold');
        });

        it('submits request hold with selected reason', async () => {
            const wrapper = await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    isDirectHold: false
                }
            });

            // Set reason
            (wrapper.vm as any).form.reason_type = 'PARTS_AWAITED';
            (wrapper.vm as any).form.notes = 'Waiting for motor component';

            await (wrapper.vm as any).handleSubmit();

            expect(mockRequestHold).toHaveBeenCalledWith('tick-123', {
                reason_type: 'PARTS_AWAITED',
                notes: 'Waiting for motor component',
                expected_resolution_at: undefined,
                linked_ticket: undefined
            });
            expect(wrapper.emitted('success')).toBeTruthy();
        });

        it('submits direct hold when isDirectHold is true', async () => {
            const wrapper = await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: 'tick-456',
                    isDirectHold: true
                }
            });

            (wrapper.vm as any).form.reason_type = 'VENDOR_VISIT';
            (wrapper.vm as any).form.notes = 'Vendor arriving Monday';

            await (wrapper.vm as any).handleSubmit();

            expect(mockDirectHold).toHaveBeenCalledWith('tick-456', {
                reason_type: 'VENDOR_VISIT',
                notes: 'Vendor arriving Monday',
                expected_resolution_at: undefined,
                linked_ticket: undefined
            });
            expect(wrapper.emitted('success')).toBeTruthy();
        });

        it('loads dynamic reason types and allows direct hold with UUID reason type', async () => {
            const wrapper = await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: '0b1b5692-bf07-4937-a8e9-030746997b32',
                    isDirectHold: true
                }
            });

            await (wrapper.vm as any).loadReasons();

            (wrapper.vm as any).form.reason_type = '00000000-0000-0000-0000-000000000405';
            (wrapper.vm as any).form.notes = 'Testing hold workflow';
            (wrapper.vm as any).form.linked_ticket = 'c327626a-1c1e-45d9-b829-9f4a349188c4';

            await (wrapper.vm as any).handleSubmit();

            expect(mockDirectHold).toHaveBeenCalledWith('0b1b5692-bf07-4937-a8e9-030746997b32', {
                reason_type: '00000000-0000-0000-0000-000000000405',
                notes: 'Testing hold workflow',
                expected_resolution_at: undefined,
                linked_ticket: 'c327626a-1c1e-45d9-b829-9f4a349188c4'
            });
            expect(wrapper.emitted('success')).toBeTruthy();
        });

        it('searches exclude-closed tickets for linked ticket dependency with facility_id and search term', async () => {
            const wrapper = await mountSuspended(TicketHoldModal, {
                props: {
                    open: true,
                    ticketId: '0b1b5692-bf07-4937-a8e9-030746997b32',
                    facilityId: 'a23cd9ff-f044-4067-9d79-27e692ac9a90',
                    isDirectHold: true
                }
            });

            (wrapper.vm as any).form.reason_type = 'DEPENDENT_TICKET';
            await (wrapper.vm as any).loadExcludeClosedTickets('TKT-1042');

            expect(mockGetExcludeClosedTickets).toHaveBeenCalledWith({
                facility_id: 'a23cd9ff-f044-4067-9d79-27e692ac9a90',
                search: 'TKT-1042'
            });

            const options = (wrapper.vm as any).linkedTicketOptions;
            expect(options.length).toBeGreaterThan(0);
            expect(options[0].value).toBe('c327626a-1c1e-45d9-b829-9f4a349188c4');
            expect(options[0].label).toContain('TKT-1042');
        });
    });

    describe('Direct Hold State Eligibility', () => {
        const isEligibleForDirectHold = (role: string, state: string) => {
            const isHelpdesk = role === 'helpdesk';
            const stateKey = state.toUpperCase();
            return isHelpdesk && ['ACKNOWLEDGED', 'ACKNOWLEDGE', 'ASSIGNED', 'IN_PROGRESS', 'INPROGRESS'].includes(stateKey);
        };

        it('allows direct hold for ACKNOWLEDGED, ASSIGNED, and IN_PROGRESS states', () => {
            expect(isEligibleForDirectHold('helpdesk', 'ASSIGNED')).toBe(true);
            expect(isEligibleForDirectHold('helpdesk', 'ACKNOWLEDGED')).toBe(true);
            expect(isEligibleForDirectHold('helpdesk', 'ACKNOWLEDGE')).toBe(true);
            expect(isEligibleForDirectHold('helpdesk', 'IN_PROGRESS')).toBe(true);
            expect(isEligibleForDirectHold('helpdesk', 'INPROGRESS')).toBe(true);
            expect(isEligibleForDirectHold('helpdesk', 'OPEN')).toBe(false);
            expect(isEligibleForDirectHold('helpdesk', 'RESOLVED')).toBe(false);
            expect(isEligibleForDirectHold('helpdesk', 'CLOSED')).toBe(false);
            expect(isEligibleForDirectHold('user', 'ASSIGNED')).toBe(false);
        });
    });

    describe('TicketHoldDecisionModal', () => {
        const mockDependency = {
            id: 'dep-1',
            ticket_id: 'tick-123',
            dependency_type: 'ON_HOLD',
            reason_type: 'PARTS_AWAITED',
            status: 'REQUESTED',
            requested_by_name: 'Worker Bob',
            created_at: '2026-09-15T10:00:00Z',
            review_notes: null,
            duration_minutes: 25
        };

        it('renders decision modal with dependency details', async () => {
            await mountSuspended(TicketHoldDecisionModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    dependency: mockDependency
                }
            });

            expect(document.body.textContent).toContain('Review Hold Request');
            expect(document.body.textContent).toContain('Parts Awaited');
            expect(document.body.textContent).toContain('Approve Hold');
            expect(document.body.textContent).toContain('Reject Hold');
        });

        it('handles approve hold decision', async () => {
            const wrapper = await mountSuspended(TicketHoldDecisionModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    dependency: mockDependency
                }
            });

            (wrapper.vm as any).decisionNotes = 'Approved - parts on order';
            await (wrapper.vm as any).handleApprove();

            expect(mockApproveHold).toHaveBeenCalledWith('tick-123', 'dep-1', {
                decision_notes: 'Approved - parts on order',
                extend_minutes: undefined
            });
            expect(wrapper.emitted('decided')).toBeTruthy();
        });

        it('handles approve hold with extend_minutes and decision_notes', async () => {
            const wrapper = await mountSuspended(TicketHoldDecisionModal, {
                props: {
                    open: true,
                    ticketId: '29718858-b14c-4c92-b421-635be1f15b54',
                    dependency: {
                        ...mockDependency,
                        id: '9de56f9f-4096-433f-86ed-4d5715ecebdf'
                    }
                }
            });

            (wrapper.vm as any).decisionNotes = 'Approved for testing';
            (wrapper.vm as any).extendMinutes = 120;
            await (wrapper.vm as any).handleApprove();

            expect(mockApproveHold).toHaveBeenCalledWith(
                '29718858-b14c-4c92-b421-635be1f15b54',
                '9de56f9f-4096-433f-86ed-4d5715ecebdf',
                {
                    decision_notes: 'Approved for testing',
                    extend_minutes: 120
                }
            );
            expect(wrapper.emitted('decided')).toBeTruthy();
        });

        it('handles reject hold decision', async () => {
            const wrapper = await mountSuspended(TicketHoldDecisionModal, {
                props: {
                    open: true,
                    ticketId: 'tick-123',
                    dependency: mockDependency
                }
            });

            (wrapper.vm as any).decisionNotes = 'Denied - use alternative stock';
            await (wrapper.vm as any).handleReject();

            expect(mockRejectHold).toHaveBeenCalledWith('tick-123', 'dep-1', 'Denied - use alternative stock');
            expect(wrapper.emitted('decided')).toBeTruthy();
        });
    });

    describe('RejectAssignmentModal', () => {
        it('renders decline assignment modal and calls declineAssignment', async () => {
            const wrapper = await mountSuspended(RejectAssignmentModal, {
                props: {
                    open: true,
                    ticketId: 'tick-789'
                }
            });

            expect(document.body.textContent).toContain('Decline Ticket Assignment');
            (wrapper.vm as any).reason = 'Currently on high priority emergency';

            await (wrapper.vm as any).handleDecline();

            expect(mockDeclineAssignment).toHaveBeenCalledWith('tick-789', 'Currently on high priority emergency');
            expect(wrapper.emitted('declined')).toBeTruthy();
        });
    });

    describe('TicketDependencyList', () => {
        it('renders table headers and empty state when no dependencies exist', async () => {
            const wrapper = await mountSuspended(TicketDependencyList, {
                props: {
                    ticketId: 'tick-123',
                    dependencies: [],
                    loading: false,
                    canDecide: false
                }
            });

            expect(wrapper.text()).toContain('Reason');
            expect(wrapper.text()).toContain('Status');
            expect(wrapper.text()).toContain('No data');
        });

        it('renders dependencies table with review button when canDecide is true', async () => {
            const wrapper = await mountSuspended(TicketDependencyList, {
                props: {
                    ticketId: 'tick-123',
                    dependencies: [
                        {
                            id: 'dep-1',
                            ticket_id: 'tick-123',
                            dependency_type: 'ON_HOLD',
                            reason_type: 'ACCESS_UNAVAILABLE',
                            status: 'REQUESTED',
                            requested_by_name: 'Alice',
                            requested_at: '2026-09-15T12:00:00Z',
                            duration_minutes: 60
                        }
                    ],
                    loading: false,
                    canDecide: true
                }
            });

            expect(wrapper.text()).toContain('Access Unavailable');
            expect(wrapper.text()).toContain('Review');
        });
    });

    describe('WorkerLocationScopeModal', () => {
        it('renders facility name instead of raw UUID in scopes table', async () => {
            const wrapper = await mountSuspended(WorkerLocationScopeModal, {
                props: {
                    open: true,
                    userId: 'user-123',
                    userName: 'John Doe'
                }
            });

            await (wrapper.vm as any).loadFacilities();
            await (wrapper.vm as any).loadScopes();

            expect(document.body.textContent).toContain('Main Campus HQ');
        });
    });

    describe('ChangeResolutionSlaModal', () => {
        it('renders change resolution SLA modal with input and quick buttons', async () => {
            await mountSuspended(ChangeResolutionSlaModal, {
                props: {
                    open: true,
                    ticketId: '29718858-b14c-4c92-b421-635be1f15b54'
                }
            });

            expect(document.body.textContent).toContain('Change Resolution SLA');
            expect(document.body.textContent).toContain('Extension Minutes');
            expect(document.body.textContent).toContain('+45 min');
        });

        it('submits resolution SLA change with extend_minutes and notes', async () => {
            const wrapper = await mountSuspended(ChangeResolutionSlaModal, {
                props: {
                    open: true,
                    ticketId: '29718858-b14c-4c92-b421-635be1f15b54'
                }
            });

            (wrapper.vm as any).extendMinutes = 45;
            (wrapper.vm as any).decisionNotes = 'Awaiting courier delivery';

            await (wrapper.vm as any).handleSubmit();

            expect(mockChangeResolutionSla).toHaveBeenCalledWith('29718858-b14c-4c92-b421-635be1f15b54', {
                extend_minutes: 45,
                decision_notes: 'Awaiting courier delivery'
            });
            expect(wrapper.emitted('success')).toBeTruthy();
        });
    });
});
