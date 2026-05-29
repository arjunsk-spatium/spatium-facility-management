import { defineStore } from 'pinia';
import {
    useBannerService,
    type Banner,
    type BannerListParams,
    type CreateBannerPayload,
    type UpdateBannerPayload,
} from '../composables/bannerService';

export const useBannerStore = defineStore('banner', {
    state: () => ({
        banners: [] as Banner[],
        currentBanner: null as Banner | null,
        loading: false,
        error: null as string | null,
        // Pagination
        count: 0,
        page: 1,
        pageSize: 10,
        next: null as string | null,
        previous: null as string | null,
    }),
    getters: {
        totalBanners: (state) => state.count,
        hasNext: (state) => state.next !== null,
        hasPrevious: (state) => state.previous !== null,
    },
    actions: {
        async fetchBanners(params: BannerListParams = {}) {
            this.loading = true;
            this.error = null;
            try {
                const { getBanners } = useBannerService();
                const page = params.page ?? this.page;
                const page_size = params.page_size ?? this.pageSize;
                const result = await getBanners({
                    ...params,
                    page,
                    page_size,
                });
                this.banners = result.banners;
                this.count = result.count;
                this.next = result.next;
                this.previous = result.previous;
                this.page = page;
                this.pageSize = page_size;
            } catch (err: any) {
                console.error('[BannerStore] Error fetching banners:', err);
                this.error = 'Failed to fetch banners: ' + err.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchBanner(id: string) {
            this.loading = true;
            this.error = null;
            try {
                const { getBannerById } = useBannerService();
                this.currentBanner = await getBannerById(id);
            } catch (err) {
                this.error = 'Failed to fetch banner';
            } finally {
                this.loading = false;
            }
        },

        async createBannerAction(data: CreateBannerPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { createBanner } = useBannerService();
                const newBanner = await createBanner(data);
                this.banners.unshift(newBanner);
                this.count += 1;
                return newBanner;
            } catch (err) {
                this.error = 'Failed to create banner';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async updateBannerAction(id: string, data: UpdateBannerPayload) {
            this.loading = true;
            this.error = null;
            try {
                const { updateBanner } = useBannerService();
                const updated = await updateBanner(id, data);
                if (updated) {
                    const index = this.banners.findIndex((b) => b.id === id);
                    if (index !== -1) {
                        this.banners[index] = updated;
                    }
                    if (this.currentBanner?.id === id) {
                        this.currentBanner = updated;
                    }
                }
                return updated;
            } catch (err) {
                this.error = 'Failed to update banner';
                throw err;
            } finally {
                this.loading = false;
            }
        },

        async deleteBannerAction(id: string) {
            this.loading = true;
            this.error = null;
            try {
                const { deleteBanner } = useBannerService();
                await deleteBanner(id);
                this.banners = this.banners.filter((b) => b.id !== id);
                this.count -= 1;
                if (this.currentBanner?.id === id) {
                    this.currentBanner = null;
                }
            } catch (err) {
                this.error = 'Failed to delete banner';
                throw err;
            } finally {
                this.loading = false;
            }
        },
    },
});
