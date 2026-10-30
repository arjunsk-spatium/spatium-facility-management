import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useTenantService, type TenantFeature } from '../app/composables/tenantService';

const mockRequest = vi.fn();

vi.mock('../app/composables/useApi', () => ({
    useApi: () => ({
        request: mockRequest
    })
}));

describe('Tenant Feature Service', () => {
    const service = useTenantService();

    const mockFeature: TenantFeature = {
        id: 'tf-1',
        tenant: 'tenant-123',
        feature: 'f0000000-0000-0000-0000-000000000001',
        feature_name: 'ScopeLadder Dispatch',
        feature_key: 'scope_ladder_dispatch',
        submodule_name: 'Helpdesk',
        is_active: true,
        created_at: '2026-09-17T12:00:00Z',
        updated_at: '2026-09-17T12:00:00Z',
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should list tenant features with tenant_id filter', async () => {
        mockRequest.mockResolvedValue({
            success: true,
            data: { results: [mockFeature] }
        });

        const res = await service.getTenantFeatures('tenant-123');

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/modules/tenant-features/?tenant_id=tenant-123',
            expect.objectContaining({ method: 'GET' })
        );
        expect(res.data.results[0].feature_key).toBe('scope_ladder_dispatch');
    });

    it('should list all tenant features when tenant_id is omitted', async () => {
        mockRequest.mockResolvedValue({
            success: true,
            data: { results: [mockFeature] }
        });

        await service.getTenantFeatures();

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/modules/tenant-features/',
            expect.objectContaining({ method: 'GET' })
        );
    });

    it('should create a single tenant feature assignment via POST', async () => {
        mockRequest.mockResolvedValue(mockFeature);

        const result = await service.createTenantFeature({
            tenant: 'tenant-123',
            feature: 'f0000000-0000-0000-0000-000000000001',
            is_active: true
        });

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/modules/tenant-features/',
            {
                method: 'POST',
                body: {
                    tenant: 'tenant-123',
                    feature: 'f0000000-0000-0000-0000-000000000001',
                    is_active: true
                }
            }
        );
        expect(result.feature_key).toBe('scope_ladder_dispatch');
    });

    it('should update tenant feature status via PATCH', async () => {
        const updatedFeature = { ...mockFeature, is_active: false };
        mockRequest.mockResolvedValue(updatedFeature);

        const result = await service.updateTenantFeature('tf-1', { is_active: false });

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/modules/tenant-features/tf-1/',
            {
                method: 'PATCH',
                body: { is_active: false }
            }
        );
        expect(result.is_active).toBe(false);
    });

    it('should delete a tenant feature assignment via DELETE', async () => {
        mockRequest.mockResolvedValue({ success: true });

        await service.deleteTenantFeature('tf-1');

        expect(mockRequest).toHaveBeenCalledWith(
            '/api/platform/modules/tenant-features/tf-1/',
            { method: 'DELETE' }
        );
    });

    describe('toggleTenantFeature', () => {
        it('should call PATCH directly when existingAssignmentId is provided', async () => {
            mockRequest.mockResolvedValue({ ...mockFeature, is_active: false });

            await service.toggleTenantFeature(
                'tenant-123',
                'f0000000-0000-0000-0000-000000000001',
                false,
                'tf-1'
            );

            expect(mockRequest).toHaveBeenCalledWith(
                '/api/platform/modules/tenant-features/tf-1/',
                {
                    method: 'PATCH',
                    body: { is_active: false }
                }
            );
        });

        it('should lookup assignments and PATCH if found when existingAssignmentId is not provided', async () => {
            // First call: GET list
            mockRequest.mockResolvedValueOnce({
                data: { results: [mockFeature] }
            });
            // Second call: PATCH
            mockRequest.mockResolvedValueOnce({ ...mockFeature, is_active: false });

            await service.toggleTenantFeature(
                'tenant-123',
                'f0000000-0000-0000-0000-000000000001',
                false
            );

            expect(mockRequest).toHaveBeenNthCalledWith(
                1,
                '/api/platform/modules/tenant-features/?tenant_id=tenant-123',
                expect.objectContaining({ method: 'GET' })
            );
            expect(mockRequest).toHaveBeenNthCalledWith(
                2,
                '/api/platform/modules/tenant-features/tf-1/',
                {
                    method: 'PATCH',
                    body: { is_active: false }
                }
            );
        });

        it('should lookup assignments and POST if not found', async () => {
            // First call: GET list returning empty
            mockRequest.mockResolvedValueOnce({
                data: { results: [] }
            });
            // Second call: POST
            mockRequest.mockResolvedValueOnce(mockFeature);

            await service.toggleTenantFeature(
                'tenant-123',
                'f0000000-0000-0000-0000-000000000001',
                true
            );

            expect(mockRequest).toHaveBeenNthCalledWith(
                1,
                '/api/platform/modules/tenant-features/?tenant_id=tenant-123',
                expect.objectContaining({ method: 'GET' })
            );
            expect(mockRequest).toHaveBeenNthCalledWith(
                2,
                '/api/platform/modules/tenant-features/',
                {
                    method: 'POST',
                    body: {
                        tenant: 'tenant-123',
                        feature: 'f0000000-0000-0000-0000-000000000001',
                        is_active: true
                    }
                }
            );
        });
    });
});
