export interface Tenant {
  id: string;
  name: string;
  logoUrl: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

const MOCK_TENANTS: Record<string, Tenant> = {
  'tenant-a': {
    id: 'tenant-a',
    name: 'Acme Corp',
    logoUrl: 'https://placehold.co/200x50/3378ff/ffffff?text=Acme+Corp',
    colors: {
      primary: '#3378ff', // Blue
      secondary: '#64748b',
    },
  },
  'tenant-b': {
    id: 'tenant-b',
    name: 'Globex',
    logoUrl: 'https://placehold.co/200x50/10b981/ffffff?text=Globex',
    colors: {
      primary: '#10b981', // Green
      secondary: '#f59e0b',
    },
  },
};

export const useTenantService = () => {
  const getTenantById = async (id: string): Promise<Tenant | null> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_TENANTS[id] || MOCK_TENANTS['tenant-a'] || null; // Default to tenant-a
  };

  /**
   * Helper to derive tenant ID from current location/domain
   * For now, we will mock this or just return a default
   */
  const getCurrentTenantId = (): string => {
    // In real app, parse window.location.hostname
    // For now, let's hardcode or check query param if needed
    // Simple mock: return 'tenant-a' by default
    return 'tenant-b';
  };

  return {
    getTenantById,
    getCurrentTenantId,
  };
};
