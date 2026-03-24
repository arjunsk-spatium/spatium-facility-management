// Server proxy for public visitor APIs.
// Does a clean fetch to the backend — only forwards X-TENANT-ID and Content-Type.
// Avoids CORS (same-origin) and X-Forwarded-For issues with Django rate limiter.
import {
    defineEventHandler,
    readBody,
    getHeaders,
    getQuery,
    setResponseStatus,
    setResponseHeaders,
} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const backendUrl = config.public.apiBaseUrl as string;
    const path = event.path || "";
    const method = event.method;

    // Build target URL
    const target = `${backendUrl}${path}`;

    // Only forward safe headers
    const incomingHeaders = getHeaders(event);
    const forwardHeaders: Record<string, string> = {};

    if (incomingHeaders["x-tenant-id"]) {
        forwardHeaders["X-TENANT-ID"] = incomingHeaders["x-tenant-id"];
    }
    if (incomingHeaders["content-type"]) {
        forwardHeaders["Content-Type"] = incomingHeaders["content-type"];
    }
    if (incomingHeaders["authorization"]) {
        forwardHeaders["Authorization"] = incomingHeaders["authorization"];
    }

    // Build fetch options
    const fetchOptions: RequestInit = {
        method,
        headers: forwardHeaders,
    };

    // Forward body for non-GET requests
    if (method !== "GET" && method !== "HEAD") {
        const contentType = incomingHeaders["content-type"] || "";
        if (contentType.includes("multipart/form-data")) {
            // Read as FormData and let fetch generate a new boundary Content-Type
            const { readFormData } = await import("h3");
            const formData = await readFormData(event);
            fetchOptions.body = formData as any;
            delete forwardHeaders["Content-Type"];
        } else {
            const body = await readBody(event);
            if (body) {
                fetchOptions.body = JSON.stringify(body);
            }
        }
    }

    try {
        const response = await fetch(target, fetchOptions);
        const data = await response.text();

        setResponseStatus(event, response.status);

        // Forward response content-type
        const respContentType = response.headers.get("content-type");
        if (respContentType) {
            setResponseHeaders(event, { "content-type": respContentType });
        }

        return data;
    } catch (error: any) {
        setResponseStatus(event, 502);
        return JSON.stringify({
            success: false,
            message: "Proxy error: " + error.message,
        });
    }
});
