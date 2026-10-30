export interface DomainInfo {
    fullHost: string;
    subdomain: string;
    baseDomain: string;
    hasTenantSubdomain: boolean;
    isLocalhost: boolean;
    protocol: string;
    port: string;
}

export function extractDomainInfo(rawHost: string, protocol = 'https:'): DomainInfo {
    // Strip protocol and path if included
    let clean = (rawHost || '').trim().replace(/^https?:\/\//i, '').split('/')[0];
    const [host, port = ''] = clean.split(':');
    const portSuffix = port ? `:${port}` : '';

    const isLocalhost = host === 'localhost' || host.endsWith('.localhost') || host === '127.0.0.1';

    // 1. Pure localhost or IP without subdomain (e.g. localhost, localhost:4000, 127.0.0.1)
    if (host === 'localhost' || host === '127.0.0.1') {
        return {
            fullHost: clean,
            subdomain: '',
            baseDomain: `${host}${portSuffix}`,
            hasTenantSubdomain: false,
            isLocalhost: true,
            protocol: protocol === 'https:' ? 'http:' : protocol,
            port
        };
    }

    // 2. Subdomain on localhost, e.g. xyz.localhost:4000 or xyz.localhost
    if (host.endsWith('.localhost')) {
        const sub = host.slice(0, -'.localhost'.length);
        const isReserved = ['www', 'app', 'portal', 'admin'].includes(sub.toLowerCase());
        return {
            fullHost: clean,
            subdomain: isReserved ? '' : sub,
            baseDomain: `localhost${portSuffix}`,
            hasTenantSubdomain: !isReserved && !!sub,
            isLocalhost: true,
            protocol: protocol === 'https:' ? 'http:' : protocol,
            port
        };
    }

    // 3. Regular internet domain, e.g. xyz.domain.com, domain.com, xyz.nexspace.app
    const parts = host.split('.');

    // Apex / Root domain (e.g. domain.com or nexspace.app)
    if (parts.length <= 2) {
        return {
            fullHost: clean,
            subdomain: '',
            baseDomain: `${host}${portSuffix}`,
            hasTenantSubdomain: false,
            isLocalhost: false,
            protocol,
            port
        };
    }

    // Has 3 or more parts: e.g. [xyz, domain, com]
    const sub = parts[0];
    const isReserved = ['www', 'app', 'portal', 'admin'].includes(sub.toLowerCase());
    const base = parts.slice(1).join('.');

    return {
        fullHost: clean,
        subdomain: isReserved ? '' : sub,
        baseDomain: `${base}${portSuffix}`,
        hasTenantSubdomain: !isReserved && !!sub,
        isLocalhost: false,
        protocol,
        port
    };
}

export function buildTenantUrl(subdomain: string, domainInfo: DomainInfo): string {
    const cleanSub = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (!cleanSub) return '';

    if (domainInfo.isLocalhost) {
        const portSuffix = domainInfo.port ? `:${domainInfo.port}` : '';
        return `http://${cleanSub}.localhost${portSuffix}`;
    }

    // For non-localhost, avoid duplicating port if baseDomain already has it
    return `${domainInfo.protocol}//${cleanSub}.${domainInfo.baseDomain}`;
}
