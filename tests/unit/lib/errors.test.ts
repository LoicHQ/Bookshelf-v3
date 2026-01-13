/**
 * @agent tests
 * Tests unitaires pour les classes d'erreurs personnalisées
 */
import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ConflictError,
  errorToResponse,
} from '@/lib/errors';

describe('Errors', () => {
  describe('AppError', () => {
    it('should create error with default status code', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.code).toBeUndefined();
      expect(error.name).toBe('AppError');
    });

    it('should create error with custom status code and code', () => {
      const error = new AppError('Test error', 400, 'CUSTOM_CODE');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('CUSTOM_CODE');
    });
  });

  describe('ValidationError', () => {
    it('should create validation error with correct defaults', () => {
      const error = new ValidationError('Validation failed');
      expect(error.message).toBe('Validation failed');
      expect(error.statusCode).toBe(400);
      expect(error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional errors array', () => {
      const errors = [{ field: 'email', message: 'Invalid email' }];
      const error = new ValidationError('Validation failed', errors);
      expect(error.errors).toEqual(errors);
    });
  });

  describe('NotFoundError', () => {
    it('should create not found error with correct defaults', () => {
      const error = new NotFoundError('Book');
      expect(error.message).toBe('Book introuvable');
      expect(error.statusCode).toBe(404);
      expect(error.code).toBe('NOT_FOUND');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create unauthorized error with default message', () => {
      const error = new UnauthorizedError();
      expect(error.message).toBe('Non autorisé');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });

    it('should create unauthorized error with custom message', () => {
      const error = new UnauthorizedError('Access denied');
      expect(error.message).toBe('Access denied');
      expect(error.statusCode).toBe(401);
      expect(error.code).toBe('UNAUTHORIZED');
    });
  });

  describe('ConflictError', () => {
    it('should create conflict error', () => {
      const error = new ConflictError('Resource already exists');
      expect(error.message).toBe('Resource already exists');
      expect(error.statusCode).toBe(409);
      expect(error.code).toBe('CONFLICT');
    });
  });

  describe('errorToResponse', () => {
    it('should convert AppError to response', () => {
      const error = new ValidationError('Invalid input');
      const response = errorToResponse(error);
      expect(response).toEqual({
        error: 'Invalid input',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
    });

    it('should convert generic Error to response', () => {
      const error = new Error('Generic error');
      const response = errorToResponse(error);
      expect(response).toEqual({
        error: 'Generic error',
        statusCode: 500,
      });
    });

    it('should convert unknown error to default response', () => {
      const response = errorToResponse('string error');
      expect(response).toEqual({
        error: 'Une erreur inattendue est survenue',
        statusCode: 500,
      });
    });

    it('should convert null to default response', () => {
      const response = errorToResponse(null);
      expect(response).toEqual({
        error: 'Une erreur inattendue est survenue',
        statusCode: 500,
      });
    });
  });
});
