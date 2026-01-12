import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchBookByISBN, searchBooks, searchGoogleBooks, searchOpenLibrary } from '@/lib/books-api';

// Mock fetch global
global.fetch = vi.fn();

describe('Books API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('fetchBookByISBN', () => {
    it('should normalize ISBN with 14 digits ending in 0 (auto-correct)', async () => {
      // Test avec ISBN mal formaté (14 chiffres se terminant par 0) - devrait être auto-corrigé
      const mockResponse = {
        ok: false,
        status: 404,
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      // La fonction normalise automatiquement, donc elle ne rejette pas mais retourne null
      const result = await fetchBookByISBN('97827556714900');
      expect(result).toBeNull();
    });

    it('should reject invalid ISBN formats', async () => {
      await expect(fetchBookByISBN('123')).rejects.toThrow('ISBN invalide');
      await expect(fetchBookByISBN('abc123')).rejects.toThrow('ISBN invalide');
      await expect(fetchBookByISBN('')).rejects.toThrow('ISBN invalide');
    });

    it('should normalize ISBN with dashes and spaces', async () => {
      const mockGoogleResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'test-id',
              volumeInfo: {
                title: 'Test Book',
                authors: ['Test Author'],
              },
            },
          ],
        }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockGoogleResponse as Response);

      const result = await fetchBookByISBN('978-2-7556-7149-0');
      expect(result).toBeTruthy();
      expect(result?.title).toBe('Test Book');
    });

    it('should return null when book is not found', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      const result = await fetchBookByISBN('9782070360028');
      expect(result).toBeNull();
    });
  });

  describe('searchGoogleBooks', () => {
    it('should search books via Google Books API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'test-id-1',
              volumeInfo: {
                title: 'Test Book 1',
                authors: ['Author 1'],
                industryIdentifiers: [
                  { type: 'ISBN_10', identifier: '1234567890' },
                  { type: 'ISBN_13', identifier: '9781234567890' },
                ],
              },
            },
          ],
        }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      const results = await searchGoogleBooks('test query', 1);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Test Book 1');
      expect(results[0].authors).toEqual(['Author 1']);
      expect(results[0].isbn).toBe('1234567890');
      expect(results[0].isbn13).toBe('9781234567890');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      await expect(searchGoogleBooks('test')).rejects.toThrow('Google Books API error');
    });

    it('should return empty array when no results', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({}),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      const results = await searchGoogleBooks('nonexistent');
      expect(results).toEqual([]);
    });
  });

  describe('searchOpenLibrary', () => {
    it('should search books via Open Library API', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          docs: [
            {
              key: '/works/OL123456W',
              title: 'Open Library Book',
              author_name: ['Open Author'],
              first_publish_year: 2020,
              cover_i: 123456,
              isbn: ['1234567890'],
            },
          ],
        }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      const results = await searchOpenLibrary('test', 1);
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Open Library Book');
      expect(results[0].authors).toEqual(['Open Author']);
      expect(results[0].publishedDate).toBe('2020');
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      await expect(searchOpenLibrary('test')).rejects.toThrow('Open Library search error');
    });
  });

  describe('searchBooks', () => {
    it('should use Google Books by default', async () => {
      const mockResponse = {
        ok: true,
        json: async () => ({
          items: [
            {
              id: 'test-id',
              volumeInfo: {
                title: 'Google Book',
                authors: ['Google Author'],
              },
            },
          ],
        }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockResponse as Response);

      const results = await searchBooks('test');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Google Book');
    });

    it('should fallback to Open Library when Google Books fails', async () => {
      const mockErrorResponse = {
        ok: false,
        status: 500,
      };
      const mockOpenLibraryResponse = {
        ok: true,
        json: async () => ({
          docs: [
            {
              key: '/works/OL123456W',
              title: 'Open Library Book',
              author_name: ['Open Author'],
            },
          ],
        }),
      };
      vi.mocked(fetch).mockResolvedValueOnce(mockErrorResponse as Response);
      vi.mocked(fetch).mockResolvedValueOnce(mockOpenLibraryResponse as Response);

      const results = await searchBooks('test');
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe('Open Library Book');
    });
  });
});
