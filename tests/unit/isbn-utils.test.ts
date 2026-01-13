/**
 * @agent tests
 * Tests unitaires pour les utilitaires ISBN
 */
import { describe, it, expect } from 'vitest';
import { normalizeISBN, convertISBN10to13, convertISBN13to10 } from '@/lib/isbn-utils';

describe('ISBN Utils', () => {
  describe('convertISBN10to13', () => {
    it('should convert valid ISBN-10 to ISBN-13', () => {
      const result = convertISBN10to13('2755671490');
      expect(result).toBe('9782755671490');
    });

    it('should handle ISBN-10 with dashes', () => {
      const result = convertISBN10to13('2-7556-7149-0');
      expect(result).toBe('9782755671490');
    });
  });

  describe('convertISBN13to10', () => {
    it('should convert ISBN-13 starting with 978 to ISBN-10', () => {
      const result = convertISBN13to10('9782755671490');
      expect(result).toBe('2755671490');
    });

    it('should return null for ISBN-13 starting with 979', () => {
      const result = convertISBN13to10('9791234567890');
      expect(result).toBe(null);
    });

    it('should handle ISBN-13 with dashes', () => {
      const result = convertISBN13to10('978-2-7556-7149-0');
      expect(result).toBe('2755671490');
    });
  });

  describe('normalizeISBN', () => {
    it('should convert ISBN-10 to both formats', () => {
      const result = normalizeISBN('2755671490');
      expect(result.isbn10).toBe('2755671490');
      expect(result.isbn13).toBe('9782755671490');
      expect(result.isValid).toBe(true);
    });

    it('should convert ISBN-13 to both formats', () => {
      const result = normalizeISBN('9782755671490');
      expect(result.isbn10).toBe('2755671490');
      expect(result.isbn13).toBe('9782755671490');
      expect(result.isValid).toBe(true);
    });

    it('should handle ISBN with dashes', () => {
      const result = normalizeISBN('978-2-7556-7149-0');
      expect(result.isbn13).toBe('9782755671490');
      expect(result.isValid).toBe(true);
    });

    it('should handle ISBN with spaces', () => {
      const result = normalizeISBN('978 2 7556 7149 0');
      expect(result.isbn13).toBe('9782755671490');
      expect(result.isValid).toBe(true);
    });

    it('should handle ISBN-14 ending with 0 (common error)', () => {
      const result = normalizeISBN('97827556714900');
      expect(result.isbn13).toBe('9782755671490');
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid ISBN (wrong length)', () => {
      const result = normalizeISBN('12345');
      expect(result.isValid).toBe(false);
      expect(result.isbn10).toBe(null);
      expect(result.isbn13).toBe(null);
    });

    it('should reject ISBN with letters', () => {
      const result = normalizeISBN('978ABC671490');
      expect(result.isValid).toBe(false);
    });

    it('should handle ISBN-13 with 979 prefix (no ISBN-10 equivalent)', () => {
      const result = normalizeISBN('9791234567890');
      expect(result.isbn10).toBe(null);
      expect(result.isbn13).toBe('9791234567890');
      expect(result.isValid).toBe(true);
    });

    it('should handle ISBN-10 with X checksum', () => {
      const result = normalizeISBN('043942089X');
      expect(result.isbn10).toBe('043942089X');
      expect(result.isValid).toBe(true);
    });
  });
});
