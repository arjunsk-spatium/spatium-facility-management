import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useBannerService, type Banner } from '../app/composables/bannerService'

const mockBanner: Banner = {
    id: 'banner-1',
    title: 'Platform-wide Maintenance',
    description: 'Scheduled downtime on Sunday 2AM-4AM.',
    image: 'https://example.com/image.jpeg',
    image_url: 'https://example.com/image.jpeg',
    category: 'maintenance',
    is_active: true,
    link: null,
    is_global: true,
    tenant: null,
    is_archive: false,
    created_at: '2026-05-29T06:56:56.597136Z',
    updated_at: '2026-05-29T06:56:56.597189Z',
}

const mockApiResponse = <T>(data: T, code = 'OK') => ({
    success: true,
    code,
    message: 'Success',
    data,
    error: null,
    meta: { request_id: 'test-req-id', timestamp: '2026-05-29T00:00:00Z' },
})

const mockRequest = vi.fn()

vi.mock('../app/composables/useApi', () => ({
    useApi: () => ({
        request: mockRequest
    })
}))

describe('Admin Banner Service', () => {
    const service = useBannerService()

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should fetch banners with pagination', async () => {
        mockRequest.mockResolvedValue(mockApiResponse({
            count: 1,
            next: null,
            previous: null,
            results: [mockBanner]
        }))

        const result = await service.getBanners({ page: 1, page_size: 10 })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/',
            expect.objectContaining({ method: 'GET', params: { page: 1, page_size: 10 } })
        )
        expect(result.banners).toHaveLength(1)
        expect(result.count).toBe(1)
        expect(result.banners[0].id).toBe('banner-1')
    })

    it('should fetch banner by id', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockBanner, 'BANNER_RETRIEVED'))

        const result = await service.getBanner('banner-1')

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/banner-1/',
            expect.objectContaining({ method: 'GET' })
        )
        expect(result?.id).toBe('banner-1')
    })

    it('should create banner with JSON payload', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockBanner, 'BANNER_CREATED'))

        const result = await service.createBanner({
            title: 'Platform-wide Maintenance',
            description: 'Scheduled downtime on Sunday 2AM-4AM.',
            category: 'maintenance',
            is_active: true,
            is_global: true,
        })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/',
            expect.objectContaining({
                method: 'POST',
                body: expect.objectContaining({
                    title: 'Platform-wide Maintenance',
                    is_active: true,
                    is_global: true,
                })
            })
        )
        expect(result.id).toBe('banner-1')
    })

    it('should create banner with FormData when image is provided', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockBanner, 'BANNER_CREATED'))
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

        const result = await service.createBanner({
            title: 'Platform-wide Maintenance',
            description: 'Scheduled downtime on Sunday 2AM-4AM.',
            category: 'maintenance',
            is_active: true,
            is_global: false,
            link: 'https://example.com',
            image: file,
            tenant: ['tenant-1', 'tenant-2'],
        })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/',
            expect.objectContaining({ method: 'POST', body: expect.any(FormData) })
        )

        const callArgs = mockRequest.mock.calls[0][1]
        const formData = callArgs.body as FormData
        expect(formData.get('title')).toBe('Platform-wide Maintenance')
        expect(formData.get('is_active')).toBe('true')
        expect(formData.get('is_global')).toBe('false')
        expect(formData.get('link')).toBe('https://example.com')
        expect(formData.get('image')).toBeInstanceOf(File)
        expect(formData.getAll('tenant')).toEqual(['tenant-1', 'tenant-2'])
        expect(result.id).toBe('banner-1')
    })

    it('should update banner with JSON payload', async () => {
        mockRequest.mockResolvedValue(mockApiResponse({ ...mockBanner, title: 'Updated' }, 'BANNER_UPDATED'))

        const result = await service.updateBanner('banner-1', {
            title: 'Updated',
            is_active: false,
            tenant: ['tenant-1'],
        })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/banner-1/',
            expect.objectContaining({
                method: 'PATCH',
                body: expect.objectContaining({ title: 'Updated', is_active: false, tenant: ['tenant-1'] })
            })
        )
        expect(result.title).toBe('Updated')
    })

    it('should update banner with FormData when image is provided', async () => {
        mockRequest.mockResolvedValue(mockApiResponse(mockBanner, 'BANNER_UPDATED'))
        const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' })

        const result = await service.updateBanner('banner-1', { image: file })

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/banner-1/',
            expect.objectContaining({ method: 'PATCH', body: expect.any(FormData) })
        )

        const callArgs = mockRequest.mock.calls[0][1]
        const formData = callArgs.body as FormData
        expect(formData.get('image')).toBeInstanceOf(File)
        expect(result.id).toBe('banner-1')
    })

    it('should delete a banner', async () => {
        mockRequest.mockResolvedValue({ success: true })

        const result = await service.deleteBanner('banner-1')

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/banners/banner-1/',
            expect.objectContaining({ method: 'DELETE' })
        )
        expect(result).toBe(true)
    })
})
