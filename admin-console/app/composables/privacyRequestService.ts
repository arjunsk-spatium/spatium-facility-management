export interface PrivacyRequestAuditLog {
    id: string
    action: string
    performed_by_id: string
    previous_status: string
    new_status: string
    metadata: Record<string, any>
    created_at: string
}

export interface PrivacyRequestExport {
    id: string
    status: string
    file_url?: string | null
    created_at?: string
}

export interface PrivacyRequest {
    id: string
    request_reference: string
    request_type: string
    request_type_display: string
    status: string
    status_display: string
    verification_status?: string
    verification_status_display?: string
    legal_basis?: string
    legal_basis_display?: string
    tenant_id: string
    requested_by_id: string
    assigned_to_id?: string | null
    description?: string
    admin_notes?: string
    resolution_notes?: string
    rejection_reason?: string
    requested_ip?: string
    user_agent?: string
    consent_confirmed?: boolean
    due_date?: string
    is_overdue?: boolean
    submitted_at?: string
    reviewed_at?: string | null
    completed_at?: string | null
    closed_at?: string | null
    created_at: string
    updated_at: string
    audit_logs?: PrivacyRequestAuditLog[]
    exports?: PrivacyRequestExport[]
}

export interface PrivacyRequestTask {
    id: string
    privacy_request_id: string
    task_type: string
    task_type_display: string
    status: string
    status_display: string
    created_by_id: string
    submitted_data?: Record<string, any>
    consent_type_codes?: string[]
    admin_review_notes?: string
    verification_url?: string | null
    verification_expires_at?: string | null
    verification_sent_at?: string | null
    verification_used_at?: string | null
    completed_at?: string | null
    created_at: string
    updated_at: string
}

export interface PrivacyRequestSummary {
    by_status: Record<string, number>
    by_type: Record<string, number>
    total: number
}

interface PrivacyApiResponse<T> {
    success: boolean
    code: string
    message: string
    data: T
    error: any
    meta: {
        request_id: string
        timestamp: string
    }
}

interface PrivacyPaginatedResponse<T> {
    count: number
    next: string | null
    previous: string | null
    results: T[]
}

export type PrivacyRequestListResponse = PrivacyApiResponse<PrivacyPaginatedResponse<PrivacyRequest>>
export type PrivacyRequestDetailResponse = PrivacyApiResponse<PrivacyRequest>
export type PrivacyRequestSummaryResponse = PrivacyApiResponse<PrivacyRequestSummary>
export type PrivacyTaskCreateResponse = PrivacyApiResponse<PrivacyRequestTask[]>
export type PublicTaskSubmitResponse = PrivacyApiResponse<{
    task_type: string
    task_type_display: string
    status: string
    status_display: string
    expires_at?: string
    current?: Record<string, any>
}>

export interface PrivacyRequestListParams {
    page?: number
    page_size?: number
    status?: string
    request_type?: string
    tenant_id?: string
    search?: string
    date_from?: string
    date_to?: string
}

export interface ReviewRequestPayload {
    notes?: string
}

export interface ApproveRequestPayload {
    admin_notes?: string
    notes?: string
}

export interface RejectRequestPayload {
    rejection_reason: string
    notes?: string
}

export interface CompleteRequestPayload {
    resolution_notes?: string
    notes?: string
}

export interface AssignRequestPayload {
    assignee_id: string
}

export interface CreatePrivacyTasksPayload {
    privacy_request_id: string
    task_types: string[]
    consent_type_codes?: string[]
}

export type PublicTaskSubmitPayload =
    | { confirmed: true }
    | { email: string }
    | { phone_number: string }

const BASE_PATH = '/api/platform/privacy/admin/requests'
const TASKS_PATH = '/api/platform/privacy/admin/tasks'
const PUBLIC_TASKS_PATH = '/api/platform/privacy/public/tasks'

export const usePrivacyRequestService = () => {
    const { request } = useApi()

    const getPrivacyRequests = async (
        params: PrivacyRequestListParams = {}
    ): Promise<PrivacyRequestListResponse> => {
        return request<PrivacyRequestListResponse>(`${BASE_PATH}/`, { method: 'GET', params })
    }

    const getPrivacyRequest = async (id: string): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/`, { method: 'GET' })
    }

    const getPrivacyRequestSummary = async (): Promise<PrivacyRequestSummaryResponse> => {
        return request<PrivacyRequestSummaryResponse>(`${BASE_PATH}/summary/`, { method: 'GET' })
    }

    const reviewRequest = async (
        id: string,
        payload: ReviewRequestPayload
    ): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/review/`, {
            method: 'POST',
            body: payload,
        })
    }

    const approveRequest = async (
        id: string,
        payload: ApproveRequestPayload
    ): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/approve/`, {
            method: 'POST',
            body: payload,
        })
    }

    const rejectRequest = async (
        id: string,
        payload: RejectRequestPayload
    ): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/reject/`, {
            method: 'POST',
            body: payload,
        })
    }

    const completeRequest = async (
        id: string,
        payload: CompleteRequestPayload
    ): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/complete/`, {
            method: 'POST',
            body: payload,
        })
    }

    const assignRequest = async (
        id: string,
        payload: AssignRequestPayload
    ): Promise<PrivacyRequestDetailResponse> => {
        return request<PrivacyRequestDetailResponse>(`${BASE_PATH}/${id}/assign/`, {
            method: 'POST',
            body: payload,
        })
    }

    const exportRequest = async (id: string): Promise<PrivacyApiResponse<{ export_id: string }>> => {
        return request<PrivacyApiResponse<{ export_id: string }>>(`${BASE_PATH}/${id}/export/`, {
            method: 'POST',
        })
    }

    const createPrivacyTasks = async (
        payload: CreatePrivacyTasksPayload
    ): Promise<PrivacyTaskCreateResponse> => {
        return request<PrivacyTaskCreateResponse>(`${TASKS_PATH}/`, {
            method: 'POST',
            body: payload,
        })
    }

    const submitPublicTask = async (
        token: string,
        payload: PublicTaskSubmitPayload
    ): Promise<PublicTaskSubmitResponse> => {
        return request<PublicTaskSubmitResponse>(`${PUBLIC_TASKS_PATH}/${token}/`, {
            method: 'POST',
            body: payload,
        })
    }

    return {
        getPrivacyRequests,
        getPrivacyRequest,
        getPrivacyRequestSummary,
        reviewRequest,
        approveRequest,
        rejectRequest,
        completeRequest,
        assignRequest,
        exportRequest,
        createPrivacyTasks,
        submitPublicTask,
    }
}
