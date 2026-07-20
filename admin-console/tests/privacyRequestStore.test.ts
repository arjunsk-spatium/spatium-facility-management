import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePrivacyRequestStore } from '../stores/privacyRequest'
import type { PrivacyRequest, PrivacyRequestSummary } from '../app/composables/privacyRequestService'

const mockService = {
    getPrivacyRequests: vi.fn(),
    getPrivacyRequest: vi.fn(),
    getPrivacyRequestSummary: vi.fn(),
    reviewRequest: vi.fn(),
    approveRequest: vi.fn(),
    rejectRequest: vi.fn(),
    completeRequest: vi.fn(),
    assignRequest: vi.fn(),
    exportRequest: vi.fn(),
    createPrivacyTasks: vi.fn(),
}

vi.mock('../app/composables/privacyRequestService', () => ({
    usePrivacyRequestService: () => mockService,
}))

const ok = <T>(data: T, code = 'OK', message = 'Success') => ({
    success: true,
    code,
    message,
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-06-29T00:00:00Z' },
})

const mockRequest: PrivacyRequest = {
    id: 'req-1',
    request_reference: 'PRIV06260001',
    request_type: 'erasure',
    request_type_display: 'Delete My Personal Data',
    status: 'pending',
    status_display: 'Pending',
    tenant_id: 'tenant-1',
    requested_by_id: 'user-1',
    assigned_to_id: null,
    description: 'Please delete all my data.',
    due_date: '2026-07-02',
    is_overdue: false,
    submitted_at: '2026-06-02T06:31:07.330356Z',
    created_at: '2026-06-02T06:31:07.330007Z',
    updated_at: '2026-06-02T06:31:07.330007Z',
}

const mockSummary: PrivacyRequestSummary = {
    by_status: {
        pending: 1,
        under_review: 0,
        approved: 0,
        rejected: 0,
        completed: 0,
    },
    by_type: {
        erasure: 1,
        data_portability: 0,
        access: 0,
        rectification: 0,
        restrict_processing: 0,
        withdraw_consent: 0,
        update_email: 0,
        update_phone_number: 0,
    },
    total: 1,
}

describe('Privacy Request Store', () => {
    let store: ReturnType<typeof usePrivacyRequestStore>

    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
        store = usePrivacyRequestStore()
    })

    it('initializes with empty state', () => {
        expect(store.requests).toEqual([])
        expect(store.currentRequest).toBeNull()
        expect(store.summary).toBeNull()
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    it('fetches requests and sets state', async () => {
        mockService.getPrivacyRequests.mockResolvedValue(
            ok({
                count: 1,
                next: null,
                previous: null,
                results: [mockRequest],
            })
        )

        await store.fetchRequests({ status: 'pending', page: 1, page_size: 10 })

        expect(mockService.getPrivacyRequests).toHaveBeenCalledWith({ status: 'pending', page: 1, page_size: 10 })
        expect(store.requests).toHaveLength(1)
        expect(store.count).toBe(1)
        expect(store.loading).toBe(false)
        expect(store.error).toBeNull()
    })

    it('handles fetch requests error', async () => {
        mockService.getPrivacyRequests.mockRejectedValue(new Error('Network error'))

        await store.fetchRequests({ page: 1, page_size: 10 })

        expect(store.requests).toEqual([])
        expect(store.error).toBe('Network error')
        expect(store.loading).toBe(false)
    })

    it('fetches request detail', async () => {
        mockService.getPrivacyRequest.mockResolvedValue(ok(mockRequest, 'ADMIN_PRIVACY_REQUEST_RETRIEVED'))

        await store.fetchRequest('req-1')

        expect(mockService.getPrivacyRequest).toHaveBeenCalledWith('req-1')
        expect(store.currentRequest?.id).toBe('req-1')
    })

    it('fetches summary', async () => {
        mockService.getPrivacyRequestSummary.mockResolvedValue(ok(mockSummary, 'PRIVACY_SUMMARY_RETRIEVED'))

        await store.fetchSummary()

        expect(store.summary?.total).toBe(1)
        expect(store.pendingCount).toBe(1)
        expect(store.requestsByType.erasure).toBe(1)
    })

    it('approves a request', async () => {
        mockService.approveRequest.mockResolvedValue(ok({ ...mockRequest, status: 'approved' }, 'PRIVACY_REQUEST_APPROVED'))

        const result = await store.approveRequest('req-1', { admin_notes: 'Confirmed' })

        expect(mockService.approveRequest).toHaveBeenCalledWith('req-1', { admin_notes: 'Confirmed' })
        expect(result.status).toBe('approved')
        expect(store.currentRequest?.status).toBe('approved')
    })

    it('rejects a request', async () => {
        mockService.rejectRequest.mockResolvedValue(ok({ ...mockRequest, status: 'rejected' }, 'PRIVACY_REQUEST_REJECTED'))

        await store.rejectRequest('req-1', { rejection_reason: 'Cannot verify identity' })

        expect(mockService.rejectRequest).toHaveBeenCalledWith('req-1', {
            rejection_reason: 'Cannot verify identity',
        })
        expect(store.currentRequest?.status).toBe('rejected')
    })

    it('completes a request', async () => {
        mockService.completeRequest.mockResolvedValue(ok({ ...mockRequest, status: 'completed' }, 'PRIVACY_REQUEST_COMPLETED'))

        await store.completeRequest('req-1', { resolution_notes: 'Done' })

        expect(mockService.completeRequest).toHaveBeenCalledWith('req-1', { resolution_notes: 'Done' })
        expect(store.currentRequest?.status).toBe('completed')
    })

    it('assigns a request', async () => {
        mockService.assignRequest.mockResolvedValue(
            ok({ ...mockRequest, assigned_to_id: 'admin-2' }, 'PRIVACY_REQUEST_ASSIGNED')
        )

        await store.assignRequest('req-1', { assignee_id: 'admin-2' })

        expect(mockService.assignRequest).toHaveBeenCalledWith('req-1', { assignee_id: 'admin-2' })
        expect(store.currentRequest?.assigned_to_id).toBe('admin-2')
    })

    it('exports a request', async () => {
        mockService.exportRequest.mockResolvedValue(ok({ export_id: 'export-1' }, 'PRIVACY_EXPORT_TRIGGERED'))

        const result = await store.exportRequest('req-1')

        expect(mockService.exportRequest).toHaveBeenCalledWith('req-1')
        expect(result.export_id).toBe('export-1')
    })

    it('creates tasks', async () => {
        mockService.createPrivacyTasks.mockResolvedValue(
            ok([{ id: 'task-1', privacy_request_id: 'req-1', task_type: 'erase_personal_data' }], 'PRIVACY_TASKS_CREATED')
        )

        const result = await store.createTasks({
            privacy_request_id: 'req-1',
            task_types: ['erase_personal_data'],
        })

        expect(mockService.createPrivacyTasks).toHaveBeenCalledWith({
            privacy_request_id: 'req-1',
            task_types: ['erase_personal_data'],
        })
        expect(result).toHaveLength(1)
    })
})
