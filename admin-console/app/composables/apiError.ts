export interface ParsedApiError {
    message: string
    fields: Record<string, string>
}

const firstFieldMessage = (value: any): string | undefined => {
    if (Array.isArray(value)) {
        for (const item of value) {
            const msg = firstFieldMessage(item)
            if (msg) return msg
        }
        return undefined
    }
    if (typeof value === 'string') return value || undefined
    if (value && typeof value === 'object' && typeof value.message === 'string') return value.message
    return undefined
}

const humanizeField = (field: string) =>
    field.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())

/**
 * Turns an ofetch error carrying the backend envelope
 * ({ message, error: { fields: { image: [{ message }] } } }) into a readable
 * message plus per-field messages. ofetch's own "[POST] url: 400" text is only
 * used when the backend sent nothing better.
 */
export const parseApiError = (error: any, fallback: string): ParsedApiError => {
    const data = error?.data
    const rawFields = data?.error?.fields || data?.error?.details || {}

    const fields: Record<string, string> = {}
    if (rawFields && typeof rawFields === 'object') {
        for (const [key, value] of Object.entries(rawFields)) {
            const msg = firstFieldMessage(value)
            if (msg) fields[key] = msg
        }
    }

    const [firstField] = Object.keys(fields)
    const fetchMessage = typeof error?.message === 'string' && !/^\[\w+\]\s/.test(error.message)
        ? error.message
        : undefined

    const message =
        (firstField ? `${humanizeField(firstField)}: ${fields[firstField]}` : undefined) ||
        (typeof data?.message === 'string' && data.message) ||
        fetchMessage ||
        fallback

    return { message, fields }
}
