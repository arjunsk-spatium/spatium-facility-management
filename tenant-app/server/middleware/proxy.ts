// Server-side proxy middleware to forward /api/* requests to the backend.
// This avoids browser CORS issues entirely since requests are proxied server-side.

export default defineEventHandler(async (event) => {
    const url = getRequestURL(event);

    if (!url.pathname.startsWith("/api/")) {
        return; // Let non-API requests pass through normally
    }

    // Inject X-TENANT-ID from cookie if the header is missing or empty
    const extraHeaders: Record<string, string> = {};
    const existingTenantId = getRequestHeader(event, "x-tenant-id");
    if (!existingTenantId) {
        const cookieHeader = getRequestHeader(event, "cookie") || "";
        const match = cookieHeader.match(/(?:^|;\s*)tenant_id=([^;]+)/);
        if (match?.[1]) {
            extraHeaders["x-tenant-id"] = match[1];
        }
    }

    const backendUrl = process.env.BACKEND_URL || "https://api.nexspace.app";
    const target = `${backendUrl}${url.pathname}${url.search}`;

    return proxyRequest(event, target, { headers: extraHeaders });
});
