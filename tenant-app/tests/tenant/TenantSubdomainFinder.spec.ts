import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TenantSubdomainFinder from '../../components/tenant/TenantSubdomainFinder.vue';

// Mock useTheme
vi.mock('../../composables/useTheme', () => ({
    useTheme: () => ({
        colorMode: { value: 'light' },
        isDark: { value: false },
        toggleTheme: vi.fn(),
    })
}));

describe('TenantSubdomainFinder', () => {
    it('renders heading and instructions', () => {
        const wrapper = mount(TenantSubdomainFinder, {
            props: {
                initialDomainInfo: {
                    fullHost: 'nexspace.app',
                    subdomain: '',
                    baseDomain: 'nexspace.app',
                    hasTenantSubdomain: false,
                    isLocalhost: false,
                    protocol: 'https:',
                    port: '',
                }
            }
        });

        expect(wrapper.text()).toContain('Find your workspace');
        expect(wrapper.text()).toContain('Enter your organization\'s registered subdomain');
        expect(wrapper.text()).toContain('.nexspace.app');
    });

    it('shows preview URL when typing a valid subdomain', async () => {
        const wrapper = mount(TenantSubdomainFinder, {
            props: {
                initialDomainInfo: {
                    fullHost: 'nexspace.app',
                    subdomain: '',
                    baseDomain: 'nexspace.app',
                    hasTenantSubdomain: false,
                    isLocalhost: false,
                    protocol: 'https:',
                    port: '',
                }
            }
        });

        const input = wrapper.find('input#subdomain-input');
        await input.setValue('spatium');

        expect(wrapper.text()).toContain('https://spatium.nexspace.app');
        const submitBtn = wrapper.find('button[type="submit"]');
        expect(submitBtn.attributes('disabled')).toBeUndefined();
    });

    it('disables submit button when subdomain is too short', async () => {
        const wrapper = mount(TenantSubdomainFinder, {
            props: {
                initialDomainInfo: {
                    fullHost: 'localhost:4000',
                    subdomain: '',
                    baseDomain: 'localhost:4000',
                    hasTenantSubdomain: false,
                    isLocalhost: true,
                    protocol: 'http:',
                    port: '4000',
                }
            }
        });

        const input = wrapper.find('input#subdomain-input');
        await input.setValue('a');

        const submitBtn = wrapper.find('button[type="submit"]');
        expect(submitBtn.attributes('disabled')).toBeDefined();
    });
});
