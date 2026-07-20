import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
    usePrivacyRequestService,
    type PrivacyRequest,
    type PrivacyRequestTask,
} from '../app/composables/privacyRequestService'

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

const mockTask: PrivacyRequestTask = {
    id: 'task-1',
    privacy_request_id: 'req-1',
    task_type: 'erase_personal_data',
    task_type_display: 'Erase Personal Data',
    status: 'waiting_customer_verification',
    status_display: 'Waiting for Customer Verification',
    created_by_id: 'admin-1',
    verification_url: 'abc123',
    created_at: '2026-06-29T12:03:04.593533Z',
    updated_at: '2026-06-29T12:03:04.631891Z',
}

const mockApiResponse = <T>(data: T, code = 'OK', message = 'Success') => ({
    success: true,
    code,
    message,
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-06-29T00:00:00Z' },
})

const mockRequestFn = vi.fn()

vi.mock('../app/composables/useApi', () => ({
    useApi: () => ({ request: mockRequestFn }),
}))

describe('Privacy Request Service', () => {
    const service = usePrivacyRequestService()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch privacy requests with params', async () => {
        mockRequestFn.mockResolvedValue(
            mockApiResponse({
                count: 1,
                next: null,
                previous: null,
                results: [mockRequest],
            })
        )

        const result = await service.getPrivacyRequests({ status: 'pending', page: 1, page_size: 10 })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/',
            expect.objectContaining({
                method: 'GET',
                params: { status: 'pending', page: 1, page_size: 10 },
            })
        )
        expect(result.data.results).toHaveLength(1)
        expect(result.data.results[0].id).toBe('req-1')
    })

    it('should fetch privacy request by id', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'ADMIN_PRIVACY_REQUEST_RETRIEVED'))

        const result = await service.getPrivacyRequest('req-1')

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/',
            expect.objectContaining({ method: 'GET' })
        )
        expect(result.data.id).toBe('req-1')
    })

    it('should fetch privacy request summary', async () => {
        mockRequestFn.mockResolvedValue(
            mockApiResponse(
                {
                    by_status: { pending: 1 },
                    by_type: { erasure: 1 },
                    total: 1,
                },
                'PRIVACY_SUMMARY_RETRIEVED'
            )
        )

        const result = await service.getPrivacyRequestSummary()

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/summary/',
            expect.objectContaining({ method: 'GET' })
        )
        expect(result.data.total).toBe(1)
    })

    it('should review a request', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'PRIVACY_REQUEST_UNDER_REVIEW'))

        await service.reviewRequest('req-1', { notes: 'Identity verified.' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/review/',
            expect.objectContaining({
                method: 'POST',
                body: { notes: 'Identity verified.' },
            })
        )
    })

    it('should approve a request', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'PRIVACY_REQUEST_APPROVED'))

        await service.approveRequest('req-1', { admin_notes: 'Confirmed', notes: 'Approved' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/approve/',
            expect.objectContaining({
                method: 'POST',
                body: { admin_notes: 'Confirmed', notes: 'Approved' },
            })
        )
    })

    it('should reject a request', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'PRIVACY_REQUEST_REJECTED'))

        await service.rejectRequest('req-1', { rejection_reason: 'Cannot verify identity', notes: 'No response' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/reject/',
            expect.objectContaining({
                method: 'POST',
                body: { rejection_reason: 'Cannot verify identity', notes: 'No response' },
            })
        )
    })

    it('should complete a request', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'PRIVACY_REQUEST_COMPLETED'))

        await service.completeRequest('req-1', { resolution_notes: 'Data deleted' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/complete/',
            expect.objectContaining({
                method: 'POST',
                body: { resolution_notes: 'Data deleted' },
            })
        )
    })

    it('should assign a request', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse(mockRequest, 'PRIVACY_REQUEST_ASSIGNED'))

        await service.assignRequest('req-1', { assignee_id: 'admin-2' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/assign/',
            expect.objectContaining({
                method: 'POST',
                body: { assignee_id: 'admin-2' },
            })
        )
    })

    it('should trigger export', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse({ export_id: 'export-1' }, 'PRIVACY_EXPORT_TRIGGERED'))

        const result = await service.exportRequest('req-1')

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/requests/req-1/export/',
            expect.objectContaining({ method: 'POST' })
        )
        expect(result.data.export_id).toBe('export-1')
    })

    it('should create privacy tasks', async () => {
        mockRequestFn.mockResolvedValue(mockApiResponse([mockTask], 'PRIVACY_TASKS_CREATED'))

        const result = await service.createPrivacyTasks({
            privacy_request_id: 'req-1',
            task_types: ['erase_personal_data'],
        })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/admin/tasks/',
            expect.objectContaining({
                method: 'POST',
                body: { privacy_request_id: 'req-1', task_types: ['erase_personal_data'] },
            })
        )
        expect(result.data).toHaveLength(1)
    })

    it('should submit public task with confirmed payload', async () => {
        mockRequestFn.mockResolvedValue(
            mockApiResponse(
                {
                    task_type: 'erase_personal_data',
                    task_type_display: 'Erase Personal Data',
                    status: 'completed',
                    status_display: 'Completed',
                },
                'PRIVACY_TASK_SUBMITTED'
            )
        )

        const result = await service.submitPublicTask('token-1', { confirmed: true })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/public/tasks/token-1/',
            expect.objectContaining({
                method: 'POST',
                body: { confirmed: true },
            })
        )
        expect(result.data.status).toBe('completed')
    })

    it('should submit public task with email payload', async () => {
        mockRequestFn.mockResolvedValue(
            mockApiResponse(
                {
                    task_type: 'update_email',
                    task_type_display: 'Update Email',
                    status: 'completed',
                    status_display: 'Completed',
                    current: { email: 'new@example.com' },
                },
                'PRIVACY_TASK_SUBMITTED'
            )
        )

        await service.submitPublicTask('token-2', { email: 'new@example.com' })

        expect(mockRequestFn).toHaveBeenCalledWith(
            '/api/platform/privacy/public/tasks/token-2/',
            expect.objectContaining({
                method: 'POST',
                body: { email: 'new@example.com' },
            })
        )
    })
})
