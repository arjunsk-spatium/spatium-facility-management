import { describe, it, expect } from 'vitest'
import { useValidation } from './useValidation'

describe('useValidation', () => {
    describe('isValidEmail', () => {
        it('returns true for valid email addresses', () => {
            const { isValidEmail } = useValidation()
            expect(isValidEmail('user@example.com')).toBe(true)
            expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true)
        })

        it('returns false for invalid email addresses', () => {
            const { isValidEmail } = useValidation()
            expect(isValidEmail('not-an-email')).toBe(false)
            expect(isValidEmail('missing@domain')).toBe(false)
            expect(isValidEmail('')).toBe(false)
        })
    })

    describe('sanitizeError', () => {
        it('returns the string if error is a string', () => {
            const { sanitizeError } = useValidation()
            expect(sanitizeError('Something went wrong')).toBe('Something went wrong')
        })

        it('returns data.message when available', () => {
            const { sanitizeError } = useValidation()
            const error = { data: { message: 'Backend error' } }
            expect(sanitizeError(error)).toBe('Backend error')
        })

        it('returns the first field error for VALIDATION_ERROR type', () => {
            const { sanitizeError } = useValidation()
            const error = {
                data: {
                    error: {
                        type: 'VALIDATION_ERROR',
                        fields: {
                            username: [{ code: 'INVALID', message: 'Username is already taken within this tenant.' }]
                        }
                    }
                }
            }
            expect(sanitizeError(error)).toBe('Username is already taken within this tenant.')
        })

        it('returns the first field error for VALIDATION type', () => {
            const { sanitizeError } = useValidation()
            const error = {
                data: {
                    error: {
                        type: 'VALIDATION',
                        fields: {
                            email: [{ code: 'INVALID', message: 'Email is invalid.' }]
                        }
                    }
                }
            }
            expect(sanitizeError(error)).toBe('Email is invalid.')
        })

        it('handles USER_CREATION_ERROR with email domain mismatch', () => {
            const { sanitizeError } = useValidation()
            const error = {
                data: {
                    success: false,
                    code: 'USER_CREATION_ERROR',
                    message: 'Failed to create user.',
                    data: null,
                    error: {
                        type: 'VALIDATION_ERROR',
                        fields: {
                            email: [
                                {
                                    code: 'INVALID',
                                    message: 'Email domain must match the company domain (@gmail.com).'
                                }
                            ]
                        }
                    }
                }
            }
            expect(sanitizeError(error)).toBe('Email domain must match the company domain (@gmail.com).')
        })

        it('falls back to error.message', () => {
            const { sanitizeError } = useValidation()
            const error = { message: 'Network error' }
            expect(sanitizeError(error)).toBe('Network error')
        })

        it('returns default message for unknown errors', () => {
            const { sanitizeError } = useValidation()
            expect(sanitizeError(null)).toBe('An unexpected error occurred')
            expect(sanitizeError({})).toBe('An unexpected error occurred')
        })
    })

    describe('getValidationErrors', () => {
        it('returns an empty array when there are no field errors', () => {
            const { getValidationErrors } = useValidation()
            expect(getValidationErrors(null)).toEqual([])
            expect(getValidationErrors({})).toEqual([])
            expect(getValidationErrors({ data: {} })).toEqual([])
        })

        it('returns all field errors with field names', () => {
            const { getValidationErrors } = useValidation()
            const error = {
                data: {
                    error: {
                        type: 'VALIDATION_ERROR',
                        fields: {
                            username: [
                                { code: 'INVALID', message: 'Username is already taken within this tenant.' }
                            ],
                            email: [
                                { code: 'INVALID', message: 'Email is invalid.' },
                                { code: 'REQUIRED', message: 'Email is required.' }
                            ]
                        }
                    }
                }
            }
            expect(getValidationErrors(error)).toEqual([
                'username: Username is already taken within this tenant.',
                'email: Email is invalid.',
                'email: Email is required.'
            ])
        })
    })
})
