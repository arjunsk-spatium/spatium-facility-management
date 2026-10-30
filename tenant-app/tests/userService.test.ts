import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useUserService } from '../composables/userService'

const mockApiResponse = <T,>(data: T) => ({
    success: true,
    code: 'OK',
    message: 'Success',
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-06-01T00:00:00Z' },
})

vi.mock('nuxt/app', () => ({
    useNuxtApp: () => ({
        $api: vi.fn()
    }),
    useRuntimeConfig: () => ({
        public: { apiBaseUrl: 'http://localhost:8000' }
    })
}))

describe('User Service', () => {
    const service = useUserService()
    let originalFetch: typeof global.fetch
    const mockFetch = vi.fn()

    beforeEach(() => {
        vi.clearAllMocks()
        originalFetch = global.fetch
        global.fetch = mockFetch
        if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', 'fake-token')
            localStorage.setItem('tenant_id', 'test-tenant')
        }
    })

    afterEach(() => {
        global.fetch = originalFetch
    })

    it('should create a user', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({
                id: 'user-1',
                full_name: 'Test User',
                email: 'test@example.com',
                phone_number: '+91 98765 43210',
                apps: ['Hub'],
                status: 'active',
                tenant_id: 'tenant-1',
                created_at: '2026-06-01T00:00:00Z'
            })
        })

        const result = await service.createUser({
            name: 'Test User',
            email: 'test@example.com',
            phone: '+91 98765 43210'
        })

        expect(result.id).toBe('user-1')
        expect(result.name).toBe('Test User')
        expect(result.email).toBe('test@example.com')
    })

    it('should throw a readable error for email already exists in different tenant', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 400,
            json: async () => ({
                success: false,
                code: 'USER_CREATION_ERROR',
                message: 'Failed to create user.',
                data: null,
                error: {
                    type: 'VALIDATION_ERROR',
                    fields: {
                        email: [{
                            code: 'INVALID',
                            message: 'User already exists in a different tenant.'
                        }]
                    }
                },
                meta: { request_id: 'test-req-id', timestamp: '2026-06-01T00:00:00Z' }
            })
        })

        await expect(service.createUser({
            name: 'Test User',
            email: 'test@example.com',
            phone: '+91 98765 43210'
        })).rejects.toThrow('User already exists in a different tenant.')
    })

    it('should throw a readable error for generic failures', async () => {
        mockFetch.mockResolvedValue({
            ok: false,
            status: 500,
            json: async () => ({
                success: false,
                code: 'INTERNAL_ERROR',
                message: 'Something went wrong',
                data: null,
                error: null,
                meta: { request_id: 'test-req-id', timestamp: '2026-06-01T00:00:00Z' }
            })
        })

        await expect(service.createUser({
            name: 'Test User',
            email: 'test@example.com',
            phone: '+91 98765 43210'
        })).rejects.toThrow('Something went wrong')
    })

    it('should get user facilities', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({
                user_id: 'user-1',
                facility_ids: ['fac-1', 'fac-2'],
                is_all_facilities: false
            })
        })

        const result = await service.getUserFacilities('user-1')
        expect(result.facility_ids).toEqual(['fac-1', 'fac-2'])
        expect(result.is_all_facilities).toBe(false)
    })

    it('should assign user facilities', async () => {
        mockFetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => mockApiResponse({ success: true })
        })

        const result = await service.assignUserFacilities('user-1', {
            facility_ids: ['fac-1'],
            is_all_facilities: true
        })

        expect(result).toBe(true)
    })
})
