import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useBannerStore } from '../stores/banner'

const mockBanner = {
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

const mockGetBanners = vi.fn()
const mockGetBanner = vi.fn()
const mockCreateBanner = vi.fn()
const mockUpdateBanner = vi.fn()
const mockDeleteBanner = vi.fn()

vi.mock('../app/composables/bannerService', () => ({
    useBannerService: () => ({
        getBanners: mockGetBanners,
        getBanner: mockGetBanner,
        createBanner: mockCreateBanner,
        updateBanner: mockUpdateBanner,
        deleteBanner: mockDeleteBanner,
    })
}))

describe('Admin Banner Store', () => {
    beforeEach(() => {
        setActivePinia(createPinia())
        vi.clearAllMocks()
    })

    it('fetches banners with pagination', async () => {
        const store = useBannerStore()
        mockGetBanners.mockResolvedValue({ banners: [mockBanner], count: 1, next: null, previous: null })

        await store.fetchBanners({ page: 1, page_size: 10 })

        expect(store.banners).toHaveLength(1)
        expect(store.count).toBe(1)
        expect(store.page).toBe(1)
        expect(store.pageSize).toBe(10)
    })

    it('fetches single banner', async () => {
        const store = useBannerStore()
        mockGetBanner.mockResolvedValue(mockBanner)

        await store.fetchBanner('banner-1')

        expect(store.currentBanner).not.toBeNull()
        expect(store.currentBanner?.id).toBe('banner-1')
    })

    it('creates banner and adds to list', async () => {
        const store = useBannerStore()
        mockCreateBanner.mockResolvedValue(mockBanner)

        await store.createBanner({
            title: 'New Banner',
            description: 'Description',
            category: 'announcement',
            is_active: true,
            is_global: true,
        })

        expect(store.banners).toHaveLength(1)
        expect(store.count).toBe(1)
    })

    it('updates banner in list and current banner', async () => {
        const store = useBannerStore()
        store.banners = [{ ...mockBanner }]
        store.currentBanner = { ...mockBanner }
        const updated = { ...mockBanner, title: 'Updated Title' }
        mockUpdateBanner.mockResolvedValue(updated)

        await store.updateBanner('banner-1', { title: 'Updated Title' })

        expect(store.banners[0].title).toBe('Updated Title')
        expect(store.currentBanner?.title).toBe('Updated Title')
    })

    it('deletes banner and removes from list', async () => {
        const store = useBannerStore()
        store.banners = [{ ...mockBanner }]
        store.count = 1
        mockDeleteBanner.mockResolvedValue(true)

        await store.deleteBanner('banner-1')

        expect(store.banners).toHaveLength(0)
        expect(store.count).toBe(0)
    })

    it('calculates active banners getter', () => {
        const store = useBannerStore()
        store.banners = [
            { ...mockBanner, is_active: true },
            { ...mockBanner, id: 'banner-2', is_active: false },
        ]

        expect(store.activeBanners).toBe(1)
    })

    it('calculates global banners getter', () => {
        const store = useBannerStore()
        store.banners = [
            { ...mockBanner, is_global: true },
            { ...mockBanner, id: 'banner-2', is_global: false },
        ]

        expect(store.globalBanners).toBe(1)
    })

    it('groups banners by category', () => {
        const store = useBannerStore()
        store.banners = [
            { ...mockBanner, category: 'maintenance' },
            { ...mockBanner, id: 'banner-2', category: 'announcement' },
            { ...mockBanner, id: 'banner-3', category: 'maintenance' },
        ]

        expect(store.bannersByCategory.maintenance).toBe(2)
        expect(store.bannersByCategory.announcement).toBe(1)
    })
})
