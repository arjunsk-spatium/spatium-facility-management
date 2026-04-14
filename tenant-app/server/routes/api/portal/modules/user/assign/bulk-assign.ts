import {
    defineEventHandler,
    readBody,
    getHeaders,
    setResponseStatus,
    setResponseHeaders,
} from "h3";

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig();
    const backendUrl = config.public.apiBaseUrl as string;
    const path = event.path || "";
    const method = event.method;

    const target = `${backendUrl}${path}`;

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

    const body = await readBody(event);

    const fetchOptions: RequestInit = {
        method,
        headers: forwardHeaders,
        body: JSON.stringify(body),
    };

    try {
        const response = await fetch(target, fetchOptions);
        const data = await response.text();

        setResponseStatus(event, response.status);

        const respContentType = response.headers.get("content-type");
        if (respContentType) {
            setResponseHeaders(event, { "content-type": respContentType });
        }

        return data;
    } catch (error: any) {
        setResponseStatus(event, 502);
        return JSON.stringify({
            success: false,
            code: "PROXY_ERROR",
            message: "Proxy error: " + error.message,
            data: null,
            error: error.message,
            meta: {
                request_id: "",
                timestamp: new Date().toISOString(),
            },
        });
    }
});
