import { describe, it, expect } from 'vitest';
import { extractDomainInfo, buildTenantUrl } from '../../composables/domainUtils';

describe('domainUtils', () => {
    describe('extractDomainInfo', () => {
        it('identifies apex localhost without subdomain', () => {
            const info = extractDomainInfo('localhost:4000', 'http:');
            expect(info.isLocalhost).toBe(true);
            expect(info.hasTenantSubdomain).toBe(false);
            expect(info.subdomain).toBe('');
            expect(info.baseDomain).toBe('localhost:4000');
            expect(info.port).toBe('4000');
        });

        it('identifies 127.0.0.1 without subdomain', () => {
            const info = extractDomainInfo('127.0.0.1:4000', 'http:');
            expect(info.isLocalhost).toBe(true);
            expect(info.hasTenantSubdomain).toBe(false);
            expect(info.subdomain).toBe('');
        });

        it('identifies localhost with tenant subdomain', () => {
            const info = extractDomainInfo('acme.localhost:4000', 'http:');
            expect(info.isLocalhost).toBe(true);
            expect(info.hasTenantSubdomain).toBe(true);
            expect(info.subdomain).toBe('acme');
            expect(info.baseDomain).toBe('localhost:4000');
            expect(info.port).toBe('4000');
        });

        it('treats reserved subdomains on localhost as apex', () => {
            const info = extractDomainInfo('www.localhost:4000', 'http:');
            expect(info.hasTenantSubdomain).toBe(false);
            expect(info.subdomain).toBe('');
        });

        it('identifies apex internet domain without subdomain', () => {
            const info = extractDomainInfo('nexspace.app', 'https:');
            expect(info.isLocalhost).toBe(false);
            expect(info.hasTenantSubdomain).toBe(false);
            expect(info.subdomain).toBe('');
            expect(info.baseDomain).toBe('nexspace.app');
        });

        it('identifies internet domain with tenant subdomain', () => {
            const info = extractDomainInfo('acme.nexspace.app', 'https:');
            expect(info.isLocalhost).toBe(false);
            expect(info.hasTenantSubdomain).toBe(true);
            expect(info.subdomain).toBe('acme');
            expect(info.baseDomain).toBe('nexspace.app');
        });

        it('treats reserved subdomains on internet domains as apex', () => {
            const info = extractDomainInfo('www.nexspace.app', 'https:');
            expect(info.hasTenantSubdomain).toBe(false);
            expect(info.subdomain).toBe('');
            expect(info.baseDomain).toBe('nexspace.app');

            const portal = extractDomainInfo('portal.nexspace.app', 'https:');
            expect(portal.hasTenantSubdomain).toBe(false);
        });

        it('handles clean host with protocol and path gracefully', () => {
            const info = extractDomainInfo('https://xyz.domain.com/login?redirect=1', 'https:');
            expect(info.hasTenantSubdomain).toBe(true);
            expect(info.subdomain).toBe('xyz');
            expect(info.baseDomain).toBe('domain.com');
        });
    });

    describe('buildTenantUrl', () => {
        it('constructs localhost tenant url with port', () => {
            const domainInfo = extractDomainInfo('localhost:4000', 'http:');
            const url = buildTenantUrl('acme', domainInfo);
            expect(url).toBe('http://acme.localhost:4000');
        });

        it('constructs production tenant url', () => {
            const domainInfo = extractDomainInfo('nexspace.app', 'https:');
            const url = buildTenantUrl('acme', domainInfo);
            expect(url).toBe('https://acme.nexspace.app');
        });

        it('cleans invalid characters from subdomain input', () => {
            const domainInfo = extractDomainInfo('nexspace.app', 'https:');
            const url = buildTenantUrl('Acme_Corp 123!', domainInfo);
            expect(url).toBe('https://acmecorp123.nexspace.app');
        });

        it('returns empty string if subdomain is empty after sanitization', () => {
            const domainInfo = extractDomainInfo('nexspace.app', 'https:');
            const url = buildTenantUrl('   ', domainInfo);
            expect(url).toBe('');
        });
    });
});
