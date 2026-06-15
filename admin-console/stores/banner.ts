import { defineStore } from 'pinia'
import {
    useBannerService,
    type Banner,
    type BannerListParams,
    type CreateBannerPayload,
    type UpdateBannerPayload,
} from '../app/composables/bannerService'

export const useBannerStore = defineStore('banner', {
    state: () => ({
        banners: [] as Banner[],
        currentBanner: null as Banner | null,
        loading: false,
        error: null as string | null,
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),
    getters: {
        totalBanners: (state) => state.count,
        activeBanners: (state) => state.banners.filter((b) => b.is_active).length,
        globalBanners: (state) => state.banners.filter((b) => b.is_global).length,
        bannersByCategory: (state) => {
            return state.banners.reduce((acc, banner) => {
                const key = banner.category || 'uncategorized'
                acc[key] = (acc[key] || 0) + 1
                return acc
            }, {} as Record<string, number>)
        },
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },
    actions: {
        async fetchBanners(params: BannerListParams = {}) {
            this.loading = true
            this.error = null
            try {
                const { getBanners } = useBannerService()
                const page = params.page ?? this.page
                const page_size = params.page_size ?? this.pageSize
                const result = await getBanners({ ...params, page, page_size })
                this.banners = result.banners
                this.count = result.count
                this.next = result.next
                this.previous = result.previous
                this.page = page
                this.pageSize = page_size
            } catch (err: any) {
                this.error = 'Failed to fetch banners: ' + err.message
                console.error('[BannerStore] Error fetching banners:', err)
            } finally {
                this.loading = false
            }
        },

        async fetchBanner(id: string) {
            this.loading = true
            this.error = null
            try {
                const { getBanner } = useBannerService()
                this.currentBanner = await getBanner(id)
            } catch (err: any) {
                this.error = 'Failed to fetch banner: ' + err.message
                console.error('[BannerStore] Error fetching banner:', err)
            } finally {
                this.loading = false
            }
        },

        async createBanner(data: CreateBannerPayload) {
            this.loading = true
            this.error = null
            try {
                const { createBanner } = useBannerService()
                const newBanner = await createBanner(data)
                this.banners.unshift(newBanner)
                this.count += 1
                return newBanner
            } catch (err: any) {
                this.error = 'Failed to create banner: ' + err.message
                console.error('[BannerStore] Error creating banner:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async updateBanner(id: string, data: UpdateBannerPayload) {
            this.loading = true
            this.error = null
            try {
                const { updateBanner } = useBannerService()
                const updated = await updateBanner(id, data)
                const index = this.banners.findIndex((b) => b.id === id)
                if (index !== -1) {
                    this.banners[index] = updated
                }
                if (this.currentBanner?.id === id) {
                    this.currentBanner = updated
                }
                return updated
            } catch (err: any) {
                this.error = 'Failed to update banner: ' + err.message
                console.error('[BannerStore] Error updating banner:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async deleteBanner(id: string) {
            this.loading = true
            this.error = null
            try {
                const { deleteBanner } = useBannerService()
                const success = await deleteBanner(id)
                if (success) {
                    this.banners = this.banners.filter((b) => b.id !== id)
                    this.count = Math.max(0, this.count - 1)
                    if (this.currentBanner?.id === id) {
                        this.currentBanner = null
                    }
                    return true
                }
                throw new Error('Failed to delete banner')
            } catch (err: any) {
                this.error = 'Failed to delete banner: ' + err.message
                console.error('[BannerStore] Error deleting banner:', err)
                throw err
            } finally {
                this.loading = false
            }
        },

        async goToPage(page: number) {
            await this.fetchBanners({ page })
        },
    },
})
