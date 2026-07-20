import { defineStore } from 'pinia'
import {
    usePrivacyRequestService,
    type PrivacyRequest,
    type PrivacyRequestListParams,
    type PrivacyRequestSummary,
    type ReviewRequestPayload,
    type ApproveRequestPayload,
    type RejectRequestPayload,
    type CompleteRequestPayload,
    type AssignRequestPayload,
    type CreatePrivacyTasksPayload,
} from '../app/composables/privacyRequestService'

export const usePrivacyRequestStore = defineStore('privacyRequest', {
    state: () => ({
        requests: [] as PrivacyRequest[],
        currentRequest: null as PrivacyRequest | null,
        summary: null as PrivacyRequestSummary | null,
        loading: false,
        error: null as string | null,
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),

    getters: {
        totalRequests: (state) => state.count,
        pendingCount: (state) => state.summary?.by_status?.pending ?? 0,
        requestsByType: (state) => state.summary?.by_type ?? {},
        requestsByStatus: (state) => state.summary?.by_status ?? {},
    },

    actions: {
        async fetchRequests(params: PrivacyRequestListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getPrivacyRequests } = usePrivacyRequestService()
                const page = params.page ?? this.page
                const page_size = params.page_size ?? this.pageSize
                const response = await getPrivacyRequests({ ...params, page, page_size })

                if (response?.success && response.data) {
                    this.requests = response.data.results
                    this.count = response.data.count
                    this.next = response.data.next
                    this.previous = response.data.previous
                    this.page = page
                    this.pageSize = page_size
                } else {
                    throw new Error(response?.message || 'Failed to fetch privacy requests')
                }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch privacy requests'
                console.error('[PrivacyRequestStore] Error fetching requests:', err)
            } finally {
                this.loading = false
            }
        },

        async fetchRequest(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getPrivacyRequest } = usePrivacyRequestService()
                const response = await getPrivacyRequest(id)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                } else {
                    throw new Error(response?.message || 'Failed to fetch privacy request')
                }
            } catch (err: any) {
                this.error = err.message || 'Failed to fetch privacy request'
                console.error('[PrivacyRequestStore] Error fetching request:', err)
            } finally {
                this.loading = false
            }
        },

        async fetchSummary() {
            try {
                const { getPrivacyRequestSummary } = usePrivacyRequestService()
                const response = await getPrivacyRequestSummary()

                if (response?.success && response.data) {
                    this.summary = response.data
                }
            } catch (err: any) {
                console.error('[PrivacyRequestStore] Error fetching summary:', err)
            }
        },

        async reviewRequest(id: string, payload: ReviewRequestPayload) {
            this.loading = true
            this.error = null
            try {
                const { reviewRequest } = usePrivacyRequestService()
                const response = await reviewRequest(id, payload)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                    this.refreshRequestInList(response.data)
                    return response.data
                }
                throw new Error(response?.message || 'Failed to move request to review')
            } catch (err: any) {
                this.error = err.message || 'Failed to move request to review'
                console.error('[PrivacyRequestStore] Error reviewing request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async approveRequest(id: string, payload: ApproveRequestPayload) {
            this.loading = true
            this.error = null
            try {
                const { approveRequest } = usePrivacyRequestService()
                const response = await approveRequest(id, payload)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                    this.refreshRequestInList(response.data)
                    return response.data
                }
                throw new Error(response?.message || 'Failed to approve request')
            } catch (err: any) {
                this.error = err.message || 'Failed to approve request'
                console.error('[PrivacyRequestStore] Error approving request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async rejectRequest(id: string, payload: RejectRequestPayload) {
            this.loading = true
            this.error = null
            try {
                const { rejectRequest } = usePrivacyRequestService()
                const response = await rejectRequest(id, payload)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                    this.refreshRequestInList(response.data)
                    return response.data
                }
                throw new Error(response?.message || 'Failed to reject request')
            } catch (err: any) {
                this.error = err.message || 'Failed to reject request'
                console.error('[PrivacyRequestStore] Error rejecting request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async completeRequest(id: string, payload: CompleteRequestPayload) {
            this.loading = true
            this.error = null
            try {
                const { completeRequest } = usePrivacyRequestService()
                const response = await completeRequest(id, payload)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                    this.refreshRequestInList(response.data)
                    return response.data
                }
                throw new Error(response?.message || 'Failed to complete request')
            } catch (err: any) {
                this.error = err.message || 'Failed to complete request'
                console.error('[PrivacyRequestStore] Error completing request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async assignRequest(id: string, payload: AssignRequestPayload) {
            this.loading = true
            this.error = null
            try {
                const { assignRequest } = usePrivacyRequestService()
                const response = await assignRequest(id, payload)

                if (response?.success && response.data) {
                    this.currentRequest = response.data
                    this.refreshRequestInList(response.data)
                    return response.data
                }
                throw new Error(response?.message || 'Failed to assign request')
            } catch (err: any) {
                this.error = err.message || 'Failed to assign request'
                console.error('[PrivacyRequestStore] Error assigning request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async exportRequest(id: string) {
            this.loading = true
            this.error = null
            try {
                const { exportRequest } = usePrivacyRequestService()
                const response = await exportRequest(id)

                if (response?.success && response.data) {
                    return response.data
                }
                throw new Error(response?.message || 'Failed to trigger export')
            } catch (err: any) {
                this.error = err.message || 'Failed to trigger export'
                console.error('[PrivacyRequestStore] Error exporting request:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async createTasks(payload: CreatePrivacyTasksPayload) {
            this.loading = true
            this.error = null
            try {
                const { createPrivacyTasks } = usePrivacyRequestService()
                const response = await createPrivacyTasks(payload)

                if (response?.success && response.data) {
                    return response.data
                }
                throw new Error(response?.message || 'Failed to create tasks')
            } catch (err: any) {
                this.error = err.message || 'Failed to create tasks'
                console.error('[PrivacyRequestStore] Error creating tasks:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        refreshRequestInList(updated: PrivacyRequest) {
            const index = this.requests.findIndex((r) => r.id === updated.id)
            if (index !== -1) {
                this.requests[index] = updated
            }
        },

        async goToPage(page: number, pageSize?: number) {
            await this.fetchRequests({ page, page_size: pageSize })
        },
    },
})
