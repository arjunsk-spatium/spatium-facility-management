import { describe, it, expect } from 'vitest';
import { useValidation } from './useValidation';

describe('useValidation', () => {
  const { isValidEmail, sanitizeError } = useValidation();

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@domain.com')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('plainaddress')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('Joe Smith <email@example.com>')).toBe(false);
      expect(isValidEmail('email.example.com')).toBe(false);
      expect(isValidEmail('email@example@example.com')).toBe(false);
    });
  });

  describe('sanitizeError', () => {
    it('should return message from Error object', () => {
      const error = new Error('Something went wrong');
      expect(sanitizeError(error)).toBe('Something went wrong');
    });

    it('should return message from object with data.message (Nuxt/Fetch error)', () => {
      const error = { data: { message: 'API Error' } };
      expect(sanitizeError(error)).toBe('API Error');
    });

    it('should return string error as is', () => {
      expect(sanitizeError('Just a string error')).toBe('Just a string error');
    });

    it('should return generic message for unknown objects', () => {
      expect(sanitizeError({})).toBe('An unexpected error occurred');
      expect(sanitizeError(null)).toBe('An unexpected error occurred');
    });
  });
});
