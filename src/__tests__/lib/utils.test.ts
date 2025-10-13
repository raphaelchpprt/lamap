/**
 * Tests for utility functions
 *
 * Tests distance calculations, date formatting, and other helpers.
 */

import {
  calculateDistance,
  cn,
  formatDate,
  formatDistance,
  formatPhoneNumber,
  isValidEmail,
  isValidFrenchPhone,
  truncate,
} from '@/lib/utils';

describe('Utils', () => {
  describe('cn (className utility)', () => {
    it('should merge class names', () => {
      const result = cn('class1', 'class2');
      expect(result).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      const result = cn('base', false && 'hidden', 'visible');
      expect(result).toBe('base visible');
    });

    it('should merge Tailwind classes correctly', () => {
      const result = cn('px-2 py-1', 'px-4');
      expect(result).toContain('px-4');
      expect(result).not.toContain('px-2');
    });

    it('should handle undefined and null', () => {
      const result = cn('base', undefined, null, 'end');
      expect(result).toBe('base end');
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between Paris and Lyon', () => {
      // Paris: [2.3522, 48.8566]
      // Lyon: [4.8357, 45.7640]
      const paris: [number, number] = [2.3522, 48.8566];
      const lyon: [number, number] = [4.8357, 45.764];
      const distance = calculateDistance(paris, lyon);

      // Distance should be approximately 392 km
      expect(distance).toBeGreaterThan(390);
      expect(distance).toBeLessThan(395);
    });

    it('should return 0 for same coordinates', () => {
      const point: [number, number] = [2.3522, 48.8566];
      const distance = calculateDistance(point, point);
      expect(distance).toBe(0);
    });

    it('should handle coordinates at opposite sides of Earth', () => {
      // Maximum distance on Earth's surface (≈ 20,000 km)
      const point1: [number, number] = [0, 0];
      const point2: [number, number] = [180, 0];
      const distance = calculateDistance(point1, point2);
      expect(distance).toBeGreaterThan(19000);
      expect(distance).toBeLessThan(21000);
    });

    it('should handle negative coordinates', () => {
      const sydney: [number, number] = [151.2093, -33.8688];
      const buenosAires: [number, number] = [-58.3816, -34.6037];
      const distance = calculateDistance(sydney, buenosAires);
      // Sydney to Buenos Aires
      expect(distance).toBeGreaterThan(11000);
    });
  });

  describe('formatDate', () => {
    it('should format ISO date to French long format', () => {
      const result = formatDate('2025-01-15T10:30:00Z', 'long');
      expect(result).toContain('janvier');
      expect(result).toContain('2025');
    });

    it('should format ISO date to French short format', () => {
      const result = formatDate('2025-01-15T10:30:00Z', 'short');
      expect(result).toMatch(/15\/01\/2025/);
    });

    it('should handle Date objects', () => {
      const date = new Date('2025-01-15T10:30:00Z');
      const result = formatDate(date, 'short');
      expect(result).toContain('2025');
    });

    it('should format relative time for today', () => {
      const now = new Date();
      const result = formatDate(now, 'relative');
      expect(result).toBe("Aujourd'hui");
    });

    it('should format relative time for yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const result = formatDate(yesterday, 'relative');
      expect(result).toBe('Hier');
    });
  });

  describe('formatDistance', () => {
    it('should format distance less than 1 km in meters', () => {
      expect(formatDistance(0.5)).toBe('500 m');
      expect(formatDistance(0.123)).toBe('123 m');
    });

    it('should format distance greater than 1 km', () => {
      expect(formatDistance(15.3)).toContain('km');
      expect(formatDistance(100)).toContain('km');
    });

    it('should round distances correctly', () => {
      expect(formatDistance(0.999)).toBe('999 m');
      expect(formatDistance(1.5)).toContain('1,5');
    });
  });

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('no-at-sign.com')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('should handle undefined and null', () => {
      expect(isValidEmail(undefined as unknown as string)).toBe(false);
      expect(isValidEmail(null as unknown as string)).toBe(false);
    });
  });

  describe('isValidFrenchPhone', () => {
    it('should validate French phone numbers', () => {
      expect(isValidFrenchPhone('0123456789')).toBe(true);
      expect(isValidFrenchPhone('01 23 45 67 89')).toBe(true);
      expect(isValidFrenchPhone('+33123456789')).toBe(true);
      expect(isValidFrenchPhone('+33 1 23 45 67 89')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(isValidFrenchPhone('123')).toBe(false);
      expect(isValidFrenchPhone('abcdefghij')).toBe(false);
      expect(isValidFrenchPhone('0023456789')).toBe(false); // Starts with 00
    });

    it('should handle empty strings', () => {
      expect(isValidFrenchPhone('')).toBe(false);
    });

    it('should handle numbers with different separators', () => {
      expect(isValidFrenchPhone('01.23.45.67.89')).toBe(true);
      expect(isValidFrenchPhone('01-23-45-67-89')).toBe(true);
    });
  });

  describe('formatPhoneNumber', () => {
    it('should format French phone numbers', () => {
      const result = formatPhoneNumber('0123456789');
      expect(result).toBe('01 23 45 67 89');
    });

    it('should format international numbers', () => {
      const result = formatPhoneNumber('33123456789');
      expect(result).toContain('+33');
    });

    it('should handle already formatted numbers', () => {
      const input = '01 23 45 67 89';
      const result = formatPhoneNumber(input);
      expect(result).toContain('23');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      const result = truncate('This is a very long text', 10);
      expect(result).toBe('This is a ...');
      expect(result.length).toBe(13); // 10 + '...'
    });

    it('should not truncate short text', () => {
      const result = truncate('Short', 10);
      expect(result).toBe('Short');
    });

    it('should handle exact length', () => {
      const result = truncate('Exactly10!', 10);
      expect(result).toBe('Exactly10!');
    });
  });
});
