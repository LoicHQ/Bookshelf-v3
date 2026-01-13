/**
 * @agent backend-logic
 * Schémas de validation Zod réutilisables pour les API routes
 */
import { z } from 'zod';
import type { BookStatus } from '@/types';

/**
 * Schéma pour la création d'un livre
 */
export const createBookSchema = z.object({
  isbn: z.string().optional().nullable(),
  isbn13: z.string().optional().nullable(),
  title: z.string().min(1, 'Le titre est requis'),
  author: z.string().optional(),
  authors: z.array(z.string()).optional(),
  description: z.string().optional().nullable(),
  coverImage: z.string().url().optional().nullable().or(z.literal('')),
  thumbnail: z.string().url().optional().nullable().or(z.literal('')),
  publishedDate: z.string().optional().nullable(),
  publisher: z.string().optional().nullable(),
  pageCount: z.number().int().positive().optional().nullable(),
  categories: z.array(z.string()).optional().default([]),
  language: z.string().optional().nullable(),
  status: z
    .enum(['TO_READ', 'READING', 'COMPLETED', 'ABANDONED', 'ON_HOLD'])
    .optional()
    .default('TO_READ'),
});

export type CreateBookInput = z.infer<typeof createBookSchema>;

/**
 * Schéma pour les query params de recherche de livres
 */
export const searchBooksQuerySchema = z.object({
  q: z.string().min(1, 'Le paramètre q est requis').optional(),
  isbn: z.string().optional(),
  limit: z.coerce.number().int().positive().max(50).optional().default(10),
});

export type SearchBooksQuery = z.infer<typeof searchBooksQuerySchema>;

/**
 * Schéma pour les query params de liste des livres
 */
export const listBooksQuerySchema = z.object({
  status: z.enum(['TO_READ', 'READING', 'COMPLETED', 'ABANDONED', 'ON_HOLD']).optional(),
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  offset: z.coerce.number().int().nonnegative().optional().default(0),
});

export type ListBooksQuery = z.infer<typeof listBooksQuerySchema>;

/**
 * Schéma pour l'enregistrement d'un utilisateur
 */
export const registerUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
  name: z.string().min(1, 'Le nom est requis').optional(),
});

export type RegisterUserInput = z.infer<typeof registerUserSchema>;

/**
 * Schéma pour la connexion d'un utilisateur
 */
export const loginUserSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

export type LoginUserInput = z.infer<typeof loginUserSchema>;
