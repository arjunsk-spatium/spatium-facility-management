
export interface PortalUser {
    id: string;
    full_name: string;
    email: string;
    phone_number: string;
    apps: string[];
    tenant_id: string | null;
    status: string;
    app_name?: string;
    created_at?: string;
    updated_at?: string;
}
