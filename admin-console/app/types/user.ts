
export interface PortalUser {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    app_name?: string;
    is_active?: boolean;
    created_at?: string;
    updated_at?: string;
}
