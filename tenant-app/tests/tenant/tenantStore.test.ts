import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useTenantStore } from '../../stores/tenant';

// Mock tenantService
const mockGetTenantByDomain = vi.fn();
const mockGetTenantById = vi.fn();

vi.mock('../../composables/tenantService', () => ({
    useTenantService: () => ({
        getTenantByDomain: mockGetTenantByDomain,
        getTenantById: mockGetTenantById,
    })
}));

describe('useTenantStore with domain routing', () => {
    beforeEach(() => {
        setActivePinia(createPinia());
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('sets errorType to no_tenant_subdomain when on apex domain without tenant subdomain', async () => {
        // Set window.location to apex domain
        Object.defineProperty(window, 'location', {
            value: {
                host: 'nexspace.app',
                protocol: 'https:',
                href: 'https://nexspace.app',
            },
            writable: true,
        });

        const store = useTenantStore();
        await store.fetchTenantByDomain();

        expect(store.errorType).toBe('no_tenant_subdomain');
        expect(store.error).toBe('Subdomain required');
        expect(store.tenant).toBeNull();
        expect(store.domainInfo?.hasTenantSubdomain).toBe(false);
        // Does not make an unnecessary API call to backend
        expect(mockGetTenantByDomain).not.toHaveBeenCalled();
    });

    it('sets errorType to no_tenant_subdomain when on localhost without subdomain', async () => {
        Object.defineProperty(window, 'location', {
            value: {
                host: 'localhost:4000',
                protocol: 'http:',
                href: 'http://localhost:4000',
            },
            writable: true,
        });

        const store = useTenantStore();
        await store.fetchTenantByDomain();

        expect(store.errorType).toBe('no_tenant_subdomain');
        expect(mockGetTenantByDomain).not.toHaveBeenCalled();
    });

    it('loads tenant successfully when subdomain is registered', async () => {
        Object.defineProperty(window, 'location', {
            value: {
                host: 'acme.nexspace.app',
                protocol: 'https:',
                href: 'https://acme.nexspace.app',
            },
            writable: true,
        });

        mockGetTenantByDomain.mockResolvedValueOnce({
            tenant: {
                id: 'tenant-123',
                name: 'Acme Corp',
                logoUrl: 'https://acme.com/logo.png',
                colors: { primary: '#123456', secondary: '#654321' }
            },
            notRegistered: false
        });

        const store = useTenantStore();
        await store.fetchTenantByDomain();

        expect(store.errorType).toBeNull();
        expect(store.error).toBeNull();
        expect(store.tenant?.name).toBe('Acme Corp');
        expect(localStorage.getItem('tenant_id')).toBe('tenant-123');
        expect(mockGetTenantByDomain).toHaveBeenCalledWith('acme.nexspace.app');
    });

    it('sets errorType to tenant_not_registered when subdomain is not registered', async () => {
        Object.defineProperty(window, 'location', {
            value: {
                host: 'unknown-corp.nexspace.app',
                protocol: 'https:',
                href: 'https://unknown-corp.nexspace.app',
            },
            writable: true,
        });

        mockGetTenantByDomain.mockResolvedValueOnce({
            tenant: null,
            notRegistered: true
        });

        const store = useTenantStore();
        await store.fetchTenantByDomain();

        expect(store.errorType).toBe('tenant_not_registered');
        expect(store.error).toBe('Tenant not registered');
        expect(store.tenant).toBeNull();
    });

    it('sets errorType to fetch_error when API throws an error', async () => {
        Object.defineProperty(window, 'location', {
            value: {
                host: 'acme.nexspace.app',
                protocol: 'https:',
                href: 'https://acme.nexspace.app',
            },
            writable: true,
        });

        mockGetTenantByDomain.mockRejectedValueOnce(new Error('Network error'));

        const store = useTenantStore();
        await store.fetchTenantByDomain();

        expect(store.errorType).toBe('fetch_error');
        expect(store.tenant).toBeNull();
    });
});
