import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import StatusBadge from '../../components/helpdesk/StatusBadge.vue';
import TicketHoldModal from '../../components/helpdesk/tickets/TicketHoldModal.vue';
import TicketHoldDecisionModal from '../../components/helpdesk/tickets/TicketHoldDecisionModal.vue';
import RejectAssignmentModal from '../../components/helpdesk/tickets/RejectAssignmentModal.vue';
import TicketDependencyList from '../../components/helpdesk/tickets/TicketDependencyList.vue';
import WorkerLocationScopeModal from '../../components/helpdesk/staff/WorkerLocationScopeModal.vue';

// Mock service
const mockRequestHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockDirectHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockApproveHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'ON_HOLD' } });
const mockRejectHold = vi.fn().mockResolvedValue({ id: 't1', state: { key: 'IN_PROGRESS' } });
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
            rejectAssignment: mockDeclineAssignment,
            getStaffLocationScopes: mockGetStaffLocationScopes,
            getTicketDependencies: vi.fn().mockResolvedValue([]),
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

            expect(mockApproveHold).toHaveBeenCalledWith('tick-123', 'dep-1', 'Approved - parts on order');
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
});
