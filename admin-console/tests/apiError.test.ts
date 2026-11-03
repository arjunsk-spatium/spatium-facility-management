import { describe, it, expect } from 'vitest'
import { parseApiError } from '../app/composables/apiError'

const fetchError = (data: any, message = '[POST] "https://staging-api.nexspace.app/api/platform/banners/": 400') =>
    Object.assign(new Error(message), { data })

describe('parseApiError', () => {
    it('uses the backend field error instead of the raw ofetch message', () => {
        const error = fetchError({
            success: false,
            code: 'VALIDATION_ERROR',
            message: 'image: No file was submitted.',
            data: null,
            error: { type: 'VALIDATION', fields: { image: [{ code: 'REQUIRED', message: 'No file was submitted.' }] } },
        })

        const parsed = parseApiError(error, 'Failed to create banner')

        expect(parsed.message).toBe('Image: No file was submitted.')
        expect(parsed.fields).toEqual({ image: 'No file was submitted.' })
    })

    it('reads string field errors and errors sent under details', () => {
        const error = fetchError({
            message: 'Validation failed',
            error: { details: { link_title: ['Ensure this field has no more than 50 characters.'] } },
        })

        const parsed = parseApiError(error, 'Failed')

        expect(parsed.fields).toEqual({ link_title: 'Ensure this field has no more than 50 characters.' })
        expect(parsed.message).toBe('Link title: Ensure this field has no more than 50 characters.')
    })

    it('falls back to the backend message when there are no field errors', () => {
        const parsed = parseApiError(fetchError({ message: 'Banner limit reached' }), 'Failed')

        expect(parsed.message).toBe('Banner limit reached')
        expect(parsed.fields).toEqual({})
    })

    it('never shows the raw "[POST] url: 400" text', () => {
        const parsed = parseApiError(fetchError(undefined), 'Failed to create banner')

        expect(parsed.message).toBe('Failed to create banner')
    })

    it('keeps a plain error message such as a network failure', () => {
        const parsed = parseApiError(new Error('Network request failed'), 'Failed to create banner')

        expect(parsed.message).toBe('Network request failed')
    })

    it('shows the duplicate task error when creating privacy verification tasks', () => {
        const error = fetchError({
            success: false,
            code: 'VALIDATION_ERROR',
            message: "task_type: An active 'update_email' task already exists for this request.",
            data: null,
            error: {
                type: 'VALIDATION',
                fields: {
                    task_type: [{ code: 'INVALID', message: "An active 'update_email' task already exists for this request." }],
                },
            },
        }, '[POST] "https://staging-api.nexspace.app/api/platform/privacy/admin/tasks/": 400')

        const parsed = parseApiError(error, 'Failed to create verification tasks')

        expect(parsed.message).toBe("Task type: An active 'update_email' task already exists for this request.")
        expect(parsed.message).not.toContain('[POST]')
    })
})
