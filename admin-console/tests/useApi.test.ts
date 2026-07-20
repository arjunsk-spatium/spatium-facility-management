import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useApi } from '../app/composables/useApi'

const mockRequest = vi.fn()
const mockRefreshTokenAction = vi.fn()
const mockLogout = vi.fn()

const authStoreState = {
    refreshToken: 'refresh-token',
    token: 'new-access-token',
    refreshTokenAction: mockRefreshTokenAction,
    logout: mockLogout,
}

vi.mock('../stores/auth', () => ({
    useAuthStore: () => authStoreState
}))

vi.mock('nuxt/app', () => ({
    useNuxtApp: () => ({
        $api: mockRequest
    }),
    useRuntimeConfig: () => ({
        public: {
            apiBaseUrl: 'http://localhost:8000'
        }
    })
}))

describe('useApi', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        authStoreState.refreshToken = 'refresh-token'
        authStoreState.token = 'new-access-token'
    })

    it('should logout when token refresh fails on 401', async () => {
        const error = new Error('Unauthorized') as any
        error.response = { status: 401 }
        mockRequest.mockRejectedValueOnce(error)
        mockRefreshTokenAction.mockResolvedValue(false)

        const { request } = useApi()

        await expect(request('/test')).rejects.toThrow('Unauthorized')
        expect(mockRefreshTokenAction).toHaveBeenCalled()
        expect(mockLogout).toHaveBeenCalled()
    })

    it('should logout when there is no refresh token on 401', async () => {
        authStoreState.refreshToken = null

        const error = new Error('Unauthorized') as any
        error.response = { status: 401 }
        mockRequest.mockRejectedValueOnce(error)

        const { request } = useApi()

        await expect(request('/test')).rejects.toThrow('Unauthorized')
        expect(mockRefreshTokenAction).not.toHaveBeenCalled()
        expect(mockLogout).toHaveBeenCalled()
    })

    it('should retry request with new token when refresh succeeds', async () => {
        const error = new Error('Unauthorized') as any
        error.response = { status: 401 }
        mockRequest
            .mockRejectedValueOnce(error)
            .mockResolvedValueOnce({ success: true, data: 'ok' })

        mockRefreshTokenAction.mockResolvedValue(true)

        const { request } = useApi()
        const result = await request('/test')

        expect(result).toEqual({ success: true, data: 'ok' })
        expect(mockRequest).toHaveBeenCalledTimes(2)
        expect(mockLogout).not.toHaveBeenCalled()

        const retryOptions = mockRequest.mock.calls[1][1]
        expect(retryOptions.headers).toMatchObject({
            Authorization: 'Bearer new-access-token'
        })
    })

    it('should not attempt refresh for non-401 errors', async () => {
        const error = new Error('Bad Request') as any
        error.response = { status: 400 }
        mockRequest.mockRejectedValueOnce(error)

        const { request } = useApi()

        await expect(request('/test')).rejects.toThrow('Bad Request')
        expect(mockRefreshTokenAction).not.toHaveBeenCalled()
        expect(mockLogout).not.toHaveBeenCalled()
    })
})
