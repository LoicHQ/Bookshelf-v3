/**
 * @agent tests
 * Tests unitaires pour les schémas de validation Zod
 */
import { describe, it, expect } from 'vitest';
import {
  createBookSchema,
  searchBooksQuerySchema,
  listBooksQuerySchema,
  registerUserSchema,
} from '@/lib/validation';

describe('Validation Schemas', () => {
  describe('createBookSchema', () => {
    it('should validate valid book data', () => {
      const validData = {
        title: 'Test Book',
        author: 'Test Author',
        isbn: '1234567890',
      };

      const result = createBookSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject missing title', () => {
      const invalidData = {
        author: 'Test Author',
      };

      const result = createBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('title');
      }
    });

    it('should accept optional fields', () => {
      const minimalData = {
        title: 'Test Book',
      };

      const result = createBookSchema.safeParse(minimalData);
      expect(result.success).toBe(true);
    });

    it('should validate status enum', () => {
      const validData = {
        title: 'Test Book',
        status: 'READING',
      };

      const result = createBookSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const invalidData = {
        title: 'Test Book',
        status: 'INVALID_STATUS',
      };

      const result = createBookSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchBooksQuerySchema', () => {
    it('should validate query with q parameter', () => {
      const validQuery = { q: 'test query' };
      const result = searchBooksQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should validate query with isbn parameter', () => {
      const validQuery = { isbn: '1234567890' };
      const result = searchBooksQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce limit to number', () => {
      const query = { q: 'test', limit: '5' };
      const result = searchBooksQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
      }
    });

    it('should enforce max limit', () => {
      const query = { q: 'test', limit: 100 };
      const result = searchBooksQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe('listBooksQuerySchema', () => {
    it('should validate valid query', () => {
      const validQuery = { status: 'READING', limit: 10, offset: 0 };
      const result = listBooksQuerySchema.safeParse(validQuery);
      expect(result.success).toBe(true);
    });

    it('should coerce limit and offset to numbers', () => {
      const query = { limit: '20', offset: '10' };
      const result = listBooksQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(typeof result.data.limit).toBe('number');
        expect(typeof result.data.offset).toBe('number');
      }
    });

    it('should reject negative offset', () => {
      const query = { offset: -1 };
      const result = listBooksQuerySchema.safeParse(query);
      expect(result.success).toBe(false);
    });
  });

  describe('registerUserSchema', () => {
    it('should validate valid user data', () => {
      const validData = {
        email: 'test@example.com',
        name: 'Test User',
      };

      const result = registerUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid email', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const result = registerUserSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('should accept email without name', () => {
      const validData = {
        email: 'test@example.com',
      };

      const result = registerUserSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });
});
