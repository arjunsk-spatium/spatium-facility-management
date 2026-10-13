import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantNotFound from '../../components/tenant/TenantNotFound.vue';

// Mock useTheme
vi.mock('../../composables/useTheme', () => ({
    useTheme: () => ({
        colorMode: { value: 'light' },
        isDark: { value: false },
        toggleTheme: vi.fn(),
    })
}));

describe('TenantNotFound', () => {
    it('renders error title and attempted domain information', () => {
        const wrapper = mount(TenantNotFound, {
            props: {
                initialDomainInfo: {
                    fullHost: 'xyz.nexspace.app',
                    subdomain: 'xyz',
                    baseDomain: 'nexspace.app',
                    hasTenantSubdomain: true,
                    isLocalhost: false,
                    protocol: 'https:',
                    port: '',
                },
                errorMessage: 'Tenant not registered'
            }
        });

        expect(wrapper.text()).toContain('Tenant Not Registered');
        expect(wrapper.text()).toContain('xyz.nexspace.app');
        expect(wrapper.text()).toContain('HTTP 404');
        expect(wrapper.text()).toContain('xyz');
    });

    it('emits switch-to-finder event when Find Workspace button is clicked', async () => {
        const wrapper = mount(TenantNotFound, {
            props: {
                initialDomainInfo: {
                    fullHost: 'xyz.nexspace.app',
                    subdomain: 'xyz',
                    baseDomain: 'nexspace.app',
                    hasTenantSubdomain: true,
                    isLocalhost: false,
                    protocol: 'https:',
                    port: '',
                }
            }
        });

        const findBtn = wrapper.findAll('button').find(b => b.text().includes('Find Workspace'));
        expect(findBtn).toBeDefined();
        await findBtn!.trigger('click');

        expect(wrapper.emitted('switch-to-finder')).toBeTruthy();
    });

    it('emits retry event when Retry button is clicked', async () => {
        const wrapper = mount(TenantNotFound, {
            props: {
                initialDomainInfo: {
                    fullHost: 'xyz.nexspace.app',
                    subdomain: 'xyz',
                    baseDomain: 'nexspace.app',
                    hasTenantSubdomain: true,
                    isLocalhost: false,
                    protocol: 'https:',
                    port: '',
                }
            }
        });

        const retryBtn = wrapper.findAll('button').find(b => b.text().includes('Retry'));
        expect(retryBtn).toBeDefined();
        await retryBtn!.trigger('click');

        expect(wrapper.emitted('retry')).toBeTruthy();
    });
});
